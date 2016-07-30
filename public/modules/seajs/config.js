(function () {
    // seajs 的简单配置
    seajs.config({
        //基础路径，也可定义基础路径为`/modules/`
        base: "",

        // 路径配置
        paths: {
            app: '/modules/app',
            jquery: '/modules/jquery'
        },

        // 设置别名，方便调用
        alias: {
            "jquery": "jquery/jq.2.1.min.js",
            "fastclick": "jquery/fastclick.min.js",
            "headroom": "jquery/headroom.js",
            "router": "jquery/router.min.js",
            "pjax": "jquery/jquery.pjax.js",
            "swipe": "jquery/swipe.js",
            "lazyload": "jquery/jq.lazyload.min.js",
            "dropload": "jquery/dropload.min.js",
            "common": "app/common.js",
            "weixin": "http://res.wx.qq.com/open/js/jweixin-1.0.0.js",
            "AMap": "http://webapi.amap.com/maps?v=1.3&key=97a72a5c35a9f4915293fdb121bbdc2a",
        },

        map: [
            //[ '.js', '-min.js' ]
        ],

        //use之前，预加载
        preload: [
            'fastclick', 'common'
        ],

        // 调试模式
        debug: false,

        // 文件编码
        charset: 'utf-8'
    });


    //一些常量配置
    window.CONST = {
        local_location: 'mmh_location',     //地理位置信息
        local_qualityPic: 'mmh_qualityPic'  //质检担保图片
    };

})();
