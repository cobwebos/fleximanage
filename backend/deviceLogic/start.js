// flexiWAN SD-WAN software - flexiEdge, flexiManage. For more information go to https://flexiwan.com
// Copyright (C) 2019  flexiWAN Ltd.

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

// Logic to start/stop a device
const configs = require('../configs')();
const deviceStatus = require('../periodic/deviceStatus')();
const { validateDevice } = require('./validators');
const tunnelsModel = require('../models/tunnels');
const deviceQueues = require('../utils/deviceQueue')(configs.get('kuePrefix'),configs.get('redisUrl'));
const mongoose = require('mongoose');
const createError = require('http-errors');
const logger = require('../logging/logging')({module: module.filename, type: 'req'});
const {getMajorVersion} = require('../versioning');

/**
 * Creates and queues the start-router job.
 * @param  {Array}    device an array of the devices to be modified
 * @param  {Object}   req    express request object
 * @param  {Object}   res    express response object
 * @param  {Callback} next   express next() callback
 * @return {void}
 */
const apply = (device, req, res, next) => {
    logger.info("Starting device:", {params: {machineId: device[0].machineId}, req: req});

    const deviceValidator = validateDevice(device[0]);
    if (!deviceValidator.valid) {
        logger.warn('Start command validation failed',
            {params: {device: device[0], err: deviceValidator.err},
            req: req});
        return next(createError(400, deviceValidator.err));
    }

    deviceStatus.setDeviceStatsField(device[0].machineId, 'state', 'pending');
    const majorAgentVersion = getMajorVersion(device[0].versions.agent);
    const startParams = {};
    let ifnum = 0;

    if (majorAgentVersion === 0) {    // version 0.X.X
        for (let idx=0; idx<device[0].interfaces.length; idx++) {
            const intf = device[0].interfaces[idx];
            const ifParams = {};
            if (intf.isAssigned === true) {
                ifnum ++;
                ifParams['pci'] = intf.pciaddr;
                ifParams['addr'] = `${intf.IPv4}/${intf.IPv4Mask}`;
                if (intf.routing === "OSPF") ifParams['routing'] = "ospf";
                if (intf.type === "WAN" && intf.routing.toUpperCase() === "NONE")
                    startParams['default-route'] = device[0].defaultRoute;
                startParams['iface'+(ifnum)] = ifParams;
            }
        }
    } else if (majorAgentVersion >= 1) {    // version 1.X.X+
        const interfaces = [];
        const routes = [];
        for (let idx=0; idx<device[0].interfaces.length; idx++) {
            const intf = device[0].interfaces[idx];
            const ifParams = {};
            const routeParams = {};
            if (intf.isAssigned === true) {
                ifParams['pci'] = intf.pciaddr;
                ifParams['addr'] = `${intf.IPv4}/${intf.IPv4Mask}`;
                ifParams['type'] = intf.type;
                if (intf.routing === "OSPF") ifParams['routing'] = "ospf";
                if (intf.type === "WAN" && intf.routing.toUpperCase() === "NONE") {  // Only if WAN defined and no other routing defined
                    routeParams['addr'] = "default";
                    routeParams['via'] = device[0].defaultRoute;
                    routes.push(routeParams);
                }
                interfaces.push(ifParams);
            }
        }
        startParams['interfaces'] = interfaces;
        startParams['routes'] = routes;
    }

    // Start router command might change IP address of the
    // interface connected to the MGMT. Tell the agent to
    // reconnect to the MGMT after processing this command.
    startParams.reconnect = true;

    const tasks = [];
    const user = req.user.username;
    const org = req.user.defaultOrg._id.toString();
    const mId = device[0].machineId;

    tasks.push({"entity":"agent","message":"start-router","params":startParams});

    deviceQueues.addJob(mId, user, org,
        // Data
        {'title':'Start device '+device[0].hostname, 'tasks':tasks},
        // Response data
        {method:'start', data:{'device':device[0]._id, 'org':org, 'shouldUpdateTunnel':(majorAgentVersion===0)}},
        // Metadata
        {priority:'medium', attempts:1, removeOnComplete:false},
        // Complete callback
        null)
    .then((job) => {
        logger.info("Start device job queued", {job: job, req: req});
        res.status(200).send({'ok':1});
    })
    .catch((err) => {
        next(err);
    });
};

/**
 * Called when start device job completed and
 * marks tunnels for this device as "not connected".
 * @param  {number} jobId Kue job ID number
 * @param  {Object} res   device object ID and organization
 * @return {void}
 */
const complete = (jobId, res) => {
    logger.info("Start Machine complete", {params: {result: res, jobId: jobId}});
    if (!res || !res.device || !res.org) {
        logger.warn('Got an invalid job result', {params: {result: res, jobId: jobId}});
        return;
    }
    // Get all device tunnels and mark them as not connected
    // shouldUpdateTunnel is set for agent v0.X.X where tunnel status is not checked, therefore updating according to the DB status
    if (res.shouldUpdateTunnel) {
        tunnelsModel
        .updateMany(
            // Query
            { 'isActive':true,
            $or: [{'deviceAconf':true}, {'deviceBconf':true}],
            $or: [{'deviceA':mongoose.Types.ObjectId(res.device)},
                    {'deviceB':mongoose.Types.ObjectId(res.device)}],
            'org':res.org},
            // Update
            {'deviceAconf':false, 'deviceBconf':false},
            // Options
            {upsert: false})
        .then((resp) => {
            logger.debug('Updated tunnels info in db', {params:{jobId: jobId, response: resp}});
            if (resp != null) {
                logger.info("Updated device tunnels status to not-connected", {
                    params: {jobId: jobId, device: res.device}
                });
                return;
            } else {
                throw new Error("Update tunnel connected status failure");
            }
        }, (err) => {
            logger.error('Start device callback failed', {params: {jobId: jobId, err: err.message}});
        })
        .catch((err) => {
            logger.error('Start device callback failed', {params: {jobId: jobId, err: err.message}});
        });
    }
};

module.exports = {
    apply: apply,
    complete: complete
};
