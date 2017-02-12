var indicators = require('./indicators');

exports.squeeze = function(candles){
    return new Promise(function(resolve,reject){
        var bbPeriod = 20;
        var bbDeviationMultiplier = 2;
        var kcPeriod = 20;
        var kcMultiplier = 1.5;
        var bbBasisPromise = indicators.sma(candles,'close',bbPeriod);
        var bbDeviationPromise = indicators.stdDev(candles,'close',bbPeriod);
        var kcMaPromise = indicators.sma(candles,'close',kcPeriod);
        var kcRangeMaPromise = indicators.tr(candles).then(function(trueRange){
            return indicators.sma(trueRange,'value',kcPeriod);
        },function(error){reject(error);});
        Promise.all([bbBasisPromise,bbDeviationPromise,kcMaPromise,kcRangeMaPromise]).then(function(values){
            var bbBasis = values[0];
            var bbDeviation = values[1];
            var kcMa = values[2];
            var kcRangeMa = values[3];
            var bb = {upper:[],lower:[]};
            var kc = {upper:[],lower:[]};
            var result = [];
            bbBasis.forEach(function(bbBasisItem){
                var bbDeviationItem = bbDeviation.filter(function(item){return item.date === bbBasisItem.date;})[0];
                bb.upper.push({date:bbBasisItem.date,value:bbBasisItem.value + bbDeviationMultiplier * bbDeviationItem.value});
                bb.lower.push({date:bbBasisItem.date,value:bbBasisItem.value - bbDeviationMultiplier * bbDeviationItem.value});
            });
            kcRangeMa.forEach(function(kcRangeMaItem){
                var kcMaItem = kcMa.filter(function(item){return item.date === kcRangeMaItem.date})[0];
                kc.upper.push({date:kcMaItem.date,value:kcMaItem.value + kcMultiplier * kcRangeMaItem.value});
                kc.lower.push({date:kcMaItem.date,value:kcMaItem.value - kcMultiplier * kcRangeMaItem.value});
            });
            candles.forEach(function(candle){
                var bbUpperResults = bb.upper.filter(function(item){return candle.date===item.date;});
                var bbLowerResults = bb.lower.filter(function(item){return candle.date===item.date;});
                var kcUpperResults = kc.upper.filter(function(item){return candle.date===item.date;});
                var kcLowerResults = kc.lower.filter(function(item){return candle.date===item.date;});
                var bbUpper = bbUpperResults.length ? bbUpperResults[0].value : null;
                var bbLower = bbLowerResults.length ? bbLowerResults[0].value : null;
                var kcUpper = kcUpperResults.length ? kcUpperResults[0].value : null;
                var kcLower = kcLowerResults.length ? kcLowerResults[0].value : null;
                if(bbUpper!==null && bbLower!==null && kcUpper!==null && kcLower!==null){
                    var isSqeezeOn = (bbLower>kcLower) && (bbUpper<kcUpper);
                    var isSqueezeOff = (bbLower<kcLower) && (bbUpper>kcUpper);
                    var noSqueeze = !isSqeezeOn && !isSqueezeOff;
                    result.push({
                        date:candle.date,
                        value:noSqueeze ? null : (isSqeezeOn ? true : false)
                    });
                }
            });
            resolve(result);
        },function(error){reject(error);});
    });
};