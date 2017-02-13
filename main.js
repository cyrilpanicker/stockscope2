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
var stockPointer = 0;
var currentDate = new Date();

functionalLogger.info('reading from file "'+stocksListFile+'"');

utils.readFile(stocksListFile).then(function(data){
    stocksList = JSON.parse(data);
    functionalLogger.info('processing started');
    processStocks();
},functionalLogger.error.bind(functionalLogger));

function processStocks(){
    var stock = stocksList[stockPointer].symbol;
    var _candles = [];
    quandlService.getCandles({stock:stock,endDate:currentDate}).then(function(candles){
        _candles = candles;
        return customIndicators.squeezeOffSince(candles);
    },function(error){
        return Promise.reject(error);
    }).then(function(squeezeOffSince){
        var lastCandle = _candles[_candles.length-1];
        logProcessedInfo({
            id:stockPointer,
            stock:stock,
            date:lastCandle.date,
            price:lastCandle.close,
            squeezeOffSince:squeezeOffSince,
            error:null
        });
    },function(error){
        logProcessedInfo({
            id:stockPointer,
            stock:stock,
            date:null,
            price:null,
            squeezeOffSince:null,
            error:error
        });
    }).then(function(){
        stockPointer++;
        if(stockPointer < stocksList.length){
            return utils.delay(5000);
        }else{
            return utils.delay(0);
        }
    }).then(function(){
        if(stockPointer < stocksList.length){
            processStocks();
        }else{
            functionalLogger.info('processing finished');
        }
    });
}

function logProcessedInfo(params) {
    processLogger.info(
        params.id+' | '+
        params.stock+' | '+
        params.date+' | '+
        params.price+' | '+
        params.squeezeOffSince+' | '+
        params.error
    );
}