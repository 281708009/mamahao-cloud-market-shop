define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/cart/',
                settlement: '/api/settlement',
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
                            location: true,
                            url: '/api/cart/selectedCart',
                            data: {data: data},
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
                                compoentId: $(this).closest('li').data('compoentId') || $item.data('compoentId')
                            }));
                        M.ajax({
                            location: true,
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
                                location:true,
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
                        if (count <= 0 || $(this).is('.disabled')) {
                            if($(this).data('tips')) return alert($(this).data('tips'));
                            return;
                        }

                        var data = JSON.stringify($.extend(true, home.params, {
                            newCount: count,
                            compoentId: $item.data('compoentId')
                        }));
                        M.ajax({
                            location:true,
                            url: '/api/cart/updateCartItemCount',
                            data: {data: data},
                            success: function (res) {
                                $spa.html(res.template);
                            }
                        });
                    });

                    // 跳转商品详情页
                    $this.on('click', '.js-jump', function () {
                        $(this).attr('url') != '' && (location.href = $(this).attr('url'));
                    });

                    // 清除购物车新商品标识;
                    localStorage.removeItem(CONST.local_cart_newGoods)
                }
            };

            /* 结算页 */
            var settlement = {
                url: '/settlement/:params?',
                render: function (callback) {
                    var params = {};    //this.params;
                    var hashParams = M.url.getParams(this.params.params);  //json params
                    if(!$.isEmptyObject(hashParams)) {
                        var jsonTerm = JSON.parse(hashParams.jsonTerm);
                        params.inlet = hashParams.inlet;
                        params.jsonTerm = jsonTerm;
                    }
                    var localData = localStorage.getItem(CONST.local_settlement_addr);
                    if (localData) {
                        localData = JSON.parse(localData);
                        params.deliveryAddr = localData;
                    }
                    console.log(params);

                    page.renderModule('settlement', callback, params);
                },
                bind: function () {
                    var $module = $(this);
                    require.async('app/settlement', function (func) {
                        new func(page, $module).render();
                    });

                }
            };


            router.push(home)
                .push(settlement)
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