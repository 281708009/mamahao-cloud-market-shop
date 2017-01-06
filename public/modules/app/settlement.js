define(function (require, exports, module) {

    var page = {
        config:{
            params: M.url.params(),
            // ajax向node请求的url;
            api: {
                index: '/api/inspectSettlement',
                checkout: '/api/settlement',
            }
        },
        init: function() {
            require.async('router', page.setRouter); //加载路由库文件
        },
        setRouter: function() {
            var router = new Router({
                container: '#app',
                enter: 'enter',
                leave: 'leave',
                enterTimeout: 250,
                leaveTimeout: 250
            });


            var settlement = {
                url:'/',
                render:function(callback){
                    //
                },
                bind:function(){

                }
            };

            /**
             * 页面 选择是否验货付款
             * @type {{url: string, render: Function, bind: Function}}
             */
            var selection = {
                url:'/selection/:params?',
                render: function(callback){
                    callback.loadingDelay = 10; //出现loading的时机
                    this.params.queryType && (this.params.queryType = +this.params.queryType);
                    var params = {};
                    if(this.params.params) {
                        var hashParams = M.url.getParams(this.params.params); //json params
                        if (!$.isEmptyObject(hashParams)) {
                            if (hashParams.jsonTerm) {
                                var jsonTerm = JSON.parse(hashParams.jsonTerm);
                                params.jsonTerm = jsonTerm;
                                params.inlet = hashParams.inlet;
                            }
                            params.vip = hashParams.vip ? 1 : 0;
                        }
                    }
                    var localAddr = localStorage.getItem(CONST.local_settlement_addr);
                    localAddr = JSON.parse(localAddr);
                    if(localAddr) {
                        params.deliveryAddrId = localAddr.deliveryAddrId;
                    }
                    page.renderModule('index', callback, params);
                },
                bind:function(){
                    require.async('app/settlement_selection', function(selection) {
                        selection.init();
                    });
                }
            };
            /**
             * 页面 普通结算页
             * @type {{url: string, render: Function, bind: Function}}
             */
            var checkout = {
                url:'/checkout/:params?',
                render: function(callback){
                    this.params.queryType && (this.params.queryType = +this.params.queryType);
                    var params = {};

                    if(this.params.params){
                        var hashParams = M.url.getParams(this.params.params); //json params
                        if (!$.isEmptyObject(hashParams)) {
                            if(hashParams.jsonTerm){
                                var jsonTerm = JSON.parse(hashParams.jsonTerm);
                                params.jsonTerm = jsonTerm;
                                params.inlet = hashParams.inlet;
                            }

                            params.vip = hashParams.vip?1:0;
                            if(hashParams.deliveryAddrId){
                                params.deliveryAddrId = hashParams.deliveryAddrId;
                            }else{
                                var localAddr = localStorage.getItem(CONST.local_settlement_addr);
                                localAddr = JSON.parse(localAddr);
                                if(localAddr) {
                                    params.deliveryAddrId = localAddr.deliveryAddrId;
                                }
                            }
                        }
                    }else{
                        var localAddr = localStorage.getItem(CONST.local_settlement_addr);
                        localAddr = JSON.parse(localAddr);
                        if(localAddr) {
                            params.deliveryAddrId = localAddr.deliveryAddrId;
                        }
                    }
                    page.renderModule('checkout', callback, params);
                },
                bind:function(){
                    var $module = $(this);
                    require.async('app/settlement_checkout', function (func) {
                        new func(page, $module).render();
                    });
                }
            };

            router.push(selection)
                .push(checkout)
                .setDefault('/selection').init();
        },
        /*渲染模块*/
        renderModule: function(module, callback, params) {
            var func = require('app/renderSPA');
            func(page.config.api[module], callback, params);
        }
    }

    page.init();



});