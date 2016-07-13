/*
 * 首页
 * by xqs
 * */
var page = {
    config: {
        // ajax向node请求的url;
        api: {
            home: "/home",
            orders: "/api/orders",
            orderDetail: "/api/order_detail",
            address: "/api/address",
            addressEdit: "/api/address_edit",
            addressGPS: "/api/address_gps",
            addressSearch: "/api/address_search",
            beans: "/api/beans",
            coupons: "/api/coupons",
            integral: "/api/integral"
        }
    },
    init: function () {
        page.bindEvents();
        page.setRouter();
    },
    bindEvents: function () {
        var $spa = $("#spa");

        /*输入关键字搜索*/
        $spa.on('click', '.js-street', function () {
            ///console.log(wx)
            location.href = '/center#/address/search';
        });

        /*定位*/
        $spa.on('click', '.js-gps', function () {
            ///console.log(wx)
            location.href = '/center#/address/gps';
        });
    },
    /*设置路由*/
    setRouter: function () {
        /*路由测试*/
        var router = new Router({
            container: '#spa',
            enter: 'enter',
            leave: 'leave',
            enterTimeout: 250,
            leaveTimeout: 250
        });

        var home = {
            url: '/',
            render: function (callback) {
                var template = $('#tpl_home').html();
                callback(null, template);
            },
            bind: function () {

            }
        };

        /*订单列表*/
        var orders = {
            url: '/orders',
            render: function (callback) {
                page.renderModule('orders', callback);
            },
            bind: function () {
                M.swipe.init();//初始化Swipe
            }
        };

        var order_detail = {
            url: '/order/detail/:orderNo/:queryType',
            render: function (callback) {
                var params = this.params;
                page.renderModule('orderDetail', callback, params);
            }
        };

        /*地址列表*/
        var address = {
            url: '/address',
            render: function (callback) {
                page.renderModule('address', callback);
            },
            bind: function () {
                var $spa = $("#spa"), $module = $(this);
                $spa.data('data', null);
            }
        };

        /*新增地址*/
        var address_add = {
            url: '/address/add',
            render: function () {
                return $('#tpl_address_add').html();
            },
            bind: function () {

                //读取已有数据
                var $spa = $("#spa"), $module = $(this);
                var data = $spa.data('data') || {};
                data.gps && $module.find('.street').val(data.gps);

                /*保存*/
                $('.js-submit').on('click', function () {
                    var data = page.getAddressData($('.u-form'));
                    M.ajax({
                        url: '/',
                        data: data,
                        success: function (res) {
                            console.log(res)
                        }
                    });
                });
            }
        };

        /*编辑地址*/
        var address_edit = {
            url: '/address/edit/:id',
            render: function (callback) {
                var params = this.params;
                page.renderModule('addressEdit', callback, params);
            },
            bind: function () {
                //读取已有数据
                var $spa = $("#spa"), $module = $(this);
                var data = $spa.data('data') || {};
                data.gps && $module.find('.street').val(data.gps);
            }
        };

        /*关键字搜索地址*/
        var address_search = {
            url: '/address/search',
            render: function () {
                return $('#tpl_address_search').html();
            },
            bind: function () {
                //读取已有数据
                var $spa = $("#spa"), $module = $(this);
                var data = $spa.data('data') || {};
                data.gps && $module.find('.street').val(data.gps);
            }
        };

        /*GPS地址定位列表*/
        var address_gps = {
            url: '/address/gps',
            render: function (callback) {
                M.wx.init();  //初始化微信授权
                M.wx.ready(function () {
                    wx.getLocation({
                        type: 'wgs84', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                        success: function (res) {
                            var latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
                            var longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
                            var speed = res.speed; // 速度，以米/每秒计
                            var accuracy = res.accuracy; // 位置精度

                            console.log(JSON.stringify(res))

                        }
                    });
                });


                //高德API查询周边地址列表
                AMap.service(["AMap.PlaceSearch"], function () {
                    var placeSearch = new AMap.PlaceSearch();

                    var cpoint = [120.192969, 30.229931]; //中心点坐标
                    placeSearch.searchNearBy('', cpoint, 500, function (status, result) {
                        //console.log(JSON.stringify(result))

                        var poiList = result.poiList.pois;
                        poiList.sort(function (a, b) {
                            return a.distance - b.distance;  //按照距离排序
                        });

                        var params = {data: JSON.stringify(poiList)};
                        page.renderModule('addressGPS', callback, params);
                    });
                });
            },
            bind: function () {
                var $module = $(this);
                $module.on('click', '.list li', function () {
                    var $this = $(this);
                    var data = $("#spa").data('data') || {};
                    data.gps = $this.find('dt').text();
                    $("#spa").data('data', data);
                    console.log($("#spa").data('data'))
                    window.history.go(-1);
                });
            }
        };

        // 妈豆列表；
        var beans = {
            url: '/beans',
            render: function (callback) {
                page.renderModule('beans', callback);
            },
            bind: function () {
                $.pagination({
                    container: '.m-record .list',
                    api: page.config.api['beans'],
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

        // 分员积分；
        var integral = {
            url: '/integral/:type',
            render: function (callback) {
                var params = this.params;
                page.renderModule('integral', callback, params);
            },
            bind: function () {
                M.swipe.init();//初始化Swipe
                $.pagination({  //分页
                    keys: {page: "pageNo"},   //设置分页参数关键字
                    container: '.ui-swipe-item .list',
                    api: page.config.api['integral'],
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
        // 优惠券；
        var coupons = {
            url: '/coupons',
            render: function (callback) {
                page.renderModule('coupons', callback);
            },
            bind: function () {
                M.swipe.init();//初始化Swipe
                $.pagination({  //分页
                    container: '.ui-swipe-item .list',
                    api: page.config.api['coupons'],
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

        router.push(home)
            .push(orders)
            .push(order_detail)
            .push(address)
            .push(address_add)
            .push(address_edit)
            .push(address_gps)
            .push(address_search)
            .push(beans)
            .push(integral)
            .push(coupons)
            .setDefault('/').init();
    },
    /*拼接地址表单数据*/
    getAddressData: function (form) {
        var data = {
            addrDetail: form.find('.name').val(),
            areaId: "",
            consignee: "",
            deliveryAddrId: "",
            gpsAddr: "",
            isDefault: "",
            lat: "",
            lng: "",
            memberId: "",
            phone: ""
        };
    },
    /*渲染模块*/
    renderModule: function (module, callback, params) {
        M.ajax({
            url: page.config.api[module],
            data: params || {},
            success: function (res) {
                console.log('success--->', res);
                var template = res.template;
                callback(null, template);
            },
            error: function (res) {
                var template = res.status + 'error';
                callback(null, template);
                console.log('show error template')
            }
        });
    }
};

page.init();