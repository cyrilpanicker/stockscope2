var d3 = require('d3');
var indicators = require('./indicators');
var helpers = require('./helpers');
var nz = helpers.nz;

exports.supports = function(candles,window){
    return indicators.lowest(candles,'low',window).then(function(lowest){
        var lastSupport=null;
        var _result = [];
        var result = [];
        var value;
        for(var i=0;i<lowest.length;i++){
            var low = candles.find(function(candle){return candle.date===lowest[i].date;}).low;
            if(low<=lowest[i].value){
                lastSupport = low;
            }
            _result.push({date:lowest[i].date,value:lastSupport});
        }
        for(var i=0;i<_result.length-1;i++){
            if(!_result[i].value || !_result[i+1].value){
                value = null;
            }else if(_result[i].value !== _result[i+1].value){
                value = null;
            }else{
                value = _result[i].value;
            }
            result.push({date:_result[i].date,value:value});
        }
        return Promise.resolve(result);
    });
};

exports.resistances = function(candles,window){
    return indicators.highest(candles,'high',window).then(function(highest){
        var lastResistance=null;
        var _result = [];
        var result = [];
        var value;
        for(var i=0;i<highest.length;i++){
            var high = candles.find(function(candle){return candle.date===highest[i].date;}).high;
            if(high>=highest[i].value){
                lastResistance = high;
            }
            _result.push({date:highest[i].date,value:lastResistance});
        }
        for(var i=0;i<_result.length-1;i++){
            if(!_result[i].value || !_result[i+1].value){
                value = null;
            }else if(_result[i].value !== _result[i+1].value){
                value = null;
            }else{
                value = _result[i].value;
            }
            result.push({date:_result[i].date,value:value});
        }
        return Promise.resolve(result);
    });
};

exports.support2 = function(candles){
    return exports.supports(candles,21).then(function(supports){
        return Promise.resolve(supports[supports.length-1].value);
    });
};

exports.support2Since = function(candles){
    return exports.supports(candles,21).then(function(supports){
        var support = supports[supports.length-1].value;
        if(!support){
            return Promise.resolve(null);
        }else{
            var counter = 0;
            for(var i=supports.length-1; i>=0;i--){
                if(supports[i].value === support){
                    counter++;                
                }else{
                    break;
                }
            }
            return Promise.resolve(counter);   
        }
    });
};

exports.support1 = function(candles){
    return exports.supports(candles,8).then(function(supports){
        return Promise.resolve(supports[supports.length-1].value);
    });
};

exports.support1Since = function(candles){
    return exports.supports(candles,8).then(function(supports){
        var support = supports[supports.length-1].value;
        if(!support){
            return Promise.resolve(null);
        }else{
            var counter = 0;
            for(var i=supports.length-1; i>=0;i--){
                if(supports[i].value === support){
                    counter++;                
                }else{
                    break;
                }
            }
            return Promise.resolve(counter);   
        }
    });
};

exports.supportOverlapRatio = function(candles){
    var valueScale = d3.scale.linear()
        .domain([
            d3.min(candles.map(function(candle){return candle.low;})),
            d3.max(candles.map(function(candle){return candle.high;}))
        ])
        .range([100,400]);
    return Promise.all([
        exports.support1(candles),
        exports.support2(candles)
    ]).then(function(values){
        var support1 = values[0];
        var support2 = values[1];
        if(support1 === null || support2 === null){
            return Promise.resolve(null);
        }else{
            support1 = valueScale(support1);
            support2 = valueScale(support2);
            return Promise.resolve((Math.abs(+((support2-support1)/support2)*100).toFixed(2)));
        }
    });
}

