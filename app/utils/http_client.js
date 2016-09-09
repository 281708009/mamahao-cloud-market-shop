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

var HttpClient = {

    /*
     * request
     * @args [Object] 必需，包含request和response
     * @params [Object] 必需
     * */
    request: function (args, params) {
        var request = require("request");
        var req = args[0], res = args[1], next = args[2];  //取参数

        var isAjax = req.get('ajax') ? true : false;

        //console.log('req---->',req);

        /*根据配置文件取api地址*/
        var config_api = AppConfig.site.api;  //config api
        var baseUrl = 'http://' + config_api.host + ':' + config_api.port + config_api.root; //baseUrl
        var session = req && req.session || {};  //session

        var headers = {"User-Agent": "[node request], MamHao V2.5.6 2016072803"};
        if (session.user) {
            //已登录用户
            headers.memberId = session.user.id;
            headers.token = session.user.token;
        }

        /*参数*/
        var location = querystring.parse(req.get('location'));  //header中的定位信息
        var locationParams = location ? {
            areaId: location.areaId,
            lat: location.lat,
            lng: location.lng
        } : {};
        var formData = $.extend({}, locationParams, params.data || {});  //data参数覆盖header中的信息

        var options = {
            method: params.type || 'POST',
            baseUrl: '',  //基础路径设置为空
            uri: /^http/.test(params.url) ? params.url : (baseUrl + params.url || '/'),
            headers: $.extend({}, headers, params.headers || {}),
            form: formData
        };

        /*区分request方式*/
        if (options.method.toLowerCase() === 'get' && querystring.stringify(formData)) {
            options.uri += '?' + querystring.stringify(formData);
        }

        // API请求日志打印;
        log.info("\r\n\r\nAPI请求日志打印开始");
        log.info("session: " + JSON.stringify(session));
        log.info("url: " + options.uri);
        log.info("headers: " + JSON.stringify(options.headers));
        log.info("form: " + JSON.stringify(options.form));
        log.info("\r\nAPI请求日志打印结束\r\n\r\n");


        /*callback*/
        function callback(error, response, body) {

            if (response) {
                //log.info('response--->' + JSON.stringify(response));
                log.info('response body,[api:', params.url, '],[status:', response.statusCode, ']--->', body);
            }

            //  成功 {success: true, msg: 'success'}
            //  失败 {error_code: 1001, msg: '404 error'}
            if (!error && response.statusCode === 200) {
                var info = body ? JSON.parse(body) : {};
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
                    if (info.success_code == 200) {
                        info.success = true;    //添加成功标识
                    }
                    info.request = options.form;  //请求参数返回
                    info.location = location;   //地理位置信息
                    params.success && params.success.call(this, info);
                }
            } else {
                //request error
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


