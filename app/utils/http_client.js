/*
 *  HttpClient
 *  封装request请求，使用方式和ajax的调用类似，以后可以在此对象上进行扩展其他方法
 *  error callback对象不设置时，会统一错误处理
 *  req参数必传
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
        var req = args[0],res = args[1];  //取参数

        console.log('req---->',req);

        /*根据配置文件取api地址*/
        var config_api = AppConfig.site.api;  //config api
        var baseUrl = 'http://' + config_api.host + ':' + config_api.port + config_api.root; //baseUrl
        var session = req && req.session || {};  //session

        /*参数*/
        var options = {
            method: params.type || 'POST',
            uri: baseUrl + params.url || '/',
            headers: params.headers || session.user
                ? {
                memberId: session.user.id,
                token: session.user.token
            }
                : {},
            body: querystring.stringify(params.data || {})
        };

        // API请求日志打印;
        console.log("\r\n\r\nAPI请求日志打印开始");
        console.log("session:" + JSON.stringify(session));
        console.log("url:" + options.uri);
        console.log("headers:" + JSON.stringify(options.headers));
        console.log("body:" + options.body);
        console.log("\r\nAPI请求日志打印结束\r\n\r\n");


        /*callback*/
        function callback(error, response, body) {

            console.log('response--->' + JSON.stringify(response));
            console.log('response body--->' + body);

            //  成功 {success: true, msg: 'success'}
            //  失败 {error_code: 1001, msg: '404 error'}
            if (!error && response.statusCode === 200) {
                var info = JSON.parse(body);
                if (info != null && !info.error_code) {
                    params.success && params.success.call(this, info);
                } else {
                    var error = {error_code: info.error_code, msg: info.error};
                    if(params.error){
                        return params.error.call(this, error);
                    }
                    res.json(error);

                }
            } else {
                var error = {error_code: response.statusCode, msg: response.statusCode + ' error'};
                if(params.error){
                    return params.error.call(this, error);
                }
                res.json(error);
            }
        }

        request(options, callback);
    },
    /*
     * fetch
     * @req [Object] 必需
     * @params [Object] 必需
     * */
    fetch: function (req, params) {
        var fetch = require('node-fetch');
        var req = args[0],res = args[1];  //取参数

        console.log('req---->',req);

        /*根据配置文件取api地址*/
        var config_api = AppConfig.site.api;  //config api
        var baseUrl = 'http://' + config_api.host + ':' + config_api.port + config_api.root //baseUrl
            , requestUrl = baseUrl + params.url || '/';
        var session = req && req.session || {};  //session

        /*参数*/
        var options = {
            method: params.type || 'POST',
            headers: params.headers || session.user
                ? {
                memberId: session.user.id,
                token: session.user.token
            }
                : {},
            body: querystring.stringify(params.data || {})
        };

        fetch(requestUrl, options)
            .then(function (response) {
                //console.log('response--->' + JSON.stringify(response));
                if (/^2\d{2}$/.test(response.status)) {
                    //成功状态码200-299
                    return response.json();
                } else {
                    var exception = new Error(response.statusText);
                    exception.status = response.status;
                    throw exception;
                }
            })
            .then(function (data) {
                console.log('response data--->' + JSON.stringify(data));
                params.success && params.success.call(this, data);
            }).catch(function (error) {
                console.log('Fetch failed', error)
            });
    }
};

module.exports = HttpClient;


