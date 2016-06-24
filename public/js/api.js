/*
 * ajax api
 * desc: 页面ajax请求api
 * 调用方式：API.async({name:api_name,data:request_params,callback:callback})
 * */

(function () {
    /*服务器API接口列表*/
    var config = {
        api: {
            "login": "/login",                                      // 登录
            "vcode": "/sendMessage",                               // 发送验证码
        }
    };

    var API = {
        /*ajax 请求*/
        async: function (args) {
            M.ajax({
                url: config.api[args.name] || '',
                data: args.data,
                success: args.success,
                error: args.error,
                complete: args.complete
            });
        },
        /*获取配置url*/
        url: function (name) {
            return config.api[name] || '';
        }
    };

    window.API = API;

})();