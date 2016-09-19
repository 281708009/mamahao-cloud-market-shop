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
                "detail": "/api/goods_detail",
                "promoteGroup": "/api/goods_promoteGroup",
                "quality": "/api/goods_quality"
            }
        },
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件
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
                    page.renderModule('goods_list', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    require.async('app/goods_list', function (page) {
                        page.init($module);
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
                    var $module = $(this);
                    require.async('app/search', function (page) {
                        page.init($module);
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

            //详情
            var detail = {
                url: '/detail/:params?',
                render: function (callback) {
                    //hash值后的url参数
                    var hashParams = M.url.getParams(this.params.params);  //json params
                    var locationInfo = JSON.parse(localStorage.getItem(CONST.local_detail_location));
                    detail.params = hashParams;
                    if (locationInfo) {
                        detail.params.location = locationInfo;
                    }
                    page.renderModule('detail', callback, detail.params);
                },
                bind: function () {
                    var $module = $(this);
                    if (!$module.find('.u-null-all')[0]) {
                        require.async('app/goods_detail', function (page) {
                            page.init($module, detail.params);
                        });
                    }
                }
            };

            //促销套餐列表
            var promoteGroup = {
                url: '/promoteGroup/:styleNumId?',
                render: function (callback) {
                    var params = this.params;
                    var locationInfo = JSON.parse(localStorage.getItem(CONST.local_detail_location));
                    if (locationInfo) {
                        params.areaId = locationInfo.areaId;
                        params.lat = locationInfo.lat;
                        params.lng = locationInfo.lng;
                    }
                    page.renderModule('promoteGroup', callback, params);
                },
                bind: function () {
                    require.async('app/goods_promote', function (page) {
                        page.init();
                    });
                }
            };

            //质检报告
            var quality = {
                url: '/quality/:templateId',
                render: function (callback) {
                    //hash值后的url参数
                    var params = this.params;
                    var pics = JSON.parse(localStorage.getItem(CONST.local_qualityPic)) || {},
                        templateId = params.templateId,
                        qualityPic = pics[templateId];

                    page.renderModule('quality', callback, qualityPic);
                },
                bind: function () {
                    //M.lazyLoad.init();
                }
            };

            router.push(home)
                .push(list)
                .push(search)
                .push(filter)
                .push(detail)
                .push(promoteGroup)
                .push(quality)
                .setDefault('/').init();
        },
        /*渲染模块*/
        renderModule: function (module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        }
    };

    page.init();
});