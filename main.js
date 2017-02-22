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

//----------------------------------------------------
// var _candles = [];
// quandlService.getCandles({stock:'TECHM',endDate:new Date()}).then(function(candles){
//     // return indicators.sma(candles,'close',9);
//     console.log(customIndicators.distanceFromLowerPivot(candles));
// },function(error){
//     // return Promise.reject(error);
// }).then(function(sma){
//     // var smaSlope = customIndicators.slope(sma);
//     // smaSlope.forEach(function(datum){
//     //     console.log(datum.date+'\t'+datum.value);
//     // });
// },function(error){
//     // console.log(error);
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
            customIndicators.momentum(candles)
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
            'squeeze-off-since':values[0],
            'ma-crossed-above-since':values[1],
            'ma-crossed-below-since':values[2],
            'distance-from-lower-pivot':customIndicators.distanceFromLowerPivot(_candles),
            'momentum':momentumResults.value,
            'momentum-direction':momentumResults.direction,
            'momentum-direction-changed-since':momentumResults.directionChangedSince,
            'error':null
        });
    },function(error){
        logProcessedInfo({
            'id':stockPointer,
            'stock':stock,
            'date':null,
            'price':null,
            'squeeze-off-since':null,
            'ma-crossed-above-since':null,
            'ma-crossed-below-since':null,
            'distance-from-lower-pivot':null,
            'momentum':null,
            'momentum-direction':null,
            'momentum-direction-changed-since':null,
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
    processLogger.info(
        params['id']+' | '+
        params['stock']+' | '+
        params['date']+' | '+
        params['price']+' | '+
        params['squeeze-off-since']+' | '+
        params['ma-crossed-above-since']+' | '+
        params['ma-crossed-below-since']+' | '+
        params['distance-from-lower-pivot'] + ' | '+
        params['momentum']+' | '+
        params['momentum-direction']+' | '+
        params['momentum-direction-changed-since']+' | '+
        params['error']
    );
}