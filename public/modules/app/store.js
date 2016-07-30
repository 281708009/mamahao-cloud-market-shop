/**
 * Created by Adang on 2016/7/27.
 */
define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {
                index: '/api/storeList'
            }
        },
        info: {},
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件
            
            page.bindEvents();
        },
        bindEvents: function () {
            //console.log();
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
                                $.extend(res, {memberId: 18}); // 临时用户id;
                                var params = res;
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
                    var $module = $(this), o = page.info;
                    // 点击查看服务详情;
                    o.popService = $(".u-stores-service");
                    $module.on("click", ".js-service", function () {
                        page.showService($(this).data('json'));
                    });
                    o.popService.on("click", ".js-close", function () {
                        o.popService.removeClass("show");
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
        },
        // 弹出查看服务详情;
        showService: function (data) {
            var self = this, o = self.info, l = data.length, arr = [];
            if(!l) return;
            for(var i = 0; i < l; i++){
                arr.push('<li><div class="icon"><img src="'+ data[i].tagPic +'@40w_40h_100q.jpg" alt=""></div><dl><dt>'+ data[i].tagTitle +'</dt><dd>'+ data[i].tagDesc +'</dd></dl></li>');
            }
            o.popService.addClass("show").find(".list").html(arr.join(''));
            console.log(data);
        }
        
    };

    page.init();

});