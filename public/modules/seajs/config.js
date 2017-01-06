(function () {
    // seajs 的简单配置
    seajs.config({
        //基础路径，也可定义基础路径为`/modules/`
        // 正式CDN地址;
        //base: "http://img.mamhao.cn/s/m/v1/js/1.1/",

        // 不加CDN-已压缩;
        //base: "http://s.mamhao.cn/m/v1/js/1.3/",

        // 不加CDN-未压缩;
        base: "/modules/",

        // 路径配置
        paths: {
            // CDN地址;
            // "mamahao": 'mamahao/',
            // "middleware": 'middleware/',
            // "activity": 'http://img.mamhao.cn/s/m/activity',
            // "topic": 'http://s.mamhao.cn/m/topic'

            // 不加CDN;
            "mamahao": 'mamahao/',
            "middleware": 'middleware/',
            "activity": 'http://s.mamhao.cn/m/activity',
            "topic": 'http://s.mamhao.cn/m/topic'
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
            "dropload": "jquery/dropload.js",
            "picker": "jquery/picker.js",
            "hash": "jquery/jquery.hash.js",
            "common": "app/common.js",
            "sdk": "http://s.mamhao.cn/app/static/js/APP.sdk.js",
            "weixin": "http://res.wx.qq.com/open/js/jweixin-1.0.0.js",
            "AMap": "http://webapi.amap.com/maps?v=1.3&key=97a72a5c35a9f4915293fdb121bbdc2a",
            "ali-oss": "http://gosspublic.alicdn.com/aliyun-oss-sdk-4.4.4.min.js",
            "imagesloaded": "http://img.mamhao.cn/s/common/js/imagesloaded.min.js"
        },

        map: [
            //[ '.js', '-min.js' ]
        ],

        //use之前，预加载
        preload: [
            //'common'
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
        local_cartId: 'mmh_cartId',   // 购物车ID
        local_settlement_addr: 'mmh_settlement_addr',    // 结算选择地址
        local_cart_newGoods: 'mmh_cart_newgoods',    // 购物车内新增商品
        local_sale_haveRead: 'mmh_sale_haveRead',     // 每月购已读清单
        local_sale_areaId: 'mmh_sale_areaId',    // 每月购用户主动切换的区域id
        local_sale_promise: 'mmh_sale_promise',// 每月购服务承诺底图显示
        local_store_gps: 'mmh_local_gps',       // 用户GPS定位地址，前端校验使用
        local_cookie_location: 'mmh_app_location' // 地理位置信息，cookie存储，给node端获取使用
    };

    //更新缓存
    seajs.updata_version = '?v=2017010509';

    //添加seajs：run函数
    seajs.dependencies = ['jquery', 'fastclick', 'weixin', 'AMap', 'common'];
    // 妈妈好内部，加入 appsdk.js
    if (/mamhao|mamahao/gi.test(navigator.userAgent)) {
        seajs.dependencies.push('sdk');
    }
    seajs.run = function (path, callback) {
        //window.timer = +new Date;
        seajs.use(seajs.dependencies, function () {
            //confirm('测试代码：加载seajs依赖耗时--->' + (+new Date - timer) + 'ms');
            if (path) {
                //处理路径
                if (Object.prototype.toString.call(path) === '[object Array]') {
                    path.forEach(function (v, i) {
                        //补全后缀
                        if (!/\.js$/gi.test(v)) v += '.js';
                        if (!/\?/g.test(v)) v += seajs.updata_version;
                    });
                } else {
                    if (!/.js$/gi.test(path)) path += '.js';
                    if (!/\?/g.test(path)) path += seajs.updata_version;
                }
                seajs.use(path, function (e) {
                    callback && callback.call(this, e);
                });
            } else {
                callback && callback.call(this, e);
            }

        });
    };


})();
