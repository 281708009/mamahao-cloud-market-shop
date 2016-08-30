(function () {
    // seajs 的简单配置
    seajs.config({
        //基础路径，也可定义基础路径为`/modules/`
        base: "",

        // 路径配置
        paths: {
            "app": '/modules/app',
            "jquery": '/modules/jquery',
            "3rd": '/modules/3rd'
        },

        // 设置别名，方便调用
        alias: {
            "jquery": "jquery/jq.2.1.min.js",
            "cookie": "jquery/jquery.cookie.js",
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
            'common'
        ],

        // 调试模式
        debug: false,

        // 文件编码
        charset: 'utf-8'
    });


    //一些常量配置
    window.CONST = {
        local_location: 'mmh_location',     //地理位置信息
        local_detail_location: 'mmh_detail_location',     //详情页地理位置信息
        local_search_history: 'mmh_search_history',     //历史搜素关键字
        local_search_params: 'mmh_search_params',     //搜索商品需要的参数
        local_qualityPic: 'mmh_qualityPic',  //质检担保图片
        local_cartId:'mmh_cartId',   // 购物车ID
        local_storeAddr: 'mmh_store_address',    // 门店用户收货地址
        local_settlement_addr: 'mmh_settlement_addr',    // 结算选择地址
        local_cart_newGoods: 'mmh_cart_newgoods',    // 购物车内新增商品
    };

})();
