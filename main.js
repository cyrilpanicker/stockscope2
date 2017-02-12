var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');

var _candleData;
quandlService.getCandleData({
    stock: 'INFY',
    endDate: new Date()
}).then(function (candleData) {
    _candleData = candleData;
    console.log('fetched');
    return indicators.adx(candleData,14);
    // console.log(indicators.adx(candleData,14));
}, function (error) {
    console.log(error);
}).then(function(result){
    _candleData.forEach(function(item){
        var smaResults = result.filter(function(smaItem){
            return smaItem.date == item.date;
        });
        item.adx = smaResults.length ? smaResults[0].value : null;
        console.log(item.date+'\t\t'+item.open+'\t\t'+item.high+'\t\t'+item.low+'\t\t'+item.close+'\t\t'+item.adx);
    });
});