exports.emaHelper = function(candles,period){
    return indicators.ema(candles,'close',period).then(function(emaValues){

        var ema = emaValues[emaValues.length-1].value;
        var open = candles[candles.length-1].open;
        var high = candles[candles.length-1].high;
        var low = candles[candles.length-1].low;
        var close = candles[candles.length-1].close;
        var ratio = null;

        var valueScale = d3.scale.linear().domain([
            Math.min(
                d3.min(candles.slice(-180).map(candle => candle.low)),
                d3.min(emaValues.slice(-180).map(emaValue => emaValue.value))
            ),
            Math.max(
                d3.max(candles.slice(-180).map(candle => candle.high)),
                d3.max(emaValues.slice(-180).map(emaValue => emaValue.value))
            )
        ]).range([1,100]);

        var scaledEma = valueScale(ema);
        var scaledOpen = valueScale(open);
        var scaledHigh = valueScale(high);
        var scaledLow = valueScale(low);
        var scaledClose = valueScale(close);

        // console.log(scaledEma,scaledOpen,scaledHigh,scaledLow,scaledClose);

        var openDiff = Math.abs(scaledOpen-scaledEma);
        var highDiff = Math.abs(scaledHigh-scaledEma);
        var lowDiff = Math.abs(scaledLow-scaledEma);
        var closeDiff = Math.abs(scaledClose-scaledEma);
        // console.log(openDiff,highDiff,lowDiff,closeDiff);

        var min = Math.min(highDiff,lowDiff,openDiff,closeDiff);
        if(highDiff === min){
            ratio = ((scaledHigh-scaledEma)).toFixed(2);
        }else if(lowDiff === min){
            ratio = ((scaledLow-scaledEma)).toFixed(2);
        }else if(openDiff === min ){
            ratio = ((scaledOpen-scaledEma)).toFixed(2);
        }else{
            ratio = ((scaledClose-scaledEma)).toFixed(2);
        }
        return {
            value:ema.toFixed(2),
            ratio:ratio
        };
    });
}

exports.priceSupportRatio = function(candles){
    var valueScale = d3.scale.linear()
        .domain([
            d3.min(candles.map(function(candle){return candle.low;})),
            d3.max(candles.map(function(candle){return candle.high;}))
        ])
        .range([100,400]);
    return Promise.all([
        exports.support1(candles),
        exports.support2(candles)
    ]).then(function(values){
        var support1 = values[0];
        var support2 = values[1];
        var price = valueScale(candles[candles.length-1].close);
        if(support2===null){
            if(support1===null){
                return Promise.resolve(null);
            }else{
                support1 = valueScale(support1);
                return Promise.resolve((((price-support1)/support1)*100).toFixed(2));
            }
        }else{
            support2 = valueScale(support2);
            if(support1===null){
                return Promise.resolve((((price-support2)/support2)*100).toFixed(2));
            }else{
                support1 = valueScale(support1);
                var support = (support1>support2)?support1:support2;
                return Promise.resolve((((price-support)/support)*100).toFixed(2));
            }
        }
    });
}

exports.combinedSupports = function(candles){
    return Promise.all([
        exports.supports(candles,8),
        exports.supports(candles,21)
    ]).then(function(values){
        var support1 = values[0];
        var support2 = values[1];
        var results1 = [];
        var results2 = [];
        var lastLow = null;
        for(var i = 0; i<support1.length; i++){
            if(support1[i].value === null){
                lastLow = null;
                continue;
            }else{
                if(lastLow === null){
                    results1.push({
                        date:support1[i].date,
                        value:support1[i].value,
                        count:1
                    });
                }else{
                    if(support1[i].value === lastLow){
                        results1[results1.length-1].count++;
                    }else{
                        results1.push({
                            date:support1[i].date,
                            value:support1[i].value,
                            count:1
                        }); 
                    }
                }
                lastLow = support1[i].value;
            }
        }
        var lastLow = null;
        for(var i = 0; i<support2.length; i++){
            if(support2[i].value === null){
                lastLow = null;
                continue;
            }else{
                if(lastLow === null){
                    results2.push({
                        date:support2[i].date,
                        value:support2[i].value,
                        count:1
                    });
                }else{
                    if(support2[i].value === lastLow){
                        results2[results2.length-1].count++;
                    }else{
                        results2.push({
                            date:support2[i].date,
                            value:support2[i].value,
                            count:1
                        }); 
                    }
                }
                lastLow = support2[i].value;
            }
        }
        for(var i=0;i<results2.length;i++){
            var date2 = new Date(results2[i].date).getTime();
            for(var j=0;j<results1.length;j++){
                var date1 = new Date(results1[j].date).getTime();
                if(date1>=date2){
                    break;
                }
            }
            if(date1===date2){
                if(results1[j].count < results2[i].count){
                    results1[j].count = results2[i].count;
                }
            }else{
                results1.splice(j,0,results2[i]);
            }
        }
        return Promise.resolve(results1);
    });
};

