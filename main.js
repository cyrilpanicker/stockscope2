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
// quandlService.getCandles({stock:'PNB',endDate:new Date()}).then(function(candles){
//     return customIndicators.support2Since(candles);
// },function(error){
//     return Promise.reject(error);
// }).then(function(supports){
//     // supports.forEach(function(datum){
//     //     console.log(datum.date+'\t'+datum.value);
//     // });
//     console.log(supports);
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
            customIndicators.support2Since(candles)
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
            'support1':values[4],
            'support2':values[5],
            'support1-since':values[6],
            'support2-since':values[7],
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
            'support1':null,
            'support2':null,
            'support1-since':null,
            'support2-since':null,
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
        params['support1']+' | '+
        params['support2']+' | '+
        params['support1-since']+' | '+
        params['support2-since']+' | '+
        params['error']
    );
}