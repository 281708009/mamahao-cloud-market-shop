define(function(require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/cart/'
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

                    //获取地理位置信息
                    require.async('app/location', function (obj) {
                        new obj().getLocation({
                            success: function (res) {
                                console.log(res)
                                var params = {
                                    cartId: localStorage.getItem('cartId')|| 30885,
                                    areaId: res.areaId
                                };
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