exports.previousSupportRatio = function(candles){
    var valueScale = d3.scale.linear()
        .domain([
            d3.min(candles.map(function(candle){return candle.low;})),
            d3.max(candles.map(function(candle){return candle.high;}))
        ])
        .range([100,400]);
    return Promise.all([
        exports.combinedSupports(candles),
        exports.support1(candles),
        exports.support2(candles)
    ]).then(function(values){
        if(values[1]===null && values[2]===null){
            return Promise.resolve(null);
        }else{
            var supports = values[0];
            var support1 = valueScale(supports[supports.length-1].value);
            var support2 = valueScale(supports[supports.length-2].value);
            return Promise.resolve((Math.abs(+((support2-support1)/support2)*100).toFixed(2)));   
        }
    });
};

exports.bbw = function(candles,period){
    var results = [];
    return indicators.bollingerBands(candles,period).then(function(values){
        for(var i=0;i<values.length;i++){
            results.push({
                date:values[i].date,
                value:(values[i].upper-values[i].lower)
            });
        }
        return Promise.resolve(results);
    });
}

exports.bbwLows = function(candles,period,lowWindow){
    var results = [];
    var bbwValues = [];
    return exports.bbw(candles,period).then(function(_bbwValues){
        bbwValues = _bbwValues;
        return indicators.lowest(_bbwValues,'value',lowWindow);
    }).then(function(bbwLowestValues){
        for(var i=0;i<bbwLowestValues.length;i++){
            var bbwValue = bbwValues.find(function(bbwValue){return bbwValue.date===bbwLowestValues[i].date;}).value;
            if(bbwValue<=bbwLowestValues[i].value){
                results.push({
                    date:bbwLowestValues[i].date,
                    value:bbwValue
                });
            }
        }
        return results;
    });
};

exports.bbwLow1Since = function(candles){
    return exports.bbwLows(candles,21,34).then(function(bbwLows){
        var date = bbwLows[bbwLows.length-1].date;
        var counter = 0;
        for(var i=candles.length-1;i>=0;i--){
            if(candles[i].date !== date){
                counter++;
            }else{
                break;
            }
        }
        return counter;
    }); 
};

exports.bbwLow2Since = function(candles){
    return exports.bbwLows(candles,21,55).then(function(bbwLows){
        var date = bbwLows[bbwLows.length-1].date;
        var counter = 0;
        for(var i=candles.length-1;i>=0;i--){
            if(candles[i].date !== date){
                counter++;
            }else{
                break;
            }
        }
        return counter;
    }); 
};

exports.lowToBblowRatio = function(candles,period){
    var valueScale = d3.scale.linear()
        .domain([
            d3.min(candles.map(function(candle){return candle.low;})),
            d3.max(candles.map(function(candle){return candle.high;}))
        ])
        .range([100,400]);
    return indicators.bollingerBands(candles,period).then(function(values){
        var lowerBb = valueScale(values[values.length-1].lower);
        var low = valueScale(candles[candles.length-1].low);
        return Promise.resolve(((low-lowerBb)/lowerBb*100).toFixed(2));
    });
};

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

exports.pivots = function(candles){
    var date = new Date(candles[candles.length-1].date);
    var results = [];
    date.setDate(1);
    date.setMonth(date.getMonth()-1);
    var _firstDate = new Date(date.getFullYear(),date.getMonth(),date.getDate());
    var firstDate = _firstDate.getTime();
    var _lastDate = new Date(_firstDate.getFullYear(),_firstDate.getMonth()+1,0);
    var lastDate = _lastDate.getTime();
    candles = candles.filter(function(candle){
        var date = new Date(candle.date);
        date = new Date(date.getFullYear(),date.getMonth(),date.getDate());
        return (date >= firstDate && date <= lastDate);
    });
    var open = candles[0].open;
    var close = candles[candles.length-1].close;
    var high = d3.max(candles.map(function(candle){return candle.high;}));
    var low = d3.min(candles.map(function(candle){return candle.low;}));
    var pp = (high + low + close)/3;
    var s1 = 2 * pp - high;
    var r1 = 2 * pp - low;
    var s2 = pp - (high - low);
    var r2 = pp + (high - low);
    var s3 = low - 2 * (high - pp);
    var r3 = high + 2 * (pp - low);
    var s4 = low - 3 * (high - pp);
    var r4 = high + 3 * (pp - low);
    return [
        r4.toFixed(2),
        r3.toFixed(2),
        r2.toFixed(2),
        r1.toFixed(2),
        pp.toFixed(2),
        s1.toFixed(2),
        s2.toFixed(2),       
        s3.toFixed(2),
        s4.toFixed(2)
    ];  
};

