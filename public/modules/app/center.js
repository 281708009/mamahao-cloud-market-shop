/*
 * 首页
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            // ajax向node请求的url;
            api: {
                home: "/api/center",
                profile: "/api/profile",
                profileEdit: "/api/profile_edit",

                orders: "/api/orders",
                orderDetail: "/api/order_detail",
                orderResult: "/api/order_result",
                address: "/api/address",    //收货地址列表
                addressEdit: "/api/address_edit",   //编辑地址
                addressGPS: "/api/address_gps", //gps定位附近地址
                addressSearch: "/api/address_search",   //搜索地址
                addressSave: "/api/address/save",   //保存收货地址
                addressDelete: "/api/address/delete",   //删除收货地址
                queryArea: "/api/address/queryArea",   //查询省市区
                beans: "/api/beans",    //麻豆列表
                coupons: "/api/coupons",    //优惠券列表
                couponsExchange: "/api/coupons_exchange",  //兑换优惠券
                integral: "/api/integral",  //积分列表
                orderExpress: "/api/order_express",  //订单物流信息
                orderReview: "/api/order_review",
                orderReviewSubmit: "/api/order/reviewSubmit",
                orderReviewDetail: "/api/order_review_detail",
                orderRebuy: "/api/order_rebuy",
                orderReviewResult: "/result/review",
                orderCart: "/api/order_cart",
                orderSettlement: "/api/order_cart"
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
            var c = page.config;
            /*路由测试*/
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });

            var home = {
                url: '/index/:params?',
                render: function (callback) {
                    //hash值后的url参数
                    home.hashParams = M.url.getParams(this.params.params);  //json params
                    page.renderModule('home', callback, home.hashParams);
                },
                bind: function () {

                }
            };

            //个人信息
            var profile = {
                url: '/profile',
                render: function (callback) {
                    page.renderModule('profile', callback);
                },
                bind: function () {
                    require.async('app/profile', function (fun) {
                        fun.init();
                    });
                }
            };
            var profileEdit = {
                url: '/profileEdit/:params?',
                render: function (callback) {
                    //hash值后的url参数
                    address.hashParams = M.url.getParams(this.params.params);  //json params
                    page.renderModule('profileEdit', callback, address.hashParams);
                },
                bind: function () {
                    require.async('app/profile', function (fun) {
                        fun.init();
                    });
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
            /* 再次购买 */
            var order_rebuy = {
                url: '/order/rebuy/:orderNo/:queryType?',
                render: function (callback) {
                    this.params.queryType && (this.params.queryType = +this.params.queryType);
                    var params = this.params;
                    page.renderModule('orderRebuy', callback, params);
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
                className: 'm-courier',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderExpress', callback, params);
                },
                bind: function () {
                    var $this = $(this);
                    //加载swipe
                    !$this.children().is('.no-invoice-logistics') && M.swipe.init();//初始化Swipe
                    $this.on('click', '.more-show', function () {
                        var $list = $(this).prev();
                        $list.toggleClass('in');
                        $(this).find('em').html($list.is('.in') ? '隐藏商品' : ('显示其余' + $(this).data('num') + '件'));
                    });
                }
            };
            /* 订单评价 每月购项目中修改为订单内商品必须全部评价完成*/
            var order_review = {
                url: '/order/review/:orderNo',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderReview', callback, params);
                },
                bind: function () {
                    var $this = $(this);
                    $this.on('click', '.js-review-submit', function () {
                        var data = $(this).data('params');
                        data.serveStar = +$('#serveStar').data('star');
                        data.deliverySpeedStar = +$('#deliverySpeedStar').data('star');
                        if(data.serveStar == 0) return alert('服务态度评价不能为空');
                        if(data.deliverySpeedStar == 0) return alert('配送速度评价不能为空');
                        var jsonArrays = [];
                        $this.find('.js-item').each(function (i, o) {
                            var $item = $(this), pics = [];
                            var json = $item.data();
                            json.star = +$item.find('.star').data('star');
                            json.content = $item.find('.js-review-ctn').val();
                            if (json.content === '') {
                                alert('商品评价内容为空');
                                return false;
                            }
                            if (json.content.length > 140) {
                                alert('字数超出最大限制');
                                return false;
                            }
                            $item.find('.file li .item').each(function () {
                                pics.push($(this).find('img').data('filename'));
                            });
                            pics.length && (json.pics = pics.toString());
                            jsonArrays.push(json);
                        });
                        if (jsonArrays.length === 0) {
                            return;
                        } else {
                            data.jsonArrays = JSON.stringify(jsonArrays);
                        }
                        M.ajax({
                            url: page.config.api['orderReviewSubmit'],
                            data: {data: JSON.stringify(data)},
                            success: function (res) {
                                // 跳转到评价成功结果页
                                //page.renderModule()
                                if (res.success) {
                                    location.href = '/center#/order/result/orderNo=' + data.orderNo + '&mbeanGet=' + res.mbeanGet;
                                }
                            }
                        });
                    });

                    $this.on('click', '.js-star li', function () {
                        var star = $(this).text();
                        $(this).closest('ol').prev().attr('class', 'star star-' + star).data('star', star);
                    });

                    // 上传图片
                    $('.js-oss-file').on('change', function (e) {
                        var file = e.target.files[0];
                        console.log(file);
                        $file = $(this);
                        var formData = new FormData();
                        formData.append('file', file);

                        M.ajax({
                            type: 'post',
                            url: '/oss/uploadImage',
                            cache: false,
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (res) {
                                //console.log('res---->', JSON.stringify(res));
                                if (res.success) {
                                    $file.closest('li').before('<li><div class="item"><img src="' + res.url + '" alt="" data-filename="' + res.name + '"><del></del></div></li>');
                                    $file.val('');
                                    if ($('.file li .item').length >= 5) {
                                        $file.closest('li').hide();
                                    }
                                }
                            }
                        });
                    });

                    $this.on('click', 'del', function () {
                        $(this).closest('li').remove();
                        if ($('.file li.item').length < 5) {
                            $file.closest('li').show();
                        }
                    });
                }
            };
            /* 订单评价详情 */
            var order_review_detail = {
                url: '/order/reviewDetail/:orderNo/:itemId?/:mbeans?',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('orderReviewDetail', callback, params);
                },
                bind: function () {
                    var $this = $(this);
                    $this.on('click', '.js-review-submit', function () {
                        var data = $(this).data('params');
                        data.content = $('#reviewCtn').val();
                        $('#deliverySpeedStar').length && (data.deliverySpeedStar = +$('#deliverySpeedStar').data('star'));
                        $('#serveStar').length && (data.serveStar = +$('#serveStar').data('star'));
                        $('#goodsStar').length && (data.star = +$('#goodsStar').data('star'));

                        if (data.content === '') return alert('商品评价内容为空');
                        if (data.content.length > 140) return alert('字数超出最大限制');
                        var pics = [];
                        $('.file li .item').each(function () {
                            pics.push($(this).find('img').data('filename'));
                        });
                        if (pics.length) {
                            data.pics = pics.toString();
                        }
                        M.ajax({
                            url: page.config.api['orderReviewSubmit'],
                            data: {data: JSON.stringify(data)},
                            success: function (res) {
                                // 跳转到评价成功结果页
                                if (res.success) {
                                    location.href = '/center#/order/result/orderNo=' + data.orderNo + '&mbeanGet' + res.mbeanGet;
                                }
                            }
                        });
                    });

                    $this.on('click', '.js-star li', function () {
                        var star = $(this).text();
                        $(this).closest('ol').prev().attr('class', 'star star-' + star).data('star', star);
                    });

                    // 上传图片
                    /*$this.on('click','.js-oss-file',function(){
                     $this.find('[type="file"]').trigger('click');
                     });*/

                    $('.js-oss-file').on('change', function (e) {
                        var file = e.target.files[0];
                        console.log(file);
                        $file = $(this);
                        var formData = new FormData();
                        formData.append('file', file);

                        M.ajax({
                            type: 'post',
                            url: '/oss/uploadImage',
                            cache: false,
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (res) {
                                console.log('res---->', JSON.stringify(res));
                                if (res.success) {
                                    $file.closest('li').before('<li><div class="item"><img src="' + res.url + '" alt="" data-filename="' + res.name + '"><del></del></div></li>');
                                    $file.val('');
                                    if ($('.file li .item').length >= 5) {
                                        $file.closest('li').hide();
                                    }
                                }
                            }
                        });
                    });

                    $this.on('click', 'del', function () {
                        $(this).closest('li').remove();
                        if ($('.file li.item').length < 5) {
                            $file.closest('li').show();
                        }
                    });
                }
            };
            // 评价/确认收货成功结果页
            var order_result = {
                url: '/order/result/:params',
                render: function (callback) {
                    var params = this.params;
                    params = M.url.getParams(params.params);
                    page.renderModule('orderResult', callback, params);
                },
                bind: function () {
                    M.lazyLoad.init();
                    var $this = $(this);
                    $this.on('click', '.js-review-submit', function () {
                        var data = {orderNo:$('[name="orderNo"]').val()};
                        data.serveStar = +$('#serveStar').data('star');
                        data.deliverySpeedStar = +$('#deliverySpeedStar').data('star');
                        if(data.serveStar == 0) return alert('服务态度评价不能为空');
                        if(data.deliverySpeedStar == 0) return alert('配送速度评价不能为空');
                        var jsonArrays = [];
                        $this.find('.js-item').each(function (i, o) {
                            var $item = $(this), pics = [];
                            var json = $item.data();
                            json.star = +$item.find('.star').data('star');
                            json.content = $item.find('.js-review-ctn').val();
                            if (json.content === '') {
                                alert('商品评价内容为空');
                                return false;
                            }
                            if (json.content.length > 140) {
                                alert('字数超出最大限制');
                                return false;
                            }
                            $item.find('.file li .item').each(function () {
                                pics.push($(this).find('img').data('filename'));
                            });
                            pics.length && (json.pics = pics.toString());
                            jsonArrays.push(json);
                        });
                        if (jsonArrays.length === 0) {
                            return;
                        } else {
                            data.jsonArrays = JSON.stringify(jsonArrays);
                        }
                        M.ajax({
                            url: page.config.api['orderReviewSubmit'],
                            data: {data: JSON.stringify(data)},
                            success: function (res) {
                                // 跳转到评价成功结果页
                                //page.renderModule()
                                if (res.success) {
                                    location.href = '/center#/order/result/orderNo=' + data.orderNo + '&mbeanGet=' + res.mbeanGet;
                                }
                            }
                        });
                    });

                    $this.on('click', '.js-star li', function () {
                        var star = $(this).text();
                        $(this).closest('ol').prev().attr('class', 'star star-' + star).data('star', star);
                    });

                    // 上传图片
                    /*$this.on('click','.js-oss-file',function(){
                     $this.find('[type="file"]').trigger('click');
                     });*/

                    $('.js-oss-file').on('change', function (e) {
                        var file = e.target.files[0];
                        console.log(file);
                        $file = $(this);
                        var formData = new FormData();
                        formData.append('file', file);

                        M.ajax({
                            type: 'post',
                            url: '/oss/uploadImage',
                            cache: false,
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: function (res) {
                                console.log('res---->', JSON.stringify(res));
                                if (res.success) {
                                    $file.closest('li').before('<li><div class="item"><img src="' + res.url + '" alt="" data-filename="' + res.name + '"><del></del></div></li>');
                                    $file.val('');
                                    if ($('.file li .item').length >= 5) {
                                        $file.closest('li').hide();
                                    }
                                }
                            }
                        });
                    });

                    $this.on('click', 'del', function () {
                        $(this).closest('li').remove();
                        if ($('.file li.item').length < 5) {
                            $file.closest('li').show();
                        }
                    });
                }
            };

            /*地址列表*/
            var address = {
                url: '/address/:params?',
                className: 'm-address',
                render: function (callback) {
                    //hash值后的url参数
                    address.hashParams = M.url.getParams(this.params.params);  //json params
                    page.renderModule('address', callback, address.hashParams);
                },
                bind: function () {
                    var $spa = $("#app"), $module = $(this);
                    $spa.data('data', null);

                    //来源为订单，有f参数
                    if (address.hashParams.f) {
                        $module.on('click', '.detail', function () {
                            var info = $(this).data('info');
                            var localAddr = {
                                "deliveryAddrId": info.deliveryAddrId,
                                "addr": [info.prv, info.city, info.area, info.gpsAddr, info.addrDetail].join(''),
                                "consignee": info.consignee,
                                "phone": info.phone,
                                "areaId": info.areaId,
                                "isDefult": info.isDefault
                            };
                            localStorage.setItem(CONST.local_settlement_addr, JSON.stringify(localAddr));
                            //location.href = '/cart#/settlement';
                            window.history.go(-1);
                        });
                    }

                }
            };

            /*新增地址*/
            var address_add = {
                url: '/addressAdd/:params?',
                className: 'm-address-edit',
                render: function () {
                    //hash值后的url参数
                    address_add.hashParams = M.url.getParams(this.params.params);  //json params
                    return $('#tpl_address_add').html();
                },
                bind: function () {
                    var $module = $(this);
                    $module.data('hash-params', address_add.hashParams);
                    page.updateAddressData($module);
                    page.bindAddressEvents($module); //绑定相关事件
                }
            };

            /*编辑地址*/
            var address_edit = {
                url: '/addressEdit/:id/:params?',
                className: 'm-address-edit',
                render: function (callback) {
                    //hash值后的url参数
                    address_edit.hashParams = M.url.getParams(this.params.params);  //json params
                    var params = $.extend({}, {id: +this.params.id}, address_edit.hashParams);
                    page.renderModule('addressEdit', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    $module.data('hash-params', address_edit.hashParams);
                    page.updateAddressData($module);
                    page.bindAddressEvents($module); //绑定相关事件
                }
            };

            /*关键字搜索地址*/
            var address_search = {
                url: '/addressSearch/:areaId/:province?',
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
                url: '/addressGps',
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
                        //console.log($this.data('info'))

                        var thisInfo = $this.data('info');
                        AMap.service('AMap.Geocoder', function () {//回调函数
                            //实例化Geocoder,使用geocoder 对象完成相关功能
                            var geocoder = new AMap.Geocoder();

                            //逆向地理编码（坐标-地址）
                            var coordinate = [thisInfo.location.lng, thisInfo.location.lat];//坐标
                            geocoder.getAddress(coordinate, function (status, result) {
                                //console.log(JSON.stringify(result));
                                if (status === 'complete' && result.info === 'OK') {
                                    //获得了有效的地址信息:
                                    //即，result.regeocode.formattedAddress
                                    var regeocode = result.regeocode, detail = regeocode.addressComponent;
                                    console.log(detail);
                                    detail.province = detail.province.replace(/省$/, ''); //忽略最后一个'省'字

                                    var data = $spa.data('data') || {};
                                    data.gpsAddr = $this.find('dt span').text();
                                    data.district = [detail.province, detail.city, detail.district].join('');
                                    data.areaId = detail.adcode;
                                    data.prv = detail.province;
                                    data.city = detail.city;
                                    data.area = detail.district;

                                    data.lat = thisInfo.location.lat;
                                    data.lng = thisInfo.location.lng;

                                    $spa.data('data', data);
                                    window.history.go(-1);
                                }
                            });
                        });

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
                    var $container = $('.m-record .list');
                    if (!$container.children()[0]) $container.data('locked', true);
                    $.pagination({
                        container: '.m-record .list',
                        api: page.config.api['beans'],
                        fnSuccess: function (res, ele) {
                            var data = res.data;
                            if (!data.template) {
                                return ele.data('locked', true);
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
                    M.swipe.init();//初始化Swipe

                    var $container = $('.ui-swipe-item .list');
                    $.each($container, function () {
                        if (!$(this).children()[0]) $(this).data('locked', true);
                    });
                    $.pagination({  //分页
                        keys: {page: "pageNo"},   //设置分页参数关键字
                        container: '.ui-swipe-item .list',
                        api: page.config.api['integral'],
                        fnSuccess: function (res, ele) {
                            var data = res.data;
                            if (!data.template) {
                                return ele.data('locked', true);
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
                    M.swipe.init();//初始化Swipe

                    var $container = $('.ui-swipe-item .list');
                    $.each($container, function () {
                        if (!$(this).children()[0]) $(this).data('locked', true);
                    });
                    $.pagination({  //分页
                        container: '.ui-swipe-item .list',
                        api: page.config.api['coupons'],
                        fnSuccess: function (res, ele) {
                            var data = res.data;
                            if (!data.template) {
                                return ele.data('locked', true);
                            }
                            ele.append(data.template);
                        }
                    });

                    var $module = $(this);
                    $module.on('click', '.js-exchange', function () {
                        var $this = $(this), code = $this.siblings('.coupon-code').val();
                        var params = {
                            cdKey: code
                        };
                        M.ajax({
                            url: page.config.api['couponsExchange'],
                            data: {data: JSON.stringify(params)},
                            success: function (res) {
                                // 兑换成功刷新当前页面
                                if (res.success) {
                                    M.tips({
                                        body: '优惠券兑换成功！',
                                        callback: function () {
                                            M.reload();
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
            };
            /**
             * 验货付款订单确认收货选择商品页
             * @type {{url: string, render: Function, bind: Function}}
             */
            var order_cart = {
                url: '/order/cart/:orderNo',
                render: function (callback) {
                    this.params.queryType && (this.params.queryType = +this.params.queryType);
                    var params = this.params;
                    page.renderModule('orderCart', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    if($module.find('#errorAlert').length){
                        M.dialog({
                            body: $('#errorAlert').data('tips'),
                            buttons: [
                                {
                                    "text": "我知道了", "class": "alone", "onClick": function () {
                                        this.hide();
                                        if (history.length) {
                                            history.go(-1);
                                        } else {
                                            location.href = '/center#/orders';
                                        }
                                    }
                                }]
                            });
                        return;
                    }
                    var cartId = $('[name="cartId"]').val();
                    var orderNo = $('[name="orderNo"]').val();

                    $module.on('click', '.js-select-all', function(e) {
                        if ($(this).closest('.edit').length) return;
                        var selected = $(this).find('.u-checkbox:visible').is(':checked') ? 2 : 3,
                            params = {
                                cartId: cartId,
                                orderNo: orderNo,
                                isSelected: selected
                            };
                        M.ajax({
                            location: true,
                            url: '/api/order_cart/opt/selectedCartWithInspect',
                            data: {data: JSON.stringify(params)},
                            success: function (res) {
                                $module.html(res.template);
                            }
                        });
                    });
                    // 选择/取消选择商品
                    $module.on('click', '.js-checkbox', function () {
                        var $item = $(this).closest('.js-item'),
                            selected = $(this).find('.u-checkbox:visible').is(':checked') ? 0 : 1,
                            params = {
                                cartId: cartId,
                                orderNo: orderNo,
                                isSelected: selected,
                                compoentId: typeof($(this).closest('li').data('compoentId')) !== "undefined" ? $(this).closest('li').data('compoentId') : $item.data('compoentId')

                            };
                        M.ajax({
                            location: true,
                            url: '/api/order_cart/opt/selectedCartWithInspect',
                            data: {data: JSON.stringify(params)},
                            success: function (res) {
                                $module.html(res.template);
                            }
                        });
                    });

                    // 修改商品数量
                    $module.on('click', '.js-update', function () {
                        var $self = $(this),
                            $item = $self.closest('.js-item'),
                            count = +$self.data('count'),
                            maxCount = +$self.data('max');
                        if (count <= 0 || $(this).is('.disabled') || count >= maxCount) {
                            if ($(this).data('tips')) return alert($(this).data('tips'));
                            return;
                        }

                        var params = {
                            cartId: cartId,
                            orderNo: orderNo,
                            newCount: count,
                            compoentId: typeof($(this).closest('li').data('compoentId')) !== "undefined" ? $(this).closest('li').data('compoentId') : $item.data('compoentId')
                        };

                        //return console.log('修改商品数量请求参数--------->',params);
                        M.ajax({
                            location: true,
                            url: '/api/order_cart/opt/updateCartItemCountWithInspect',
                            data: {data: JSON.stringify(params)},
                            success: function (res) {
                                $module.html(res.template);
                            }
                        });
                    });

                    // 取消验货付款订单
                    $module.on('click', '.js-cancel', function () {
                        if ($('.js-pop-causes').children().length) {
                            $('.js-pop-causes').children().addClass('show');
                            return;
                        }
                        M.ajax({
                            url: '/api/order_query_causes',
                            data: {data: JSON.stringify({'type': 1})}, // type 1:取消订单, 2:取消发货
                            success: function (res) {
                                $('.js-pop-causes').html(res.template);
                                $('.js-close,.mask').on('click', function () {
                                    $('.show').removeClass('show');
                                });
                                // 取消订单
                                $('.js-submit-causes').off().on('click', function () {
                                    M.ajax({
                                        url: '/api/order/orderByInspectCancel',
                                        data: {data: JSON.stringify({orderNo: orderNo})},
                                        success: function (res) {
                                            if (res.success_code == 200) {
                                                if (history.length) window.history.go(-1);
                                            }
                                        }
                                    });
                                })
                            }
                        });
                    });

                }
            };

            var order_settlement = {
                url: '/order/settlement.htm',
                render: function (callback) {
                    page.renderModule('orderSettlement', callback);
                },
                bind: function () {

                }
            };


            router.push(home)
                .push(profile)
                .push(profileEdit)
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
                .push(order_rebuy)
                .push(order_cart)
                .push(order_settlement)
                .setDefault('/index').init();
        },
        /*拼接地址表单数据*/
        getAddressData: function (form) {
            var $spa = $("#app");
            var data = {
                consignee: form.find('.name').val(),
                phone: form.find('.mobile').val(),
                district: form.find('.district').val(),
                areaId: form.find('.district').data('area-id') || null,
                prv: $('#list-pro').find('option:selected').text(),
                city: $('#list-city').find('option:selected').text(),
                area: $('#list-area').find('option:selected').text(),
                gpsAddr: form.find('.street').val(),
                lat: form.find('.street').data('lat') || null,
                lng: form.find('.street').data('lng') || null,
                addrDetail: form.find('.house-number').val(),
                isDefault: form.find('.isDefault').is(':checked') ? 1 : 0
            };

            console.log(JSON.stringify(data));

            var AddrId = form.data('id');
            AddrId && (data.deliveryAddrId = AddrId);    //区域地址

            $spa.data('data', data);  //存储数据
            return data;
        },
        /*绑定修改、新建地址等事件*/
        bindAddressEvents: function (container) {
            var $module = container;
            /*选择省市区*/
            require.async('app/choose_pcd', function (fun) {
                var $district = $('.js-district');
                new fun({
                    container: $(".spa"),
                    trigger: $district,
                    confirmed: function (data) {
                        var district = [data.proName, data.cityName, data.areaName].join('');
                        if ($district.val() !== district) {
                            $district.val(district);
                            $('.house-number,.street').val('');
                        }
                        page.getAddressData($('.fm-addr-info')); //存储数据
                        page.updateAddressData($module);

                    }
                }).init();
            });

            /*输入关键字搜索*/
            $module.on('click', '.js-street', function () {
                var $district = $('.js-district');
                if (!$district.data('area-id')) {
                    return M.tips('请先选择省市区');
                }
                var data = page.getAddressData($('.fm-addr-info'));
                var redirectURL = '/center#/addressSearch/' + data.areaId + '/' + ($district.data('pro-name') || '');
                location.href = redirectURL;
            });

            /*定位*/
            $module.on('click', '.js-gps', function () {
                page.getAddressData($('.fm-addr-info'));
                location.href = '/center#/addressGps';
            });
            /*删除地址*/
            $module.on('click', '.js-delete', function () {
                var params = {
                    deliveryAddrId: $(this).data('id')
                };
                confirm('您确定删除该地址吗', function (fun) {
                    M.ajax({
                        url: page.config.api['addressDelete'],
                        data: {data: JSON.stringify(params)},
                        success: function (res) {
                            if (res.success) {
                                fun.hide();
                                // 校验本地是否存储了收货地址
                                var localAddress = localStorage.getItem(CONST.local_settlement_addr);
                                if (localAddress) {
                                    localAddress = JSON.parse(localAddress);
                                    if (params.deliveryAddrId == localAddress.deliveryAddrId) {
                                        localStorage.removeItem(CONST.local_settlement_addr);
                                    }
                                }
                                M.tips({
                                    body: '收货地址删除成功！',
                                    callback: function () {
                                        history.go(-1);
                                    }
                                });
                            }
                        }
                    });
                });

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

                        if (data[key].match(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g)) {
                            M.tips('不能输入特殊字符或表情');
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
                                    var hashParams = $module.data('hash-params');  //json params
                                    if (hashParams.f) {
                                        var localAddr = {
                                            "deliveryAddrId": res.deliveryAddrId || data.deliveryAddrId,
                                            "addr": [data.district, data.gpsAddr, data.addrDetail].join(''),
                                            "consignee": data.consignee,
                                            "phone": data.phone,
                                            "areaId": data.areaId,
                                            "isDefult": data.isDefault
                                        };
                                        localStorage.setItem(CONST.local_settlement_addr, JSON.stringify(localAddr));
                                        window.history.go(-2);  //返回
                                        //location.href = '/cart#/settlement';
                                    } else {
                                        window.history.go(-1);  //返回
                                    }
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
                typeof data.gpsAddr !== 'undefined' && $module.find('.street').val(data.gpsAddr).data({
                    lat: data.lat,
                    lng: data.lng
                });
                typeof data.consignee !== 'undefined' && $module.find('.name').val(data.consignee);
                typeof data.phone !== 'undefined' && $module.find('.mobile').val(data.phone);
                typeof data.district !== 'undefined' && $module.find('.district').val(data.district).data({
                    'area-id': data.areaId,
                    'pro-name': data.prv,
                    'city-name': data.city,
                    'area-name': data.area
                });
                typeof data.addrDetail !== 'undefined' && $module.find('.house-number').val(data.addrDetail);
                typeof data.isDefault !== 'undefined' && $module.find('.isDefault').prop('checked', data.isDefault ? true : false);
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