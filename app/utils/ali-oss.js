/*
 * ali-oss
 * by xqs 16/09/06
 * */

function aliOSS(options) {

    //默认配置
    this.defaults = {
        region: 'oss-cn-hangzhou',   //申请OSS服务时的区域，例如’oss-cn-hangzhou’
        accessKeyId: 'TgoXyoHO4eMP5Bs6',
        accessKeySecret: '2fpiEl2Ui9EdYfpKsO97EOyLGgsXEM',
        bucket: 'test-goods-item-images'
    };

    this.config = $.extend({}, this.defaults, options || {});
}

//文件上传
aliOSS.prototype.fileUpload = function (args) {
    var me = this;
    var co = require('co'), OSS = require('ali-oss'), client = new OSS(me.config);

    co(function* () {
        client.useBucket(me.config.bucket);
        var result = yield client.list({'max-keys': 5});
        console.log(result);
    }).catch(function (err) {
        console.log(err);
    });

};


module.exports = aliOSS;