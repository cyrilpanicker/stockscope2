var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');
var customIndicators = require('./services/customIndicators');
var candleStickPatterns = require('./services/candleStickPatterns');
var loggingService = require('./services/loggingService');
var helpers = require('./services/helpers');
var processLogger = loggingService.processLogger;
var functionalLogger = loggingService.functionalLogger;

var mode = process.env.NODE_ENV;
var stocksListFile = mode !== 'production' ? 'data/stocks-list.test.json' : 'data/stockslist-new.json' ;
var stocksList = [];
var stockPointer = 0;
var currentDate = new Date();
// var currentDate = new Date(2017,08,08);

//----------------------------------------------------
// var _candles = [];
// quandlService.getCandles({stock:'ADFFOODS',endDate:new Date(2017,08,10)}).then(function(candles){
//     return customIndicators.ema50PriceRatio(candles);
// },function(error){
//     return Promise.reject(error);
// }).then(function(supports){
//     console.log(supports);
//     // console.log(supports.slice(-10));
//     // console.log('----------');
//     // var filtered = supports.filter(support => support.value!=0);
//     // if(filtered.length){
//     //     console.log(filtered[filtered.length-1]);
//     // }else{
//     //     console.log('none');
//     // }
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
    var stock = stocksList[stockPointer].SYMBOL;
    var _candles = [];
    quandlService.getCandles({stock:stock,endDate:currentDate}).then(function(candles){
        _candles = candles;
        return Promise.all([
            // customIndicators.squeezeOffSince(candles),
            // customIndicators.maCrossedAboveSince(candles),
            // customIndicators.maCrossedBelowSince(candles),
            // customIndicators.momentum(candles),
            // customIndicators.support1(candles),
            // customIndicators.support2(candles),
            customIndicators.support1Since(candles),
            customIndicators.support2Since(candles),
            customIndicators.supportOverlapRatio(candles),
            customIndicators.previousSupportRatio(candles),
            customIndicators.priceSupportRatio(candles),
            indicators.ema(candles,'close',3),
            indicators.ema(candles,'close',15),
            customIndicators.easeOfMovement(candles,10000,14),
            indicators.diPlus(candles,14),
            indicators.diMinus(candles,14),
            indicators.adx(candles,14),
            indicators.sar(candles),
            indicators.macd(candles,'close',9,13,26),
            candleStickPatterns.getLatestCandleStickPattern(candles),
            customIndicators.emaHelper(candles,50),
            customIndicators.emaHelper(candles,200)
            // customIndicators.bbwLow1Since(candles),
            // customIndicators.bbwLow2Since(candles),
            // customIndicators.lowToBblowRatio(candles,21),
            // customIndicators.trendDetails(candles,20,2)
        ]);
    },function(error){
        return Promise.reject(error);
    }).then(function(values){
        var lastCandle = _candles[_candles.length-1];
        // var momentumResults = values[3][values[3].length-1];
        var ema3 = values[5][values[5].length-1].value.toFixed(2);
        var ema15 = values[6][values[6].length-1].value.toFixed(2);
        var eom = values[7][values[7].length-1].value.toFixed(2);
        var di_plus = values[8][values[8].length-1].value.toFixed(2);
        var di_minus = values[9][values[9].length-1].value.toFixed(2);
        var adx = values[10][values[10].length-1].value.toFixed(2);
        var sar = values[11][values[11].length-1].value.toFixed(2);
        var macd = values[12][values[12].length-1].macd.toFixed(2);
        var macd_signal = values[12][values[12].length-1].macdSignal.toFixed(2);
        var emaDiff = (ema3-ema15).toFixed(2);
        var diDiff = (di_plus-di_minus).toFixed(2);
        var sarLowDiff = (lastCandle.low - sar).toFixed(2);
        var macdHistogram = (macd - macd_signal).toFixed(2);
        var longSetup1Strength = getLongSetup1Strength(emaDiff,macdHistogram,sarLowDiff,eom,diDiff);
        var shortSetup1Strength = getShortSetup1Strength(emaDiff,macdHistogram,sarLowDiff,eom,diDiff);

        logProcessedInfo({
            'id':stockPointer,
            'stock':stock,
            'date':lastCandle.date,
            'open':lastCandle.open,
            'high':lastCandle.high,
            'low':lastCandle.low,
            'close':lastCandle.close,
            'count':_candles.length,
            // 'squeeze_off_since':values[0],
            // 'ma_crossed_above_since':values[1],
            // 'ma_crossed_below_since':values[2],
            // 'distance_from_lower_pivot':customIndicators.distanceFromLowerPivot(_candles),
            // 'momentum':momentumResults.value,
            // 'momentum_direction':momentumResults.direction,
            // 'momentum_direction_changed_since':momentumResults.directionChangedSince,
            // 'support1':values[4],
            // 'support2':values[5],
            'support1_since':values[0],
            'support2_since':values[1],
            'support_overlap_ratio':values[2],
            'previous_support_ratio':values[3],
            'price_support_ratio':values[4],
            'ema3':ema3,
            'ema15':ema15,
            'eom':eom,
            'di_plus':di_plus,
            'di_minus':di_minus,
            'adx':adx,
            'sar':sar,
            'macd':macd,
            'macd_signal':macd_signal,
            'ema_diff' : emaDiff,
            'di_diff' : diDiff,
            'sar_low_diff' : sarLowDiff,
            'macd_histogram' : macdHistogram,
            'long_setup1_strength':longSetup1Strength,
            'short_setup1_strength':shortSetup1Strength,
            'cdl':values[13].name,
            'cdl_strength':values[13].strength,
            'cdl_days_since':values[13].daysSince,
            'cdl_type0':values[13].testedType,
            'cdl_type1':values[13].theoreticalType,
            'ema50':values[14].value,
            'ema50_price_ratio':values[14].ratio,
            'ema200':values[15].value,
            'ema200_price_ratio':values[15].ratio,
            // 'bb_low1_since':values[5],
            // 'bb_low2_since':values[6],
            // 'low_to_bblow_ratio':values[7],
            // 'is_uptrend':values[8].is_uptrend,
            // 'trend_helper_price':values[8].trend_helper_price,
            // 'trend_changed_since':values[8].trend_changed_since,
            'error':null
        });
    },function(error){
        logProcessedInfo({
            'id':stockPointer,
            'stock':stock,
            'date':null,
            'price':null,
            'count':null,
            // 'squeeze_off_since':null,
            // 'ma_crossed_above_since':null,
            // 'ma_crossed_below_since':null,
            // 'distance_from_lower_pivot':null,
            // 'momentum':null,
            // 'momentum_direction':null,
            // 'momentum_direction_changed_since':null,
            // 'support1':null,
            // 'support2':null,
            'support1_since':null,
            'support2_since':null,
            'support_overlap_ratio':null,
            'previous_support_ratio':null,
            'price_support_ratio':null,
            'ema3':null,
            'ema15':null,
            'eom':null,
            'di_plus':null,
            'di_minus':null,
            'adx':null,
            'sar':null,
            'macd':null,
            'macd_signal':null,
            'ema_diff' :null,
            'di_diff' :null,
            'sar_low_diff' :null,
            'macd_histogram' :null,
            'long_setup1_strength':null,
            'short_setup1_strength':null,
            'cdl':null,
            'cdl_strength':null,
            'cdl_days_since':null,
            'cdl_type0':null,
            'cdl_type1':null,
            'ema50':null,
            'ema50_price_ratio':null,
            'ema200':null,
            'ema200_price_ratio':null,
            // 'bb_low1_since':null,
            // 'bb_low2_since':null,
            // 'low_to_bblow_ratio':null,
            // 'is_uptrend':null,
            // 'trend_helper_price':null,
            // 'trend_changed_since':null,
            'error':error
        });
    }).then(function(){
        stockPointer++;
        if(stockPointer < stocksList.length){
            return helpers.delay(1000);
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
    logMesssage = logMesssage.replace(/\s\|\s$/,'');
    processLogger.info(logMesssage);
}

function getLongSetup1Strength(emaDiff,macdHistogram,sarLowDiff,eom,diDiff){
    var result = 0;
    if(emaDiff>=0){
        result += 10;
    }
    if(macdHistogram>=0){
        result += 10;
    }
    if(sarLowDiff>=0){
        result += 10;
    }
    if(eom>=0){
        result += 10;
    }
    if(diDiff>=0){
        result += 10;
    }
    return result;
}

function getShortSetup1Strength(emaDiff,macdHistogram,sarLowDiff,eom,diDiff){
    var result = 0;
    if(emaDiff<0){
        result += 10;
    }
    if(macdHistogram<0){
        result += 10;
    }
    if(sarLowDiff<0){
        result += 10;
    }
    if(eom<0){
        result += 10;
    }
    if(diDiff<0){
        result += 10;
    }
    return result;
}