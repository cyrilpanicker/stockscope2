var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');
var customIndicators = require('./services/custom-indicators');

var _candles;
quandlService.getCandleData({
    stock: 'INFY',
    endDate: new Date()
}).then(function (candles) {
    _candles = candles;
    return customIndicators.squeeze(candles);
}, function (error) {
    console.log(error);
}).then(function(squeeze){
    // _candles.forEach(function(item){
    //     var squeezeResults = squeeze.filter(function(squeezeItem){
    //         return squeezeItem.date === item.date;
    //     });
    //     item.squeeze = squeezeResults.length ? squeezeResults[0].value : null;
    //     console.log(item.date+'\t\t'+item.open+'\t\t'+item.high+'\t\t'+item.low+'\t\t'+item.close+'\t\t'+item.squeeze);
    // });
    console.log(squeeze);
},function(error){console.log(error);});