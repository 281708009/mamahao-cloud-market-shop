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

        var isAjax = req.headers['ajax'] ? true : false;

        //console.log('req---->',req);

        /*根据配置文件取api地址*/
        var config_api = AppConfig.site.api;  //config api
        var baseUrl = 'http://' + config_api.host + ':' + config_api.port + config_api.root; //baseUrl
        var session = req && req.session || {};  //session

        /*参数*/
        var options = {
            method: params.type || 'POST',
            baseUrl: baseUrl,
            uri: params.url || '/',
            headers: params.headers || session.user
                ? {
                memberId: session.user.id,
                token: session.user.token
            }
                : {},
            form: params.data || {}
        };

        /*区分request方式*/
        if (options.method.toLowerCase() === 'get') {
            if (params.data) {
                options.url += '?' + querystring.stringify(params.data);
            }
        }

        // API请求日志打印;
        console.log("\r\n\r\nAPI请求日志打印开始");
        console.log("session: " + JSON.stringify(session));
        console.log("url: " + baseUrl + options.uri);
        console.log("headers: " + JSON.stringify(options.headers));
        console.log("form: " + JSON.stringify(options.form));
        console.log("\r\nAPI请求日志打印结束\r\n\r\n");


        /*callback*/
        function callback(error, response, body) {

            if (response) {
                //console.log('response--->' + JSON.stringify(response));
                console.log('response body, status:', response.statusCode, '--->', body);
            }

            //  成功 {success: true, msg: 'success'}
            //  失败 {error_code: 1001, msg: '404 error'}
            if (!error && response.statusCode === 200) {
                var info = JSON.parse(body);
                if (info.error_code) {

                    //未登录状态设置统一状态码
                    if (/^(-1|1001)$/.test(info.error_code)) {
                        info.error_code = -1;
                    }

                    //返回错误信息
                    var errorInfo = {status: response.statusCode, error_code: info.error_code, msg: info.error};
                    if (params.error) {
                        return params.error.call(this, errorInfo);
                    }

                    //处理错误，区分来源是否为ajax请求
                    if(isAjax){
                        res.status(errorInfo.status).json(errorInfo);
                    }else{
                        res.render('error', errorInfo);
                    }
                } else {
                    params.success && params.success.call(this, info);
                }
            } else {
                //request error
                var errorInfo = {};
                if(error){
                    console.warn(error);
                    errorInfo = {status: error.code, error_code: error.code, msg: error.errno};
                }else if (response) {
                    console.log('response--->' + JSON.stringify(response));
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
                if(isAjax){
                    res.status(errorInfo.status).json(errorInfo);
                }else{
                    res.render('error', errorInfo);
                }
            }
        }

        request(options, callback);
    }
};

module.exports = HttpClient;


