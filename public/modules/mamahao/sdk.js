/**
 * 妈妈好APP交互SDK.js
 * date: 2016-12-08
 * update：2016-12-08
 */
define(function(require, exports, module) {
    var SDK = {
        tools: {
            Typeof: function (v) {
                return Object.prototype.toString.call(v).slice(8, -1).toLowerCase();
            },
            param: function( a ) {
                var s = [];
                for( key in a){
                    s.push([key, encodeURIComponent(a[key])].join("="));
                }
                return s.join("&");
            }
        },
        config: {
            //host: "//m.mamahao.com/routes/",          // 正式
            host: "//m.mamhao.com/routes/",             // 测试
            type: ["native", "tools", "web", "weex"]    // 类型
        },
        open: function (options) {
            var self = this, c = self.config, tools = self.tools;
            // 事件类型;
            if(c.type.toString().indexOf(options.type) === -1) return alert("Error：Missing required parameter.");
            // 方法名称校验;
            if(!options.target) return alert("Error：Missing required parameter.");
            // 参数处理;
            if(tools.Typeof(options.params) === "object"){
                options.params = JSON.stringify(options.params);
            }
            // 回调方法处理;
            if(tools.Typeof(options.callback) === "function"){
                var callbackName = "MMH_" + +new Date(),    // 自动生成的随机函数名
                    oldCallback = options.callback;         // 记录实际回调内容
                window[ callbackName ] = function () {
                    oldCallback(arguments[0], arguments);   // 执行回调，传参
                    delete window[ callbackName ];          // 删除回调方法
                };
                options.callback = callbackName;            // 回调函数名给客服端;
            }
            self.start(tools.param(options));
        },
        start: function (params) {
            var self = this, c = self.config;
            var d = document.createElement("IFRAME");
            d.src = [c.host, "?", params].join('');
            d.style.display = "none";
            document.body.appendChild(d);
            //d.onload = function () {}
            console.log(d.src);
        }
    };
    module.exports = SDK;
});
