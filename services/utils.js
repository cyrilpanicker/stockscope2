var fs = require('fs');

exports.readFile = function(file){
    return new Promise(function(resolve,reject){
        fs.readFile(file,function(error,data){
            if(error){
                reject('file-read-error');
            }else{
                resolve(data);
            }
        });
    });
};

exports.delay = function(time){
    return new Promise(function(resolve){
        setTimeout(resolve,time);
    });
};