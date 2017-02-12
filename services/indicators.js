var talib = require('talib');

exports.sma = function(data,property,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'SMA',
            inReal:data.map(function(datum){return datum[property];}),
            startIdx:0,
            endIdx:data.length-1,
            optInTimePeriod:period
        },function(response){
            if(!response.result){
                reject('error');
            }else{
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
        });
    });
};

exports.stdDev = function(candles,property,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'STDDEV',
            inReal:candles.map(function(datum){return datum[property];}),
            startIdx:0,
            endIdx:candles.length-1,
            optInTimePeriod:period,
            optInNbDev:1
        },function(response){
            if(!response.result){
                reject('error');
            }else{
                var result = [];
                var _candles = candles.slice(response.begIndex);
                for(var i = 0; i<_candles.length; i++){
                    result.push({
                        date:_candles[i].date,
                        value:response.result.outReal[i]
                    });
                }
                resolve(result);
            }
        });
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
        },function(response){
            if(!response.result){
                reject('error');
            }else{
                var result = [];
                var _candles = candles.slice(response.begIndex);
                for(var i = 0; i<_candles.length; i++){
                    result.push({
                        date:_candles[i].date,
                        value:response.result.outReal[i]
                    });
                }
                resolve(result);
            }
        });
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
        },function(response){
            if(!response.result){
                reject('error');
            }else{
                var result = [];
                var _candles = candles.slice(response.begIndex);
                for(var i = 0; i<_candles.length; i++){
                    result.push({
                        date:_candles[i].date,
                        value:response.result.outReal[i]
                    });
                }
                resolve(result);
            }
        });
    });
};