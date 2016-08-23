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
                myAddress: '/api/myAddress',
                addCollect: '/api/addCollect',
                delCollect: '/api/delCollect'
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
                    var params = {}, location = JSON.parse(localStorage.getItem(CONST.local_storeAddr)) || {};
                    // 本地是否缓存了地址;
                    if(location.deliveryAddrId){
                        $.extend(params, location, {
                            formattedAddress: location.gpsAddr + location.addrDetail
                        });
                    }
                    //$.extend(params, {memberId: 18}); // 临时用户id;
                    console.log(params);
                    callback.loadingDelay = 10; //出现loading的时机
                    page.renderModule('index', callback, params);
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
                url: '/detail/:shopId/',
                render: function (callback) {
                    var params = this.params, location = JSON.parse(localStorage.getItem(CONST.local_storeAddr)) || {};
                    // 本地是否缓存了地址;
                    if(location.deliveryAddrId){
                        $.extend(params, location, {
                            formattedAddress: location.gpsAddr + location.addrDetail
                        });
                    }
                    store_detail.params = params;
                    page.renderModule('detail', callback, params);
                },
                bind: function () {
                    var $module = $(this), o = page.info;
                    //console.log();
                    // 关注门店;
                    o.collect = $(".js-collect");
                    o.collect.on("click", ".u-btn", function () {
                        var thas = $(this), data = {
                            collectid: o.collect.data("collectid"), // 收藏id;
                            collectItemId: o.collect.data("id"), // 门店id;
                            collectType: 3 // 类型 1_商品2_品牌3_门店
                        };
                        if(thas.hasClass("active")){
                            // 已关注;
                            data.status = 1;
                        }else{
                            // 未关注;
                            data.status = 0;
                        }
                        page.setCollect(data);
                    });
                    // 打开地图;
                    o.location = $(".js-open-location");
                    o.location.on("click", function () {
                        page.openLocation();
                    });
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
        },
        // 设置门店关注;
        setCollect: function (params) {
            var o = page.info, count = $(".js-collect-count");
            if(params.status){
                // 取消关注门店;
                var data = JSON.stringify($.extend({}, {
                    collectIds: params.collectid
                }));
                M.ajax({
                    url: page.config.api['delCollect'],
                    data: {data: data},
                    success:function(res){
                        if(res.success_code == 200){
                            o.collect.find(".u-btn").removeClass("active").addClass("success").html("+ 关注");
                            count.text(Number(count.text()) - 1);
                            M.tips("取消关注成功");
                        }else{
                            M.tips(res.msg);
                        }
                    }
                });
            }else{
                // 关注门店;
                var data = JSON.stringify($.extend({}, {
                    collectType: params.collectType,
                    collectItemId: params.collectItemId
                }));
                M.ajax({
                    url: page.config.api['addCollect'],
                    data: {data: data},
                    success:function(res){
                        if(res.success_code == 200){
                            o.collect.data("collectid", res.data.collectId).find(".u-btn").removeClass("success").addClass("active").html("已关注");
                            count.text(Number(count.text()) + 1);
                            M.tips({class: "true", body: "关注成功", delay: 2000});
                        }else{
                            M.tips(res.msg);
                        }
                    }
                });
            }
        },
        // 打开地图;
        openLocation: function () {
            var o = page.info, json = o.location.data("basic");
            require.async('weixin', function (wx) {
                wx.openLocation({
                    latitude: Number(json.lat), // 纬度，浮点数，范围为90 ~ -90
                    longitude: Number(json.lng), // 经度，浮点数，范围为180 ~ -180。
                    name: json.shopName, // 位置名
                    address: json.shopAddr, // 地址详情说明
                    scale: 14, // 地图缩放级别,整形值,范围从1~28。默认为最大
                    infoUrl: '' // 在查看位置界面底部显示的超链接,可点击跳转
                });
            });
        }
        
    };

    page.init();

});