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

/****************************************************************************
 * This module specifies the server configuration for different environments
 * The server uses the default configuration
 * The default configuration is overridden by running with the environment
 * variable in npm:  npm start <environment>
 ****************************************************************************/
const os = require('os');
const hostname = os.hostname();
const config_env = {
    // This is the default configuration, override by the following sections
    'default': {
        // URL of the rest server
        'restServerURL': 'https://local.flexiwan.com:3443',
        // URL of the UI server
        'UIServerURL': 'https://local.flexiwan.com:3000',
        // Key used for users tokens, override default with environment variable USER_SECRET_KEY
        'userTokenSecretKey': 'abcdefg1234567',
        // The duration of the user JWT token in seconds
        'userTokenExpiration': 300,
        // The duration of the user refresh token in seconds
        'userRefreshTokenExpiration': 604800,
        // Key used for device tokens, override default with environment variable DEVICE_SECRET_KEY
        'deviceTokenSecretKey': 'abcdefg1234567',
        // Key used to validate google captcha token, generated at https://www.google.com/u/1/recaptcha/admin/create
        // Default value is not set, which only validate the client side captcha
        'captchaKey': '',
        // Mongo main database
        'mongoUrl': 'mongodb://localhost:27017/flexiwan',
        // Mongo analytics database
        'mongoAnalyticsUrl': 'mongodb://localhost:27017/flexiwanAnalytics',
        // Mongo Billing database
        'mongoBillingUrl': 'mongodb://localhost:27017/flexibilling',
        // Billing Redirect OK page url
        'billingRedirectOkUrl': 'https://local.flexiwan.com/ok.html',
        // Biling config site - this is used as the billing site name in ChargeBee
        'billingConfigSite': 'flexiwan-test',
        // ChargeBee default plan for a new customer
        'billingDefaultPlan': 'enterprise',
        // Wheter to enable billing
        'useFlexiBilling': false,
        // API key for ChargeBee Billing config site. Not used when useFlexiBilling is false
        'billingApiKey': '',
        // Use flexibilling charger scheduler to close invoices automatically
        // when set to "false", invoices should be closed manually
        'useBillingCharger': false,
        // Use automatic charges collection
        'autoCollectionCharges': "off", // "on" or "off"
        // Redis host and port, override default with environment variable REDIS_URL
        'redisUrl': 'redis://localhost:6379',
        // Redis connectivity options
        'redisTotalRetryTime': 1000 * 60 * 60,
        'redisTotalAttempts': 10,
        // Kue prefix
        'kuePrefix': 'deviceq',
        // HTTP port of the node server. On production we usually forward port 80 to this port using:
        // sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
        'httpPort': 3000,
        // HTTPS port of the node server. On production weWe usually forward port 443 to this port using:
        // sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 443 -j REDIRECT --to-port 3443
        'httpsPort': 3443,
        // This port is used when redirecting the client
        // In production it can be set
        'redirectHttpsPort': 3443,
        // Should we redirect to https, should be set to false if running behind a secure proxy such as CloudFlare
        'shouldRedirectHTTPS': true,
        // Certificate key location, under bin directory
        // On production if the key located in the Let's encrypt directory, it's possible to link to it using:
        // sudo ln -s /etc/letsencrypt/live/app.flexiwan.com/privkey.pem ~/FlexiWanSite/bin/cert.app.flexiwan.com/domain.key
        'httpsCertKey': '/cert.local.flexiwan.com/domain.key',
        // Certificate location, under bin directory
        // On production if the key located in the Let's encrypt directory, it's possible to link to it using:
        // sudo ln -s /etc/letsencrypt/live/app.flexiwan.com/fullchain.pem ~/FlexiWanSite/bin/cert.app.flexiwan.com/certificate.pem
        'httpsCert': '/cert.local.flexiwan.com/certificate.pem',
        // Default agent broker the device tries to create connection for
        // The agent is sent to the device when it registers
        'agentBroker': 'local.flexiwan.com:3443',
        // Whitelist of allowed domains for CORS checks
        'corsWhiteList': ['http://local.flexiwan.com:3000', 'https://local.flexiwan.com:3000', 'https://local.flexiwan.com:3443', 'https://127.0.0.1:3000'],
        // Client static root directory
        'clientStaticDir': 'public',
        // Mgmt-Agent protocol version
        'agentApiVersion': '1.0.0',
        // Mgmt log files
        'logFilePath': './logs/app.log',
        'reqLogFilePath': './logs/req.log',
        // Logging default level
        'logLevel': 'verbose',
        // Hostname of SMTP server - for sending mails
        'mailerHost': '127.0.0.1',
        // Port of SMTP server
        'mailerPort': 25,
        // Bypass mailer certificate validation
        'mailerBypassCert': false,
        // Software version query link
        'SwRepositoryUrl': 'https://deb.flexiwan.com/info/flexiwan-router/latest',
        // Software version update email link. ${version} is replaced in run time
        'SwVersionUpdateUrl': 'https://sandbox.flexiwan.com/Templates/notification_email_${version}.json',
        // Web hooks add user URL, used to send for new uses, '' to bypass hook
        'webHookAddUserURL':'',
        // Web hooks add user secret, send in addition to the message for filtering
        'webHookAddUserSecret': 'ABC',
    },

    // Override for development environment, default environment if not specified
    'development': {
        'clientStaticDir': 'client/build',
        'mongoUrl': `mongodb://${hostname}:27017,${hostname}:27018,${hostname}:27019/flexiwan?replicaSet=rs`,
        'mongoBillingUrl': `mongodb://${hostname}:27017,${hostname}:27018,${hostname}:27019/flexibilling?replicaSet=rs`,
        'mongoAnalyticsUrl': `mongodb://${hostname}:27017,${hostname}:27018,${hostname}:27019/flexiwanAnalytics?replicaSet=rs`,
        'mailerBypassCert': true,
        'SwRepositoryUrl': 'https://deb.flexiwan.com/info/flexiwan-router/latest-testing',
        'userTokenExpiration': 604800,
        'useFlexiBilling': false,
        'logLevel': 'debug',
        'mailerPort': 1025,
    },
    'testing': {
        // Mgmt-Agent protocol version for testing purposes
        'agentApiVersion': '2.0.0',
        // Kue prefix
        'kuePrefix': 'testq',
    },

    // Override for production environment
    'production': {
        'restServerURL': 'https://app.flexiwan.com:443',
        'UIServerURL': 'https://app.flexiwan.com:443',
        'shouldRedirectHTTPS': false,
        'redirectHttpsPort': 443,
        'agentBroker': 'app.flexiwan.com:443',
        'clientStaticDir': 'client/build',
        //'billingConfigSite': 'flexiwan-test',
        //'billingDefaultPlan': 'enterprise',
        //'useFlexiBilling': true,
        'logFilePath': '/var/log/flexiwan/flexiwan.log',
        'reqLogFilePath': '/var/log/flexiwan/flexiwanReq.log',
        'billingRedirectOkUrl': 'https://app.flexiwan.com/ok.html',
        'logLevel': 'info',
        'logUserName': true,
        'corsWhiteList': ['https://app.flexiwan.com:443', 'http://app.flexiwan.com:80']
    },

    // Override for manage environment for production
    'manage': {
        'restServerURL': 'https://manage.flexiwan.com:443',
        'UIServerURL': 'https://manage.flexiwan.com:443',
        'shouldRedirectHTTPS': false,
        'redirectHttpsPort': 443,
        'kuePrefix': 'mngdeviceq',
        'agentBroker': 'manage.flexiwan.com:443',
        'clientStaticDir': 'client/build',
        'logFilePath': '/var/log/flexiwan/flexiwan.log',
        'reqLogFilePath': '/var/log/flexiwan/flexiwanReq.log',
        'billingConfigSite': 'flexiwan',   // TBD: Modify
        'billingDefaultPlan': 'enterprise-test',   // TBD: Modify
        'useFlexiBilling': true,
        'billingRedirectOkUrl': 'https://manage.flexiwan.com/ok.html',
        'SwRepositoryUrl': 'https://deb.flexiwan.com/info/flexiwan-router/latest-testing',   // TBD: Modify
        'logLevel': 'info',
        'logUserName': true,
        'corsWhiteList': ['https://manage.flexiwan.com:443', 'http://manage.flexiwan.com:80']
    },

    // Override for appqa01 environment
    'appqa01': {
        'restServerURL': 'https://appqa01.flexiwan.com:443',
        'UIServerURL': 'https://appqa01.flexiwan.com:443',
        'shouldRedirectHTTPS': false,
        'redirectHttpsPort': 443,
        'userTokenExpiration': 300,
        'userRefreshTokenExpiration': 86400,
        'agentBroker': 'appqa01.flexiwan.com:443',
        'clientStaticDir': 'client/build',
        'logFilePath': '/var/log/flexiwan/flexiwan.log',
        'reqLogFilePath': '/var/log/flexiwan/flexiwanReq.log',
        'billingConfigSite': 'flexiwan-test',
        'billingDefaultPlan': 'enterprise',
        'useFlexiBilling': true,
        'billingRedirectOkUrl': 'https://appqa01.flexiwan.com/ok.html',
        'SwRepositoryUrl': 'https://deb.flexiwan.com/info/flexiwan-router/latest-testing',
        'logLevel': 'info',
        'logUserName': true,
        'corsWhiteList': ['https://appqa01.flexiwan.com:443', 'http://appqa01.flexiwan.com:80']
    }
};

