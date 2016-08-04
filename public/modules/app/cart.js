define(function(require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/cart/',
                select:'/api/cart/selectedCart'
            }
        },
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件

            page.bindEvents();
        },
        bindEvents: function () {
        },
        setRouter:function () {
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

                    var params = {
                        cartId: localStorage.getItem(CONST.local_cartId)
                    };
                    //获取地理位置信息
                    require.async('app/location', function (obj) {
                        new obj().getLocation({
                            success: function (res) {
                                console.log(res)
                                 params.areaId = res.areaId;
                                callback.loadingDelay = 10; //出现loading的时机
                                page.renderModule('index', callback, params);
                                home.params = params;
                            },
                            fail: function () {
                                page.renderModule('index', callback, params);
                            }
                        });
                    })
                },
                bind: function () {
                    var $this = $(this),$spa = $('.spa');
                    // 选择/取消选择所有商品
                    $this.on('click', '#selectAll' ,function(e){
                        e.stopPropagation();
                        var selected = $(this).is(':checked')?2: 3,
                            data = JSON.stringify($.extend(true, home.params,{isSelected:selected}));
                        M.ajax({
                            url:'/api/cart/selectedCart',
                            data:{data:data},//areaId=330102&cartId=52825&isSelected=2
                            success:function(res){
                                $spa.html(res.template);
                            }
                        })
                    });
                    // 选择/取消选择该商品
                    $this.on('click','[type="checkbox"]',function(){
                        var $item = $(this).closest('.item'),
                            selected = $(this).is(':checked')?0: 1,
                            data = JSON.stringify($.extend(true, home.params,{isSelected:selected,compoentId:$item.data('compoentId')}));
                        M.ajax({
                            url:'/api/cart/selectedCart',
                            data:{data:data},
                            success:function(res){
                                $spa.html(res.template);
                            }
                        })
                    });
                    // 删除该商品
                    $this.on('click','.js-del',function(){
                        var $item = $(this).closest('.item'),
                            data = JSON.stringify($.extend(true, home.params,{compoentType:$item.data('compoentType'),compoentId:$item.data('compoentId')}));
                        confirm('确认删除这个商品吗?',function() {
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
                    $this.on('click','.js-update',function(){
                        var $item = $(this).closest('.item'),
                            count = +$(this).data('count');
                        if(count <= 0 || $(this).is('.disabled')) return;
                        var data = JSON.stringify($.extend(true, home.params,{newCount:count,compoentId:$item.data('compoentId')}));
                        M.ajax({
                            url: '/api/cart/updateCartItemCount',
                            data: {data: data},
                            success: function (res) {
                                $spa.html(res.template);
                            }
                        });
                    });
                }
            };

            router.push(home)
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