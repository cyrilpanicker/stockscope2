var d3 = require('d3');
var indicators = require('./indicators');

exports.squeeze = function(candles){
    return new Promise(function(resolve,reject){
        var bbPeriod = 20;
        var bbDeviationMultiplier = 1.5;
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

exports.squeezeOffSince = function(candles){
    return exports.squeeze(candles).then(function(squeeze){
        var counter = 0;
        for(var i=squeeze.length-1; i>=0 && squeeze[i].value===false; i--){
            counter++;
        }
        return Promise.resolve(counter);
    });
};

exports.crossAboveDates = function(data1,data2){
    data1 = data1.slice(-180);
    data2 = data2.slice(-180);
    var dateScale = d3.scale.ordinal()
        .domain(data1.map(function(datum){return datum.date;}))
        .rangePoints([0,1000]);
    var values = data1.map(function(datum){return datum.value;})
        .concat(data2.map(function(datum){return datum.value;}));
    var valueScale = d3.scale.linear()
        .domain([d3.min(values),d3.max(values)])
        .range([0,1000]);
    var pointCrosses = [];
    var result = [];
    for(var i=1; i<data1.length; i++){
        var point11 = getPoint(data1[i-1],dateScale,valueScale);
        var point12 = getPoint(data1[i],dateScale,valueScale);
        var point21 = getPoint(data2[i-1],dateScale,valueScale);
        var point22 = getPoint(data2[i],dateScale,valueScale);
        if (point12.y < point22.y) {
            continue;
        }
        var line1 = getLine(point11,point12);
        var line2 = getLine(point21,point22);
        var intersection = getIntersection(line1,line2);
        if(point11.x<intersection.x && intersection.x<=point12.x){
            pointCrosses.push(intersection);
        }
        pointCrosses.forEach(function(point){
            result.push(dateScale.domain()[d3.bisect(dateScale.range(),point.x)]);
        });
    }
    return result;
};

exports.crossBelowDates = function(data1,data2){
    data1 = data1.slice(-180);
    data2 = data2.slice(-180);
    var dateScale = d3.scale.ordinal()
        .domain(data1.map(function(datum){return datum.date;}))
        .rangePoints([0,1000]);
    var values = data1.map(function(datum){return datum.value;})
        .concat(data2.map(function(datum){return datum.value;}));
    var valueScale = d3.scale.linear()
        .domain([d3.min(values),d3.max(values)])
        .range([0,1000]);
    var pointCrosses = [];
    var result = [];
    for(var i=1; i<data1.length; i++){
        var point11 = getPoint(data1[i-1],dateScale,valueScale);
        var point12 = getPoint(data1[i],dateScale,valueScale);
        var point21 = getPoint(data2[i-1],dateScale,valueScale);
        var point22 = getPoint(data2[i],dateScale,valueScale);
        if (point12.y >= point22.y) {
            continue;
        }
        var line1 = getLine(point11,point12);
        var line2 = getLine(point21,point22);
        var intersection = getIntersection(line1,line2);
        if(point11.x<intersection.x && intersection.x<=point12.x){
            pointCrosses.push(intersection);
        }
        pointCrosses.forEach(function(point){
            result.push(dateScale.domain()[d3.bisect(dateScale.range(),point.x)]);
        });
    }
    return result;
};

exports.maCrossedAboveSince = function(candles){
    var promise1 = indicators.sma(candles,'close',9);
    var promise2 = indicators.sma(candles,'close',21);
    return Promise.all([promise1,promise2]).then(function(values){
        var sma1 = values[0];
        var sma2 = values[1];
        var crossAboveDates = exports.crossAboveDates(sma1,sma2);
        if(!crossAboveDates.length){
            return Promise.resolve(0);
        }else{
            var lastDate = crossAboveDates[crossAboveDates.length-1];
            var dateArray = candles.map(function(candle){return candle.date;});
            var index = dateArray.indexOf(lastDate);
            return Promise.resolve(dateArray.length-index);
        }
    },function(error){
        return Promise.reject(error);
    });
};

exports.maCrossedBelowSince = function(candles){
    var promise1 = indicators.sma(candles,'close',9);
    var promise2 = indicators.sma(candles,'close',21);
    return Promise.all([promise1,promise2]).then(function(values){
        var sma1 = values[0];
        var sma2 = values[1];
        var crossBelowDates = exports.crossBelowDates(sma1,sma2);
        if(!crossBelowDates.length){
            return Promise.resolve(0);
        }else{
            var lastDate = crossBelowDates[crossBelowDates.length-1];
            var dateArray = candles.map(function(candle){return candle.date;});
            var index = dateArray.indexOf(lastDate);
            return Promise.resolve(dateArray.length-index);
        }
    },function(error){
        return Promise.reject(error);
    });
};

exports.momentum = function(candles){
    // val = linreg(source  -  avg(avg(highest(high, lengthKC), lowest(low, lengthKC)),sma(close,lengthKC)), lengthKC,0)
    var period = 20;
    var avg = indicators.avg;
    return Promise.all([
        indicators.highest(candles,'high',period),
        indicators.lowest(candles,'low',period),
        indicators.sma(candles,'close',period)
    ]).then(function(values){
        var highest = values[0];
        var lowest = values[1];
        var sma = values[2];
        var data1 = highest.map(function(highestItem){
            return {
                date:highestItem.date,
                highest:highestItem.value,
                lowest:lowest.find(function(lowestItem){return highestItem.date===lowestItem.date;}).value
            };
        });
        var average1 = avg(data1,['highest','lowest']);
        var data2 = sma.map(function(smaItem){
            return {
                date:smaItem.date,
                sma:smaItem.value,
                average1:average1.find(function(item){return item.date===smaItem.date;}).value
            };
        });
        var average2 = avg(data2,['sma','average1']);
        var data3 = average2.map(function(item){
            return {
                date:item.date,
                value:candles.find(function(candle){return candle.date===item.date}).close - item.value
            };
        });
        return indicators.linreg(data3,'value',period);
    }).then(function(momentum){
        var results = [];
        for(var i=1;i<momentum.length;i++){
            var currentValue = momentum[i].value;
            var previousValue = momentum[i-1].value;
            var result = {};
            result.date = momentum[i].date;
            result.value = currentValue.toFixed(2);
            result.direction = currentValue > previousValue ? 'up': 'down';
            results.push(result); 
            var count = 0;
            for(var j=i-1;j>=0;j--){
                if(results[j].direction !== result.direction){
                    break;
                }else{
                    count++;
                }
            }
            result.directionChangedSince = count;
        }
        return Promise.resolve(results);
    });
}

function getPoint(datum,dateScale,valueScale) {
    var point = {};
    point.x = dateScale(datum.date);
    point.y = valueScale(datum.value);
    return point;
}

function getLine(point1,point2){
    var line = {};
    line.slope = (point2.y - point1.y)/(point2.x - point1.x);
    line.intercept = point1.y - line.slope*point1.x;
    return line;
};

function getIntersection(line1,line2){
    var point = {};
    point.x = (line2.intercept - line1.intercept)/(line1.slope - line2.slope);
    point.y = (line2.slope*line1.intercept - line1.slope*line2.intercept)/(line2.slope - line1.slope);
    return point;
};