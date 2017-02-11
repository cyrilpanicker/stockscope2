var yahooService = require('./services/yahooService');

yahooService.getCandleData({
    stock: 'GDL',
    endDate: new Date()
}).then(function (candleData) {
    console.log(candleData);
}, function (error) {
    console.log(error);
});