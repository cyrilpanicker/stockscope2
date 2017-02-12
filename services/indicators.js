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

exports.adx = function(data,period){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'ADX',
            high:data.map(function(datum){return datum.high;}),
            low:data.map(function(datum){return datum.low;}),
            close:data.map(function(datum){return datum.close;}),
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