var talib = require('talib');
var patternInfo = require('./patternInfo');

exports.getLatestCandleStickPattern = function(candles){
    return Promise.all([
        exports.twoCrows(candles),
        exports.threeBlackCrows(candles),
        exports.threeInside(candles),
        exports.threeLineStrike(candles),
        exports.threeOutside(candles),
        exports.threeStarsInTheSouth(candles),
        exports.threeWhiteSoldiers(candles),
        exports.abandonedBaby(candles),
        exports.advanceBlock(candles),
        exports.beltHold(candles),
        exports.breakAway(candles),
        exports.closingMarubozu(candles),
        exports.concealingBabySwallow(candles),
        exports.counterAttack(candles),
        exports.darkCloudCover(candles),
        exports.dojiStar(candles),
        exports.dragonFlyDoji(candles),
        exports.engulfing(candles),
        exports.eveningDojiStar(candles),
        exports.eveningStar(candles),
        exports.gapSideWhite(candles),
        exports.graveStoneDoji(candles),

        exports.harami(candles),

        exports.piercing(candles),

        exports.tasukiGap(candles)
    ]).then(function(results){
        var date = null;
        var daysSince = 0;
        var name = null;
        var strength = null;
        var theoreticalType = null;
        var testedType = null;
        for(var i=0;i<results.length;i++){
            for(var j=results[i].length-1;j>=0;j--){
                if(date !== null & new Date(results[i][j].date)<=new Date(date)){
                    break;
                }else{
                    if(results[i][j].value===0){
                        continue;
                    }else{
                        date = results[i][j].date;
                        name = patternInfo[i].name;
                        var result = '';
                        if(results[i][j].value<0){
                            strength = patternInfo[i].bearish.strength;
                            theoreticalType = patternInfo[i].bearish.theoreticalType;
                            testedType = patternInfo[i].bearish.testedType;
                        }else{
                            strength = patternInfo[i].bullish.strength;
                            theoreticalType = patternInfo[i].bullish.theoreticalType;
                            testedType = patternInfo[i].bullish.testedType;
                        }
                        break;
                    }
                }
            }
        }
        for(var i=candles.length-1;i>=0;i--){
            if(candles[i].date !== date){
                daysSince++;
                continue;
            }else{
                break;
            }
        }
        return {
            name:name,
            strength:strength,
            date:date,
            daysSince:daysSince,
            theoreticalType,
            testedType
        };
    });
};

exports.twoCrows = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL2CROWS',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeBlackCrows = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3BLACKCROWS',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeInside = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3INSIDE',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeLineStrike = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3LINESTRIKE',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeOutside = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3OUTSIDE',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.threeStarsInTheSouth = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDL3STARSINSOUTH',
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

exports.advanceBlock = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLADVANCEBLOCK',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.beltHold = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLBELTHOLD',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
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
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.closingMarubozu = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLCLOSINGMARUBOZU',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.concealingBabySwallow = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLCONCEALBABYSWALL',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.counterAttack = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLCOUNTERATTACK',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1,
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.darkCloudCover = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLDARKCLOUDCOVER',
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

exports.dojiStar = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLDOJISTAR',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.dragonFlyDoji = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLDRAGONFLYDOJI',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.engulfing = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLENGULFING',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.eveningDojiStar = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLEVENINGDOJISTAR',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.eveningStar = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLEVENINGSTAR',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length,
            optInPenetration:null
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.gapSideWhite = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLGAPSIDESIDEWHITE',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.graveStoneDoji = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLGRAVESTONEDOJI',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.harami = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLHARAMI',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

exports.piercing = function(candles){
    return new Promise(function(resolve,reject){
        talib.execute({
            name:'CDLPIERCING',
			open:candles.map(function(candle){return candle.open;}),
			high:candles.map(function(candle){return candle.high;}),
			low:candles.map(function(candle){return candle.low;}),
			close:candles.map(function(candle){return candle.close;}),
            startIdx:0,
            endIdx:candles.length-1
        },responseHandler.bind(null,candles,resolve,reject));
    });    
};

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

function responseHandler(candles,resolve,reject,error,response){
    if(error || !response.result){
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
