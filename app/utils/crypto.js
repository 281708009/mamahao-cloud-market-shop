var crypto = require('crypto');

var secretKey = 'jdakjfa20dsllll2zvcas',
    newSecretKey = 'jdakjfa20dsllll2';
//加密
exports.cipher = function(data) {
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);
    return cipher.update(data,'utf8','hex') + cipher.final('hex');
};
exports.newCipher = function (data) {
    var cipher = crypto.createCipheriv('aes-128-ecb', newSecretKey, '');
    return cipher.update(data, 'utf8', 'base64') + cipher.final('base64');
};


//解密
exports.decipher = function(data) {
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
    return cipher.update(data,'hex','utf8') + cipher.final('utf8');
};
exports.newDecipher = function (data) {
    var cipher = crypto.createDecipheriv('aes-128-ecb', newSecretKey, '');
    return cipher.update(data, 'base64', 'utf8') + cipher.final('utf8');
};