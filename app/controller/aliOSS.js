var aliOSS = require('../utils/ali-oss');
var oss = {
    showBucket: function (req, res, next) {
        new aliOSS().showBucket({
            success: function (data) {
                res.json(data);
            }
        });
    },
    //上传文件
    uploadFile: function (req, res, next) {
        new aliOSS().uploadFile(arguments);
    },
    //上传图片
    uploadImage: function (req, res, next) {
        new aliOSS().uploadImage(arguments);
    }
};

module.exports = oss;