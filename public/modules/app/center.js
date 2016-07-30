/*
 * 首页
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                home: "/home",
                orders: "/api/orders",
                orderDetail: "/api/order_detail",
                orderResult: "/api/order_result",
                address: "/api/address",
                addressEdit: "/api/address_edit",
                addressGPS: "/api/address_gps",
                addressSearch: "/api/address_search",
                addressSave: "/api/address/save",
                queryArea: "/api/address/queryArea",
                beans: "/api/beans",
                coupons: "/api/coupons",
                integral: "/api/integral",
                orderExpress: "/api/order_express",
                orderReview: "/api/order_review",
                orderReviewDetail:"/api/order_review_detail"
            }
        },
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件

            page.bindEvents();
        },
        bindEvents: function () {
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
                    var template = $('#tpl_home').html();
                    callback(null, template);
                },
                bind: function () {

                }
            };

            /*订单列表*/
            var orders = {
                url: '/orders',
                className: 'm-order',
                render: function (callback) {
                    page.renderModule('orders', callback);
                },
                bind: function () {
                    var $module = $(this);
                    require.async('app/order', function (func) {
                        new func(page, $module).render();
                    });
                }

            };
            /* 订单详情 */
            var order_detail = {
                url: '/order/detail/:orderNo/:queryType?',
                render: function (callback) {
                    this.params.queryType && (this.params.queryType = +this.params.queryType);
                    var params = this.params;
                    page.renderModule('orderDetail', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    require.async('app/order', function (func) {
                        new func(page, $module).render();
                    });
                }
            };
            /* 物流详情 */
            var order_express = {
                url: '/order/express/:orderNo',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderExpress', callback, params);
                },
                bind: function () {
                    var $this = $(this);
                    $this.on('click', '.more-show', function () {
                        var $list = $(this).prev();
                        $list.toggleClass('in');
                        $(this).find('em').html($list.is('.in') ? '隐藏商品' : ('显示其余' + $(this).data('num') + '件'));
                    })
                }
            };
            /* 订单评价 */
            var order_review = {
                url: '/order/review/:orderNo',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderReview', callback, params);
                },
                bind: function(){

                }
            };
            /* 订单评价详情 */
            var order_review_detail = {
                url: '/order/reviewDetail/:orderNo/:itemId?',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderReviewDetail', callback, params);
                },
                bind: function(){
                    var $this = $(this);
                    $this.on('click','.js-review-submit',function(){
                        var data = $(this).data('params');
                        data.content = $('#reviewCtn').val();
                        data.deliverySpeedStar = +$('#deliverySpeedStar').data('star');
                        data.serveStar = +$('#serveStar').data('star');
                        data.star = +$('#goodsStar').data('star');
                        //return console.log(data);
                        M.ajax({
                            url:'/api/order/reviewSubmit',
                            data:{data:JSON.stringify(data)},
                            success:function(res){
                                // 跳转到评价成功结果页
                                if(res.success){
                                    location.href = '/center#/order/result/' + data.templateId + '/' + data.orderNo + '/' + res.mbeanGet;
                                }else{
                                    alert(res.msg);
                                }
                            }
                        })
                    });

                    $this.on('click','.js-star li',function(){
                        var star = $(this).text();
                        $(this).closest('ol').prev().attr('class','star star-' + star).data('star',star);
                    })
                }
            };
            // 评价/确认收货成功结果页
            var order_result = {
                url:'/order/result/:templateId/:orderNo/:mbeans?',
                render:function(callback){
                    var params = this.params;
                    //params.mbeans = M.url.query('mbeans');
                    console.log('params=======',params);
                    page.renderModule('orderResult',callback, params);
                },
                bind: function () {
                    M.lazyLoad.init({
                        container: $('.spa')
                    });
                }
            };

            /*地址列表*/
            var address = {
                url: '/address',
                className: 'm-address',
                render: function (callback) {
                    page.renderModule('address', callback);
                },
                bind: function () {
                    var $spa = $("#app"), $module = $(this);
                    $spa.data('data', null);
                }
            };

            /*新增地址*/
            var address_add = {
                url: '/address/add',
                className: 'm-address-edit',
                render: function () {
                    return $('#tpl_address_add').html();
                },
                bind: function () {
                    var $module = $(this);
                    page.updateAddressData($module);
                    page.queryAddressArea({type: 1}); //获取省份
                    page.bindAddressEvents($module); //绑定相关事件
                }
            };

            /*编辑地址*/
            var address_edit = {
                url: '/address/edit/:id',
                className: 'm-address-edit',
                render: function (callback) {
                    this.params.id = +this.params.id;
                    var params = this.params;
                    page.renderModule('addressEdit', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    page.updateAddressData($module);
                    page.queryAddressArea({type: 1}); //获取省份
                    page.bindAddressEvents($module); //绑定相关事件
                }
            };

            /*关键字搜索地址*/
            var address_search = {
                url: '/address/search/:areaId',
                className: 'm-address-search',
                render: function () {
                    this.params.areaId = +this.params.areaId;
                    address_search.params = this.params;
                    return $('#tpl_address_search').html();
                },
                bind: function () {
                    var params = address_search.params;
                    require.async('app/address_search', function (func) {
                        new func(params).render();
                    });
                }
            };

            /*GPS地址定位列表*/
            var address_gps = {
                url: '/address/gps',
                className: 'm-address-search',
                render: function (callback) {
                    require.async('app/address_gps', function (func) {
                        new func(page, callback).render();
                    });
                },
                bind: function () {
                    var $module = $(this);
                    $module.on('click', '.list li', function () {
                        var $this = $(this), $spa = $("#app");
                        var data = $spa.data('data') || {};
                        data.gpsAddr = $this.find('dt').text();
                        $spa.data('data', data);
                        window.history.go(-1);
                    });
                }
            };

            // 妈豆列表；
            var beans = {
                url: '/beans',
                className: 'm-beans',
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
                url: '/integral/:type?',
                className: 'm-integral',
                render: function (callback) {
                    this.params.type = +this.params.type;
                    integral.params = this.params;
                    page.renderModule('integral', callback);
                },
                bind: function () {

                    //加载swipe
                    require.async('swipe', function () {
                        M.swipe.init();//初始化Swipe
                    });
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
                className: 'm-coupon',
                render: function (callback) {
                    page.renderModule('coupons', callback);
                },
                bind: function () {
                    //加载swipe
                    require.async('swipe', function () {
                        M.swipe.init();//初始化Swipe
                    });
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
                .push(order_express)
                .push(order_review)
                .push(order_review_detail)
                .push(order_result)
                .setDefault('/').init();
        },
        /*拼接地址表单数据*/
        getAddressData: function (form) {
            var $spa = $("#app");
            var data = {
                consignee: form.find('.name').val(),
                phone: form.find('.mobile').val(),
                district: form.find('.district').val(),
                areaId: form.find('.district').data('area-id') || null,
                gpsAddr: form.find('.street').val(),
                lat: form.find('.street').data('lat') || null,
                lng: form.find('.street').data('lng') || null,
                addrDetail: form.find('.house-number').val(),
                isDefault: form.find('.isDefault').is(':checked') ? 1 : 0
            };

            var AddrId = form.data('id');
            AddrId && (data.deliveryAddrId = AddrId);    //区域地址

            $spa.data('data', data);  //存储数据
            return data;
        },
        /*查询省市区*/
        queryAddressArea: function (params) {
            var $target,
                dom = [];
            var PCD = {
                pro: $('#list-pro'),
                city: $('#list-city'),
                area: $('#list-area')
            };
            switch (params.type) {
                case 1:
                    dom.push('<option value="-1">请选择省份</option>');
                    $target = PCD.pro;
                    PCD.city.empty().append('<option value="-1">请选择城市</option>');
                    PCD.area.empty().append('<option value="-1">请选择区域</option>');
                    break;
                case 2:
                    dom.push('<option value="-1">请选择城市</option>');
                    $target = PCD.city;
                    PCD.area.empty().append('<option value="-1">请选择区域</option>');
                    break;
                case 3:
                    dom.push('<option value="-1">请选择区域</option>');
                    $target = PCD.area;
                    break;
            }

            if (/-1/.test(params.id)) {
                $target.empty().append(dom);
            } else {
                M.ajax({
                    showLoading: false,
                    url: page.config.api['queryArea'],
                    data: {data: JSON.stringify(params || {})},
                    success: function (res) {
                        //console.log('success--->', res);
                        var list = res.data;
                        $.each(list, function (i, v) {
                            dom.push('<option value="' + v.id + '">' + v.name + '</option>');
                        });
                        $target.empty().append(dom);
                    }
                });
            }
        },
        /*绑定修改、新建地址等事件*/
        bindAddressEvents: function (module) {
            var $module = module;
            /*选择省市区*/
            $module.on('click', '.js-district', function () {
                $('.u-area').addClass('show');
            });

            $module.on('click', '.u-area .mask', function () {
                $('.u-area').removeClass('show');
            });

            $module.on('change', '.fm-addr-pcd select', function () {
                var params = {
                    id: $(this).val()
                };
                switch (this.id) {
                    case 'list-pro':
                        params.type = 2;
                        page.queryAddressArea(params);
                        break;
                    case 'list-city':
                        params.type = 3;
                        page.queryAddressArea(params);
                        break;
                    case 'list-area':
                        break;
                }
            });

            //选完省市区后点击确定按钮
            $module.on('click', '.js-confirm', function () {
                var PCD = {
                    pro: $('#list-pro'),
                    city: $('#list-city'),
                    area: $('#list-area')
                };
                var areaId = PCD.area.val();
                if (/-1/.test(areaId)) {
                    return M.tips('请选择区域');
                }
                var district = (function () {
                    var arr = [];
                    for (var i in PCD) {
                        arr.push(PCD[i].find('option:selected').text());
                    }
                    return arr.join('');
                })();

                $('.js-district').val(district).data('area-id', areaId);
                $module.find('.u-area .mask').trigger('click');
            });


            /*输入关键字搜索*/
            $module.on('click', '.js-street', function () {
                if (!$('.js-district').data('area-id')) {
                    return M.tips('请先选择省市区');
                }
                var data = page.getAddressData($('.fm-addr-info'));
                location.href = '/center#/address/search/' + data.areaId;
            });

            /*定位*/
            $module.on('click', '.js-gps', function () {
                page.getAddressData($('.fm-addr-info'));
                location.href = '/center#/address/gps';
            });

            /*保存地址*/
            $module.on('click', '.js-submit', function () {
                var data = page.getAddressData($('.fm-addr-info'));

                //校验
                var TIPS_MAP = {
                    "consignee": "请输入收货人的姓名",
                    "phone": "请输入收货人的手机号码",
                    "phone_valid": "请输入正确的手机号码",
                    "areaId": "请选择省份、城市、区域",
                    "gpsAddr": "请选择街道地址",
                    "addrDetail": "请填写门牌号等详细地址"
                };
                var check_res = true;
                $.each(data, function (key, val) {
                    if (/(consignee|phone|gpsAddr|addrDetail)/.test(key)) {
                        data[key] = $.trim(val);
                        if (!data[key]) {
                            M.tips(TIPS_MAP[key]);
                            return check_res = false;
                        }
                        //手机号码校验
                        if (/(phone)/.test(key) && !/^1[3,4,5,7,8]\d{9}$/.test(data[key])) {
                            M.tips(TIPS_MAP.phone_valid);
                            return check_res = false;
                        }
                    }

                    //省市区未选择
                    if (/(areaId)/.test(key) && !data[key]) {
                        M.tips(TIPS_MAP[key]);
                        return check_res = false;
                    }

                    //未获取到经纬度
                    if (/(lat|lng)/.test(key) && !data[key]) {
                        M.tips(TIPS_MAP.gpsAddr);
                        return check_res = false;
                    }
                });

                if (!check_res) return false;

                M.ajax({
                    url: page.config.api['addressSave'],
                    data: {data: JSON.stringify(data)},
                    success: function (res) {
                        if (res.success) {
                            M.tips({
                                body: '保存成功！',
                                callback: function () {
                                    history.go(-1);  //返回
                                }
                            });
                        }
                    }
                });
            });
        },
        /*更新地址表单数据*/
        updateAddressData: function (module) {
            //读取已有数据
            var $spa = $("#app"), $module = module;
            var data = $spa.data('data');
            if (data) {
                $module.find('.street').val(data.gpsAddr).data({lat: data.lat, lng: data.lng});
                $module.find('.name').val(data.consignee);
                $module.find('.mobile').val(data.phone);
                $module.find('.district').val(data.district).data('area-id', data.areaId);
                $module.find('.house-number').val(data.addrDetail);
                $module.find('.isDefault').prop('checked', data.isDefault ? true : false);
            }

        },
        /*渲染模块*/
        renderModule: function (module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        }
    };

    page.init();
});