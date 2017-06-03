var request = require('request');
var moment = require('moment');

var uri = 'https://www.nseindia.com/live_market/dynaContent/live_watch/get_quote/GetQuote.jsp';
var headers = {
    'user-agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.84 Safari/537.36',
    'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8' 
};

exports.getCandleData = function(stock){
    return new Promise(function(resolve,reject){
        request({
            uri:uri,
            qs:{symbol:stock},
            headers:headers
        },function(error,reponse,body){
            if(error){
                reject('nse-unexpected-error');
            }else{
                var reponseObject = JSON.parse(body.match(/({"futLink".*"optLink".*)/)[1]);
                var date = moment(new Date(reponseObject.tradedDate)).format('YYYY-MM-DD');
                var data = reponseObject.data[0];
                if(!data){
                    reject('nse-zero-data');
                }else{
                    resolve({
                        symbol:stock,
                        date:date,
                        open:parseFloat(data.open.replace(/,/g,'')),
                        high:parseFloat(data.dayHigh.replace(/,/g,'')),
                        low:parseFloat(data.dayLow.replace(/,/g,'')),
                        close:parseFloat(data.closePrice.replace(/,/g,'')) || parseFloat(data.lastPrice.replace(/,/g,'')),
                        volume:parseFloat(data.totalTradedVolume.replace(/,/g,'')),
                        url:uri+'?symbol='+encodeURIComponent(stock)
                    });
                }
            }
        });
    });
}; 

exports.getCandleData('HCLTECH').then(function(candles){
    console.log(candles);
},function(error){
    console.log(error);
});