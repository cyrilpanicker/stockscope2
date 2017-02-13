var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');
var customIndicators = require('./services/customIndicators');
var loggingService = require('./services/loggingService');
var utils = require('./services/utils');
var processLogger = loggingService.processLogger;
var functionalLogger = loggingService.functionalLogger;

var mode = process.env.NODE_ENV;
var stocksListFile = mode !== 'production' ? 'data/stocks-list.test.json' : 'data/stocks-list.json' ;
var stocksList = [];

functionalLogger.info('reading from file "'+stocksListFile+'"');

utils.readFile(stocksListFile).then(function(data){
    stocksList = JSON.parse(data);
    functionalLogger.info('processing started');
},functionalLogger.error.bind(functionalLogger));

function logProcessedInfo(params) {
    processLogger.info(
        params.id+' | '+
        params.stock+' | '+
        params.date+' | '+
        params.price+' | '+
        params.squeeze
    );
}