define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/cart/',
                settlement: '/api/settlement',
                delivery: '/api/delivery'
            }
        },
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件

            page.bindEvents();
        },
        bindEvents: function () {
        },
        setRouter: function () {
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });

            /* 购物车 */
            var home = {
                url: '/',
                render: function (callback) {
                    home.params = {
                        cartId: localStorage.getItem(CONST.local_cartId)
                    };
                    callback.loadingDelay = 10; //出现loading的时机
                    page.renderModule('index', callback, home.params);
                },
                bind: function () {
                    var $this = $(this), $spa = $('.spa');
                    // 选择/取消选择所有商品
                    $this.on('click', '#selectAll', function (e) {
                        e.stopPropagation();
                        var selected = $(this).is(':checked') ? 2 : 3,
                            data = JSON.stringify($.extend(true, home.params, {isSelected: selected}));
                        M.ajax({
                            url: '/api/cart/selectedCart',
                            data: {data: data},//areaId=330102&isSelected=2
                            success: function (res) {
                                $spa.html(res.template);
                            }
                        })
                    });
                    // 选择/取消选择该商品
                    $this.on('click', '[type="checkbox"]', function (e) {
                        e.stopPropagation();
                        var $item = $(this).closest('.item'),
                            selected = $(this).is(':checked') ? 0 : 1,
                            data = JSON.stringify($.extend(true, home.params, {
                                isSelected: selected,
                                compoentId: $item.data('compoentId')
                            }));
                        M.ajax({
                            url: '/api/cart/selectedCart',
                            data: {data: data},
                            success: function (res) {
                                $spa.html(res.template);
                            }
                        })
                    });
                    // 删除该商品
                    $this.on('click', '.js-del', function (e) {
                        e.stopPropagation();
                        var $item = $(this).closest('.item'),
                            data = JSON.stringify($.extend(true, home.params, {
                                compoentType: $item.data('compoentType'),
                                compoentId: $item.data('compoentId')
                            }));
                        confirm('确认删除这个商品吗?', function () {
                            this.hide();
                            M.ajax({
                                url: '/api/cart/removeCartItem',
                                data: {data: data},
                                success: function (res) {
                                    $spa.html(res.template);
                                }
                            });
                        });
                    });
                    // 修改商品数量
                    $this.on('click', '.js-update', function (e) {
                        e.stopPropagation();
                        var $item = $(this).closest('.item'),
                            count = +$(this).data('count');
                        if (count <= 0 || $(this).is('.disabled')) return;
                        var data = JSON.stringify($.extend(true, home.params, {
                            newCount: count,
                            compoentId: $item.data('compoentId')
                        }));
                        M.ajax({
                            url: '/api/cart/updateCartItemCount',
                            data: {data: data},
                            success: function (res) {
                                $spa.html(res.template);
                            }
                        });
                    });

                    // 跳转商品详情页
                    $this.on('click', '.js-jump', function () {
                        location.href = $(this).attr('url');
                    });
                }
            };

            /* 结算页 */
            var settlement = {
                url: '/settlement/:deliveryAddrId?/:areaId?',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('settlement', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    require.async('app/settlement', function (func) {
                        new func(page, $module).render();
                    });

                }
            };

            /* 配送方式选择页 */
            var delivery = {
                url: '/delivery/:deliveryAddrId?',
                render: function (callback) {
                    var params = this.params;
                    page.renderModule('delivery', callback, params);
                },
                bind: function () {
                    var $this = $(this), $spa = $('.spa');
                    // 获取本地存储的配送方式 当前选中,其他置灰
                    var settlementData = JSON.parse(localStorage.getItem('mmh_settlementData')),
                        deliveryWays = settlementData.deliveryWays;

                    $this.find('.js-item').each(function (i, ele) {
                        var $e = $(ele);
                        for (j = 0; j < deliveryWays.length; j++) {
                            if (deliveryWays[j].sid == $e.data('id')) {
                                var deliveryType = deliveryWays[j].deliveryWay;
                                $e.find('button[data-type=' + deliveryType + ']').addClass('checked').siblings().removeClass('checked');
                                $e.find('.js-tips[for=' + deliveryType + ']').show().siblings('.js-tips').hide();
                                break;
                            }
                        }
                    });

                    $this.on('click', '.js-btn-delivery', function () {
                        if ($(this).is('.checked')) return;
                        var $item = $(this).closest('.js-item'),
                            deliveryType = $(this).data('type');
                        $item.find('button[data-type=' + deliveryType + ']').addClass('checked').siblings().removeClass('checked');
                        $item.find('.js-tips[for=' + deliveryType + ']').slideDown().siblings('.js-tips').slideUp();
                    });
                    // 保存 更新本地存储 返回结算页
                    $this.on('click', '.js-ok', function () {
                        var ways = [];
                        $this.find('.js-item').each(function () {
                            var $ele = $(this), $item = $ele.closest('.js-item');
                            ways.push({
                                type: $item.data('type'),
                                sid: $item.data('id'),
                                deliveryWay: $ele.find('button.checked').data('type')
                            });
                        });
                        settlementData.deliveryWays = ways;
                        localStorage.setItem('mmh_settlementData', JSON.stringify(settlementData));
                        //history.go(-1);
                        location.href = '/cart#/settlement'

                    });
                }
            };

            router.push(home)
                .push(settlement)
                .push(delivery)
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