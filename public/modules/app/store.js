/**
 * Created by Adang on 2016/7/27.
 */
define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/storeList',
                detail: '/api/storeDetail',
                myServerStore: '/api/myServerStore',
                myShowStore: '/api/myShowStore',
                myAddress: '/api/myAddress'
            }
        },
        info: {},
        init: function () {
            var self = this, o = self.info;
            require.async('router', page.setRouter); //加载路由库文件

            page.bindEvents();
        },
        bindEvents: function () {
            var self = this, o = self.info;

            //console.log(o.container)
        },
        setRouter:function () {
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });

            // 门店列表;
            var home = {
                url: '/',
                render: function (callback) {
                    //获取地理位置信息
                    require.async('app/location', function (obj) {
                        new obj().getLocation({
                            success: function (res) {
                                //console.log(res)
                                var params = {
                                    isLocal: 1
                                }, location = JSON.parse(localStorage.getItem(CONST.local_storeAddr)) || {};
                                // 本地是否缓存了地址;
                                if(location.deliveryAddrId){
                                    $.extend(params, location, {
                                        formattedAddress: location.gpsAddr + location.addrDetail
                                    });
                                    if(location.city != res.city){
                                        params.isLocal = 0; // 非当前定位区域收货地址地址;
                                    }
                                }else{
                                    $.extend(params, res);
                                }
                                //$.extend(params, {memberId: 18}); // 临时用户id;
                                page.config.gps = params; // 缓存地理位置信息;
                                console.log(params);
                                callback.loadingDelay = 10; //出现loading的时机
                                page.renderModule('index', callback, params);
                            },
                            fail: function () {
                                var template = $('#tpl_null').html();
                                callback(null, template);
                            }
                        });
                    })
                },
                bind: function () {
                    var $module = $(this), o = page.info, c = page.config;
                    // 点击查看服务详情;
                    page.setService($module);
                    // 切换地址;
                    o.popAddress = $(".m-select-address");
                    $(".js-change-address").on("click", function () {
                        o.popAddress.addClass("show");
                        page.getAddress();
                    })
                    o.popAddress.on("click", ".js-close", function () {
                        o.popAddress.removeClass("show");
                    });
                    o.popAddress.on("click", ".js-gps-address", function () {
                        localStorage.removeItem(CONST.local_storeAddr);
                        window.location.reload();
                    });
                    // 首页附近的实体店分页;
                    $(".pagination").data('params', {
                        lat: page.config.gps.lat,
                        lng: page.config.gps.lng,
                        areaId: page.config.gps.areaId,
                        isLocal: page.config.gps.isLocal
                    });  //存储分页所需的参数
                    $.pagination({
                        keys: {count: "count"},
                        scrollBox: '.m-stores',
                        api: page.config.api['index'],
                        fnSuccess: function (res, ele) {
                            var data = res.data;
                            if (!data.template) {
                                return ele.data('locked', true)
                            }
                            ele.append(data.template);
                        }
                    });
                }
            };
            // 门店详情;
            var store_detail = {
                url: '/detail/:shopId/:isLocal?',
                render: function (callback) {
                    var params = this.params;
                    store_detail.params = params;
                    page.renderModule('detail', callback, params);
                },
                bind: function () {
                    var $module = $(this), o = page.info;
                    //console.log();
                    // 点击查看服务详情;
                    page.setService($module);
                    // 展开显示更多详情;
                    var basic = $(".js-store-basic");
                    basic.on("click", ".js-more", function () {
                        var thas = $(this);
                        if(basic.hasClass("up")){
                            basic.removeClass("up");
                            thas.find("span").text("收起");
                        }else{
                            basic.addClass("up");
                            thas.find("span").text("更多");
                        }
                    });
                    // 切换商品分类;
                    var tab = $(".js-goods-tab li");
                    tab.on("click", function () {
                        var thas = $(this);
                        if(thas.hasClass("active")) return;
                        tab.removeClass("active");
                        thas.addClass("active");
                        page.cutoverGoodsList({
                            ajax: true,
                            tabId: thas.data("id"),
                            showTab: 0,
                            pageSize: 10,
                            page: 1,
                            shopId: store_detail.params.shopId
                        });
                        console.log($(this).data("id"));
                    });
                    //懒加载
                    M.lazyLoad.init({
                        container: ".node-stores-detail-goods"
                    });
                    // 门店商品分页;
                    $(".pagination").data('params', {
                        showTab: 0,
                        pageSize: 10,
                        tabId: -1,
                        shopId: store_detail.params.shopId
                    });  //存储分页所需的参数
                    $.pagination({
                        keys: {index: "nextPageStart"},
                        scrollBox: '.spa',
                        api: page.config.api['detail'],
                        fnSuccess: function (res, ele) {
                            var data = res.data;
                            if (!data.template) {
                                return ele.data('locked', true)
                            }
                            ele.append(data.template);
                            //懒加载
                            M.lazyLoad.init({
                                container: ele
                            });
                        }
                    });
                }
            };

            // 我的服务店
            var my_server_store = {
                url: '/list/server/:isLocal?',
                render: function (callback) {
                    var params = this.params;
                    //console.log();
                    //$.extend(params, {memberId: 18, areaId: 330102}); // 临时参数;
                    page.renderModule('myServerStore', callback, params);
                },
                bind: function () {
                    var $module = $(this), o = page.info;
                    // 点击查看服务详情;
                    page.setService($module);
                }
            };

            // 我的关注店
            var my_show_store = {
                url: '/list/show/:isLocal?',
                render: function (callback) {
                    var params = this.params;
                    //console.log();
                    //$.extend(params, {memberId: 18, areaId: 330102}); // 临时参数;
                    page.renderModule('myShowStore', callback, params);
                },
                bind: function () {
                    var $module = $(this), o = page.info;
                    // 点击查看服务详情;
                    page.setService($module);
                }
            };

            router.push(home)
                .push(store_detail)
                .push(my_server_store)
                .push(my_show_store)
                .setDefault('/').init();

        },
        /*渲染模块*/
        renderModule: function (module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        },
        // 设置点击服务弹出层;
        setService: function (module) {
            var $module = module, o = page.info;
            // 控制列表进详情;
            $(".u-stores").on("click", ".list a", function (e) {
                e.preventDefault();
                var target = $(e.target), thas = $(this);
                if(!target.parents(".js-service").length){
                    window.location.hash = thas.attr("href");
                }
            });
            // 点击查看服务详情;
            o.popService = $(".u-stores-service");
            $module.on("click", ".js-service li", function () {
                page.showService($(this).parents(".js-service").data('json'));
            });
            o.popService.on("click", ".js-close,.mask", function () {
                o.popService.removeClass("show");
            });
        },
        // 弹出查看服务详情;
        showService: function (data) {
            var self = this, o = self.info, l = data.length, arr = [];
            if(!l) return;
            for(var i = 0; i < l; i++){
                arr.push('<li><div class="icon"><img src="'+ data[i].tagPic +'@40w_40h_100q.jpg" alt=""></div><dl><dt>'+ data[i].tagTitle +'</dt><dd>'+ data[i].tagDesc +'</dd></dl></li>');
            }
            o.popService.addClass("show").find(".list").html(arr.join(''));
            //console.log(data);
        },
        // 获取收货地址列表;
        getAddress: function(params){
            var self = this, o = self.info, data = JSON.stringify($.extend({}, params));
            // memberId: 23
            if(o.popAddress.find(".list li").length) return;
            M.ajax({
                url: page.config.api['myAddress'],
                data: {data:data},
                success:function(res){
                    if(res.template){
                        o.popAddress.find(".list").html(res.template);
                        self.setAddress();
                    }
                    //console.log(res);
                },
                error: function (res) {}
            });
        },
        // 切换地址
        setAddress: function () {
            var self = this, o = self.info;
            o.popAddress.on("change", ".u-radio", function () {
                var thas = $(this).parents("li");
                localStorage.setItem(CONST.local_storeAddr, JSON.stringify(thas.data("json")));
                window.location.reload();
                //console.log(localStorage.getItem(CONST.local_storeAddr));
            });
        },
        // 门店商品列表
        cutoverGoodsList: function (params) {
            var data = JSON.stringify($.extend({}, params)), elems = $(".pagination");
            //console.log(data);
            elems.data('params', params).data("locked", false); // 重置分页参数;

            M.ajax({
                url: page.config.api['detail'],
                data: {data:data},
                success:function(res){
                    res.template && elems.html(res.template);
                    //懒加载
                    M.lazyLoad.init({
                        container: ".node-stores-detail-goods"
                    });
                    console.log(res);
                }
            });
        }
        
    };

    page.init();

});