exports.distanceFromLowerPivot = function(candles){
    var pivots = exports.pivots(candles);
    var price = candles[candles.length-1].close;
    var higherPivot = null;
    var lowerPivot = null;
    for(var i=0;i<pivots.length-1;i++){
        if(price < pivots[i] && price >= pivots[i+1]){
            higherPivot = pivots[i]; lowerPivot = pivots[i+1];
        }
    }
    if(higherPivot !== null && lowerPivot !== null){
        var value = ((price-lowerPivot)/(higherPivot-lowerPivot))*100
        return value.toFixed(2);   
    } else{
        return 'price-beyond-pivots';
    }
};

exports.slope = function(data){
    var results = [];
    data = data.slice(-250);
    var dateScale = d3.scale.ordinal()
        .domain(data.map(function(datum){return datum.date;}))
        .rangePoints([0,1000]);
    var values = data.map(function(datum){return datum.value;});
    var valueScale = d3.scale.linear()
        .domain([d3.min(values),d3.max(values)])
        .range([0,1000]);
    for(var i=1;i<data.length;i++){
        var point1 = getPoint(data[i-1],dateScale,valueScale);
        var point2 = getPoint(data[i],dateScale,valueScale);
        var line = getLine(point1,point2);
        results.push({
            date:data[i].date,
            value:line.slope.toFixed(2)
        });
    }
    return results;
};

exports.easeOfMovement = function(candles,divisor,length){
    var eomResult = [];
    for(var i=1;i<candles.length;i++){
        var currentAverage = (candles[i].high + candles[i].low)/2;
        var previousAverage = (candles[i-1].high + candles[i-1].low)/2;
        eomResult.push({
            date:candles[i].date,
            value:divisor * (currentAverage - previousAverage) * (candles[i].high - candles[i].low) / candles[i].volume
        });
    }
    return indicators.sma(eomResult,'value',length);
};

exports.change = function(data){
    var result = [];
    for(var i=1;i<data.length;i++){
        result.push({
            date:data[i].date,
            value:data[i].value-data[i-1].value
        });
    }
    return result;
};

exports.trendDetails = function(candles,period,multiplier){
    var close, max1, min1, is_uptrend_prev, vstop_prev, stop, vstop1,
        is_uptrend, is_trend_changed, max_, min_, vstop = null;
    var result = [];
    return indicators.atr(candles,period).then(function(atrResult){
        candles = candles.slice(-atrResult.length);
        for(var i=0; i<candles.length; i++){
            close = candles[i].close;
            atr = atrResult[i].value;
            max1 = Math.max(nz(max_),close);
            min1 = Math.min(nz(min_),close);
            is_uptrend_prev = nz(is_uptrend,true);
            vstop_prev = nz(vstop);
            stop = is_uptrend_prev ? max1 - multiplier * atr : min1 + multiplier * atr;
            vstop1 = is_uptrend_prev ? Math.max(vstop_prev,stop) : Math.min(vstop_prev, stop);
            is_uptrend = (close-vstop1)>=0;
            is_trend_changed = is_uptrend !== is_uptrend_prev;
            max_ = is_trend_changed ? close : max1;
            min_ = is_trend_changed ? close : min1;
            vstop = is_trend_changed ? (is_uptrend ? max_ - multiplier * atr : min_ + multiplier * atr) : vstop1;
            result.push({
                date:candles[i].date,
                is_trend_changed:is_trend_changed,
                is_uptrend:is_uptrend,
                trend_helper_price:parseFloat(vstop.toFixed(2))
            });
        }
        var counter = 0;
        for(var i=result.length-1; i>=0 && result[i].is_trend_changed===false; i--){
            counter++;
        }
        return Promise.resolve({
            date:result[result.length-1].date,
            is_uptrend:result[result.length-1].is_uptrend,
            trend_helper_price:result[result.length-1].trend_helper_price,
            trend_changed_since:counter
        });
    },function(error){reject(error);});
};

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