/*
 *  HttpClient
 *  封装request请求，使用方式和ajax的调用类似，以后可以在此对象上进行扩展其他方法
 *  by xqs 16/06/07
 * */
var request = require("request");

var HttpClient = {

    request: function (params) {

        /*根据配置文件取api地址*/
        var config = require('../config');
        var config_api = config.site.api;
        var config_default_url = 'http://' + config_api.host + ':' + config_api.port + config_api.root;
        console.log("path:"+config_default_url)
        var options = {
            method: params.type || 'POST',
            url: config_default_url + (params.url || '/'),
            headers: params.headers || {},
            form: params.data || {}
        };

        function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
                var info = JSON.parse(body);
                params.success && params.success.call(this, info);
            } else {
                console.log(typeof error)
                params.error && params.error.call(this, error);
            }
        }

        request(options, callback);
    }
};

module.exports = HttpClient;


