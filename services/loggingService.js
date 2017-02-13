var moment = require('moment');
var winston = require('winston');
var _ = require('lodash');

var processLogFile = './logs/process.log';
var functionalLogFile = './logs/functional.log';

var defaultLoggerTransportOptions = {
    timestamp:timestamp,
    formatter:formatter,
    json:false
}

exports.processLogger = (function(){
    var transportOptions = _.assign({},defaultLoggerTransportOptions,{filename:processLogFile});
    var loggerOptions = {transports:[new winston.transports.File(transportOptions)]};
    return new winston.Logger(loggerOptions);
})();

exports.functionalLogger = (function(){
    var transportOptions = _.assign({},defaultLoggerTransportOptions,{filename:functionalLogFile});
    var loggerOptions = {transports:[new winston.transports.File(transportOptions)]};
    return new winston.Logger(loggerOptions);
})();

function formatter(options) {
    return options.timestamp()+' | '+options.level.toUpperCase() + ' | '+options.message;
}

function timestamp() {
    return moment(new Date()).format('MM/DD HH:mm:ss');
}