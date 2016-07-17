(function () {
    // seajs 的简单配置
    seajs.config({
        base: "./modules/",

        // 设置别名，方便调用
        alias: {
            "headroom": "jquery/headroom.js",
            "router": "jquery/router.min.js",
            "swipe": "jquery/swipe.js",
            "weixin": "http://res.wx.qq.com/open/js/jweixin-1.0.0.js",
            "AMap": "http://webapi.amap.com/maps?v=1.3&key=97a72a5c35a9f4915293fdb121bbdc2a",
        },

        map: [
            //[ '.js', '-min.js' ]
        ],

        //use之前，预加载
        preload: [],

        // 调试模式
        debug: false,

        // 文件编码
        charset: 'utf-8'
    });

})();
