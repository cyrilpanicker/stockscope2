var quandlService = require('./services/quandlService');
var indicators = require('./services/indicators');

quandlService.getCandleData({
    stock: 'RELIANCE',
    endDate: new Date()
}).then(function (candleData) {
    console.log(getSMA(candleData,'close',9));
}, function (error) {
    console.log(error);
});