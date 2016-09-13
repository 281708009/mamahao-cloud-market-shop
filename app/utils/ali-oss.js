/*
 * ali-oss
 * by xqs 16/09/06
 * */

var co = require('co'),
    fs = require('fs'),
    OSS = require('ali-oss');

var formidable = require('formidable');

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
aliOSS.prototype.uploadFile = function (args, options) {
    var req = args[0], res = args[1];
    var me = this, client = new OSS(me.config);

    //存储到node服务器文件夹
    var options = options || {};
    var form = new formidable.IncomingForm();   //创建一个incoming form实例
    form.encoding = options.encoding || 'utf-8';        //设置编码
    form.uploadDir = options.uploadDir || 'public/upload/';     //设置文件接收后保存的文件夹。
    form.keepExtensions = null !== options.keepExtensions ? options.keepExtensions : true;     //设置上传后文件是否使用原扩展名，默认值为false。
    form.maxFieldsSize = options.maxFieldsSize || 2 * 1024 * 1024;   //设置上传文件的大小，默认值为2M
    form.maxFields = options.maxFields || 1000;   //设置最大可接收字段数，用于防止内存溢出，默认值为1000
    form.hash = options.hash || false;     //是否对上传文件进行hash较验，可设置为'sha1' 或 'md5'
    form.multiples = false;    //设置是否支持多文件上传，暂时不支持下面代码未处理该逻辑

    //解析文件
    form.parse(req, function (err, fields, files) {
        if (err) {
            return log.error(err);
        }

        var Files = files.file, len = Files.length;

        if (!len) {
            return res.json({error_code: 20002, msg: '未选择任何文件'});
        }

        //遍历文件
        for (var i = 0; i < len; i++) {
            var file = Files[i];

            var fileName = file.name,
                filePath = file.path;


            // 对文件名进行处理，以应对上传同名文件的情况
            var nameArray = fileName.split('.');
            var type = nameArray.length > 1 ? nameArray[nameArray.length - 1].toLowerCase() : '';


            //限制文件类型
            if (options.fileTypes && (-1 === inArray(type, options.fileTypes))) {
                //删除文件
                fs.unlink(filePath);
                res.json({error_code: 20001, msg: '文件' + fileName + '上传失败，类型只能为' + options.fileTypes.join('\/')});
                return;
            }


            //后缀加上uuid
            var newName = generateUUID();
            if (type) newName += '.' + type;

            //重命名  fs.rename(oldPath, newPath, callback)
            var newPath = form.uploadDir + newName;
            fs.rename(filePath, newPath, function (err) {
                if (err) return log.error(err);

                //上传到阿里OSS
                co(function* () {
                    // use 'chunked encoding'
                    var stream = fs.createReadStream(newPath);
                    var result = yield client.putStream(newName, stream);

                    //删除文件
                    fs.unlink(newPath);

                    //console.info(result)

                    var json = {
                        success: true,
                        msg: '上传成功',
                        name: result.name,
                        url: result.url
                    };
                    res.json(json);

                }).catch(function (err) {
                    if (err) log.error(err);
                    res.json({error_code: 20000, msg: '上传失败'});
                });

            });

        }

    });


};

//图片上传
aliOSS.prototype.uploadImage = function (args) {
    var me = this;
    me.uploadFile(args, {
        fileTypes: ['jpg', 'jpeg', 'png']  //限制类型
    });

};


//查看bucket信息
aliOSS.prototype.showBucket = function (args) {
    var me = this, client = new OSS(me.config);

    //查看Bucket列表
    co(function* () {
        var result = yield client.listBuckets();

        //查看文件列表
        client.useBucket(me.config.bucket);
        result.fileList = yield client.list({'max-keys': 5});

        //console.log(result);
        args.success && args.success.call(null, result);
    }).catch(function (err) {
        console.error(err);
    });

};

//创建UUID
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
}

//判断元素是否在数组中
function inArray(elem, arr, i) {
    var deletedIds = [];
    var indexOf = deletedIds.indexOf;
    var len;
    if (arr) {
        if (indexOf) {
            return indexOf.call(arr, elem, i);
        }
        len = arr.length;
        i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
        for (; i < len; i++) {
            if (i in arr && arr[i] === elem) {
                return i;
            }
        }
    }
    return -1;
}

module.exports = aliOSS;