class Configs {
    constructor() {
        const environment = this.getEnv();
        console.log("environment=" + environment );
        const combined_config = {...config_env.default, ...config_env[environment], 'environment':environment};
        // Override with environment variables
        combined_config['userTokenSecretKey'] = process.env.USER_SECRET_KEY || combined_config['userTokenSecretKey'];
        combined_config['deviceTokenSecretKey'] = process.env.DEVICE_SECRET_KEY || combined_config['deviceTokenSecretKey'];
        combined_config['captchaKey'] = process.env.CAPTCHA_KEY || combined_config['captchaKey'];
        combined_config['mongoUrl'] = process.env.MONGO_URL || combined_config['mongoUrl'];
        combined_config['mongoBillingUrl'] = process.env.MONGO_BILLING_URL || combined_config['mongoBillingUrl'];
        combined_config['mongoAnalyticsUrl'] = process.env.MONGO_ANALYTICS_URL || combined_config['mongoAnalyticsUrl'];
        combined_config['billingApiKey'] = process.env.FLEXIBILLING_API_KEY || combined_config['billingApiKey'];
        combined_config['redisUrl'] = process.env.REDIS_URL || combined_config['redisUrl'];
        combined_config['webHookAddUserURL'] = process.env.WEBHOOK_ADD_USER_URL || combined_config['webHookAddUserURL'];
        combined_config['webHookAddUserSecret'] = process.env.WEBHOOK_ADD_USER_KEY || combined_config['webHookAddUserSecret'];

        this.config_values = combined_config;
        console.log("Configuration used:\n" + JSON.stringify(this.config_values, null, 2));
    }

    getEnv() {
        if (process.argv[1].indexOf('jest') !== -1) return 'testing';
        return process.argv[2] || "development";
    }

    get(key) {
        return this.config_values[key];
    }

    getAll() {
        return this.config_values;
    }

}

var configs = null;
module.exports = function () {
    if (configs) return configs;
    else {
        configs = new Configs();
        return configs;
    }
};
