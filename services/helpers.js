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

exports.nz = function(value,defaultValue){
    if(value === null){
        if(!defaultValue){
            return 0;
        }else{
            return defaultValue;
        }
    }else{
        return value;
    }
};