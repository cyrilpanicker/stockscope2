var talib = require('talib');

exports.tasukiGap = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLTASUKIGAP',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeWhiteSoldiers = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3WHITESOLDIERS',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.upSideGapTwoCrows = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLUPSIDEGAP2CROWS',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.breakAway = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLBREAKAWAY',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};


exports.morningStar = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLMORNINGSTAR',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.longLineCandle = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLLONGLINE',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.hangingMan = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLHANGINGMAN',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.hammer = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLHAMMER',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.doji = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLDOJI',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.abandonedBaby = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLABANDONEDBABY',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

function responseHandler(candles,resolve,reject,response){
    if(!response.result){
        reject('error');
    } else {
        var result = [];
        var _candles = candles.slice(response.begIndex);
        for(var i = 0; i<_candles.length; i++){
            result.push({
                date:_candles[i].date,
                value:response.result.outInteger[i]
            });
        }
        resolve(result);
    }
}