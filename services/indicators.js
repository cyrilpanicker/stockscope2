var talib = require('talib');

exports.sma = function(data,property,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'SMA',
            inReal:data.map(function(datum){return datum[property];}),
            startIdx:0,
            endIdx:data.length-1,
            optInTimePeriod:period
        },responseHandler.bind(null,data,resolve,reject));
    });
};

exports.stdDev = function(data,property,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'STDDEV',
            inReal:data.map(function(datum){return datum[property];}),
            startIdx:0,
            endIdx:data.length-1,
            optInTimePeriod:period,
            optInNbDev:1
        },responseHandler.bind(null,data,resolve,reject));
    });
};

exports.tr = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'TRANGE',
            high:candles.map(function(datum){return datum.high;}),
            low:candles.map(function(datum){return datum.low;}),
            close:candles.map(function(datum){return datum.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });
};

exports.adx = function(candles,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'ADX',
            high:candles.map(function(datum){return datum.high;}),
            low:candles.map(function(datum){return datum.low;}),
            close:candles.map(function(datum){return datum.close;}),
            startIdx:0,
            endIdx:candles.length-1,
            optInTimePeriod:period
        },responseHandler.bind(null,candles,resolve,reject));
    });
};

function responseHandler(data,resolve,reject,response){
    if(!response.result){
        reject('error');
    } else {
        var result = [];
        var _data = data.slice(response.begIndex);
        for(var i = 0; i<_data.length; i++){
            result.push({
                date:_data[i].date,
                value:response.result.outReal[i]
            });
        }
        resolve(result);
    }
}