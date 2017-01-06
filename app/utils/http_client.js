/*
 *  HttpClient
 *  封装request请求，使用方式和ajax的调用类似，以后可以在此对象上进行扩展其他方法
 *  error callback对象不设置时，会统一错误处理
 *  args参数必传
 *  by xqs 16/06/07
 *
 *  @return
 *  成功 {success: true, msg: 'success'}
 *  失败 {error_code: 1001, msg: '404 error'}
 * */
var querystring = require("querystring");
var request = require("request");
var crypto = require('./crypto');
var HttpClient = {

    /*
     * request
     * @args [Object] 必需，包含request和response
     * @params [Object] 必需
     * */
    request: function (args, params) {
        var start = new Date().getTime();
        //var request = require("request");
        var req = args[0], res = args[1], next = args[2];  //取参数
        var isAjax = req.get('ajax') ? true : false;
        var userAgent = req.header("user-agent");
        var isWeChat = /micromessenger/gi.test(userAgent),
            isAlipay = /alipayclient/gi.test(userAgent),
            isMamahao = /mamhao|mamahao/gi.test(userAgent);
        var headers = {"User-Agent": "m.mamahao.com, app request v1.0.0, MamHao V3.0.0 2016072803"};

        //console.log('req---->',req);

        /*根据配置文件取api地址,随机取一个*/
        var apiURL = AppConfig.site.api.concat().sort(function () {
            return .5 - Math.random();
        })[0];


        var session = req && req.session || {};  //session

        if (session.user) {
            //已登录用户
            headers.memberId = session.user.memberId;
            headers.token = session.user.token;
        }

        /*参数*/
        var mmh_location = req.cookies && req.cookies['mmh_app_location'];

        //优先从cookie中取，其次从header中取
        var location = mmh_location ? JSON.parse(new Buffer(mmh_location, "base64").toString()) : querystring.parse(req.get('location'));
        var locationParams = location && location.areaId ? {
            areaId: location.areaId,
            lat: location.lat,
            lng: location.lng
        } : {};

        var formData = $.extend({}, locationParams, params.data || {});  //data参数覆盖header中的信息

        //微信设备，将openid作为设备id参数
        if (isWeChat && session.wechat_user) {
            formData.deviceId = session.wechat_user.openid;
        }

        var options = {
            method: params.type || 'POST',
            baseUrl: '',  //基础路径设置为空
            uri: /^http/.test(params.url) ? params.url : (apiURL + params.url || '/'),
            headers: $.extend({}, headers, params.headers || {}),
            form: formData,
            gzip: true,
            pool: {
                maxSockets : 100
            }
        };

        /*区分request方式*/
        if (options.method.toLowerCase() === 'get' && querystring.stringify(formData)) {
            options.uri += '?' + querystring.stringify(formData);
        }
        // 访问终端;
        var device = [userAgent];
        if(isWeChat){
            device.unshift("微信端访问：");
        }else if(isAlipay){
            device.unshift("支付宝端访问：");
        }else if(isMamahao){
            device.unshift("妈妈好端访问：");
        }else{
            device.unshift("其他终端访问：");
        }

        // API请求日志打印;
        log.debug("\r\n\r\n");
        log.debug("API请求日志打印开始");
        log.info("url: " + options.uri);
        log.info("headers: " + JSON.stringify(options.headers));
        log.info("form: " + JSON.stringify(options.form));
        log.info("device: " + JSON.stringify(device));
        log.debug("API请求日志打印结束\r\n\r\n");


        /*callback*/
        function callback(error, response, body) {

            if (response) {
                //log.info('response--->' + JSON.stringify(response));
                var end = new Date().getTime();
                log.info('[api:', params.url, '], [status:', response.statusCode, ', 耗时:', (end - start), 'ms], response body--->', body);
            }

            //  成功 {success: true, msg: 'success'}
            //  失败 {error_code: 1001, msg: '404 error'}
            if (!error && response.statusCode === 200) {
                log.info('[typeof http_client response body] , type--->', typeof body);
                var info = (body ? JSON.parse(body) : {}) || {};
                if (info.error_code) {

                    //未登录状态设置统一状态码
                    if (/^(-1|1001|1002)$/.test(info.error_code)) {
                        info.error_code = -1;
                    }

                    //返回错误信息
                    var errorInfo = {status: response.statusCode, error_code: info.error_code, msg: info.error};
                    if (params.error) {
                        return params.error.call(this, errorInfo);
                    }

                    //处理错误，区分来源是否为ajax请求
                    if (isAjax) {
                        res.status(errorInfo.status).json(errorInfo);
                    } else {
                        res.render('error', errorInfo);
                    }
                } else {
                    if ("[object Object]" === Object.prototype.toString.call(info)) {
                        var originalData = $.extend({}, info); //保留原始数据
                        //log.info("originalData-------------->", JSON.stringify(originalData));

                        if (info.success_code == 200) {
                            info.success = true;    //添加成功标识
                        }
                        info.request = options.form;  //请求参数返回
                        info.location = location;   //地理位置信息
                        //log.info("info-------------->", JSON.stringify(info));
                    }
                    params.success && params.success.call(this, info, originalData);
                }
            } else {
                //request error
                var end = new Date().getTime();
                log.info("http请求时间：" + (end - start) + "毫秒");
                var errorInfo = {};
                if (error) {
                    log.error('[error]', error);
                    errorInfo = {status: error.code, error_code: error.code, msg: error.errno};
                } else if (response) {
                    log.error('[error response]' + JSON.stringify(response));
                    errorInfo = {
                        status: response.statusCode,
                        error_code: response.statusCode,
                        msg: response.statusCode + ' error'
                    };
                }
                if (params.error) {
                    return params.error.call(this, errorInfo);
                }

                //处理错误，区分来源是否为ajax请求
                if (isAjax) {
                    res.status(errorInfo.status).json(errorInfo);
                } else {
                    res.render('error', errorInfo);
                }
            }
        }

        request(options, callback);
    }
};

module.exports = HttpClient;


