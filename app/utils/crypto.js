var crypto = require('crypto');

var secretKey = 'jdakjfa20dsllll2zvcas';
//加密
exports.cipher = function(data) {
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
};

//解密
exports.decipher = function(data) {
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
    return cipher.update(data,'hex','utf8') + cipher.final('utf8');
};