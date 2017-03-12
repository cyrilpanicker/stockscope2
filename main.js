var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');
var customIndicators = require('./services/customIndicators');
var loggingService = require('./services/loggingService');
var helpers = require('./services/helpers');
var processLogger = loggingService.processLogger;
var functionalLogger = loggingService.functionalLogger;

var mode = process.env.NODE_ENV;
var stocksListFile = mode !== 'production' ? 'data/stocks-list.test.json' : 'data/stocks-list.json' ;
var stocksList = [];
var stockPointer = 0;
var currentDate = new Date();
// var currentDate = new Date(2017,2,5);

//----------------------------------------------------
// var _candles = [];
// quandlService.getCandles({stock:'MMTC',endDate:new Date()}).then(function(candles){
//     return customIndicators.support1(candles)
// },function(error){
//     return Promise.reject(error);
// }).then(function(support){
//     console.log(support);
//     // supports.forEach(function(datum){
//     //     console.log(datum.date+'\t'+datum.value);
//     // });
// },function(error){
//     console.log(error);
// });
//----------------------------------------------------

functionalLogger.info('reading from file "'+stocksListFile+'"');

helpers.readFile(stocksListFile).then(function(data){
    stocksList = JSON.parse(data);
    functionalLogger.info('processing started');
    processStocks();
},functionalLogger.error.bind(functionalLogger));

function processStocks(){
    var stock = stocksList[stockPointer].symbol;
    var _candles = [];
    quandlService.getCandles({stock:stock,endDate:currentDate}).then(function(candles){
        _candles = candles;
        return Promise.all([
            customIndicators.squeezeOffSince(candles),
            customIndicators.maCrossedAboveSince(candles),
            customIndicators.maCrossedBelowSince(candles),
            customIndicators.momentum(candles),
            customIndicators.support1(candles),
            customIndicators.support2(candles),
            customIndicators.support1Since(candles),
            customIndicators.support2Since(candles),
            customIndicators.supportOverlapRatio(candles)
        ]);
    },function(error){
        return Promise.reject(error);
    }).then(function(values){
        var lastCandle = _candles[_candles.length-1];
        var momentumResults = values[3][values[3].length-1];
        logProcessedInfo({
            'id':stockPointer,
            'stock':stock,
            'date':lastCandle.date,
            'price':lastCandle.close,
            'squeeze_off_since':values[0],
            'ma_crossed_above_since':values[1],
            'ma_crossed_below_since':values[2],
            'distance_from_lower_pivot':customIndicators.distanceFromLowerPivot(_candles),
            'momentum':momentumResults.value,
            'momentum_direction':momentumResults.direction,
            'momentum_direction_changed_since':momentumResults.directionChangedSince,
            'support1':values[4],
            'support2':values[5],
            'support1_since':values[6],
            'support2_since':values[7],
            'support_overlap_ratio':values[8],
            'error':null
        });
    },function(error){
        logProcessedInfo({
            'id':stockPointer,
            'stock':stock,
            'date':null,
            'price':null,
            'squeeze_off_since':null,
            'ma_crossed_above_since':null,
            'ma_crossed_below_since':null,
            'distance_from_lower_pivot':null,
            'momentum':null,
            'momentum_direction':null,
            'momentum_direction_changed_since':null,
            'support1':null,
            'support2':null,
            'support1_since':null,
            'support2_since':null,
            'support_overlap_ratio':null,
            'error':error
        });
    }).then(function(){
        stockPointer++;
        if(stockPointer < stocksList.length){
            return helpers.delay(5000);
        }else{
            return helpers.delay(0);
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
    var logMesssage = '';
    for(var param in params){
        if(params.hasOwnProperty(param)){
            logMesssage = logMesssage + param + '='+ params[param] + ' | ';
        }
    }
    processLogger.info(logMesssage);
}