define(function(require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            // ajax向node请求的url;
            api: {
                index: '/api/cart/',
                settlement: '/api/settlement'
            }
        },
        init: function() {
            require.async('router', page.setRouter); //加载路由库文件
            page.bindEvents();
        },
        bindEvents: function() {},
        setRouter: function() {
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });
            /* 购物车页 */
            var home = {
                url: '/',
                className : 'm-cart-all',
                render: function(callback){
                    home.params = {
                        cartId: localStorage.getItem(CONST.local_cartId)
                    };
                    callback.loadingDelay = 10; //出现loading的时机
                    page.renderModule('index', callback, home.params);
                },
                bind:function(){
                    var $module = $(this);
                    require.async('app/cart_home', function(cart) {
                        cart.init();
                    });
                }
            };
            /* 结算页 */
            var settlement = {
                url: '/settlement/:params?',
                render: function(callback) {
                    var params = {}; //this.params;
                    var hashParams = M.url.getParams(this.params.params); //json params
                    if (!$.isEmptyObject(hashParams)) {
                        var jsonTerm = JSON.parse(hashParams.jsonTerm);
                        params.inlet = hashParams.inlet;
                        params.jsonTerm = jsonTerm;
                    }
                    var localData = localStorage.getItem(CONST.local_settlement_addr);
                    if (localData) {
                        localData = JSON.parse(localData);
                        params.deliveryAddr = localData;
                    }

                    page.renderModule('settlement', callback, params);
                },
                bind: function() {
                    var $module = $(this);
                    require.async('app/settlement', function(func) {
                        new func(page, $module).render();
                    });

                }
            };

            router.push(home)
                .push(settlement)
                .setDefault('/').init();

        },
        /*渲染模块*/
        renderModule: function(module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        }

    };

    page.init();

});