/*
 * 商品列表（包括商品分类列表和搜索列表）
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                "home": "/api/goods_type",
                "goods_list": "/api/goods_list",
                "search": "/api/search",
                "filter": "/api/filter",
            }
        },
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件
            page.bindEvents();
        },
        /*设置路由*/
        setRouter: function () {

            /*路由测试*/
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });

            var home = {
                url: '/',
                render: function (callback) {
                    callback.loadingDelay = 10; //出现loading的时机
                    page.renderModule('home', callback);
                },
                bind: function () {
                    require.async('app/goods_type', function (page) {
                        page.init();
                    });
                }
            };

            //分类或品牌列表、搜索结果商品列表
            var list = {
                url: '/list/:params?',
                render: function (callback) {
                    //hash值后的url参数
                    var hashParams = M.url.getParams(this.params.params);  //json params

                    //与localStorage数据合并
                    var params = $.extend(JSON.parse(localStorage.getItem(CONST.local_search_params)), hashParams);

                    //获取地理位置信息
                    require.async('app/location', function (obj) {
                        new obj().getLocation({
                            success: function (res) {
                                params.lat = res.lat;
                                params.lng = res.lng;
                                params.areaId = res.areaId;
                                page.renderModule('goods_list', callback, params);
                            },
                            fail: function () {
                                page.renderModule('goods_list', callback, params);
                            }
                        });
                    });
                },
                bind: function () {
                    require.async('app/goods_list', function (page) {
                        page.init();
                    });
                }
            };

            //搜索
            var search = {
                url: '/search/:keywords?',
                render: function (callback) {
                    var params = this.params;
                    params.historyWords = JSON.parse(localStorage.getItem(CONST.local_search_history)) || [];
                    page.renderModule('search', callback, params);
                },
                bind: function () {
                    require.async('app/search', function (page) {
                        page.init();
                    });
                }
            };

            //筛选
            var filter = {
                url: '/filter/:params?',
                render: function (callback) {
                    //hash值后的url参数
                    var hashParams = M.url.getParams(this.params.params);  //json params
                    page.renderModule('filter', callback, hashParams);
                },
                bind: function () {
                    require.async('app/filter', function (page) {
                        page.init();
                    });
                }
            };

            router.push(home)
                .push(list)
                .push(search)
                .push(filter)
                .setDefault('/').init();
        },
        bindEvents: function () {


        },
        /*渲染模块*/
        renderModule: function (module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        }
    };

    page.init();
});