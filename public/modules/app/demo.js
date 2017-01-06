/*
 * demo
 * by xqs
 * */
define(function (require, exports, module) {

    var page = {
        config: {},
        init: function () {
            require.async('router', page.setRouter); //加载路由库文件
            page.bindEvents();
        },
        bindEvents: function () {
            var app = $("#app");
            app.on("click", '.js-tips',function () {
                M.tips('号外！号外！英国脱欧啦！');
            });
            app.on("click", '.js-dialog',function () {
                M.dialog('确认要删除苍井空全集吗？');
            });
            app.on("click", '.js-loading',function () {
                var $loading = $('.loading').show();
                setTimeout(function () {
                    $loading.hide();
                },3000);
            });
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
                className: 'flex-column',
                render: function () {
                    return $('#tpl_home').html();
                },
                bind: function () {

                }
            };

            var navCenter = {
                url: '/navCenter',
                className: 'm-navCenter',
                render: function () {
                    return $('#tpl_navCenter').html();
                },
                bind: function () {
                    M.nav.init();
                }
            };

            /*下拉刷新*/
            var dropload = {
                url: '/dropload',
                className: 'flex-column',
                render: function () {
                    return $('#tpl_dropload').html();
                },
                bind: function () {
                    require.async('dropload', function () {
                        // dropload 测试
                        M.dropLoad({
                            callback: function (me) {
                                setTimeout(function() {
                                    console.log('end');
                                    me.pullToRefreshDone();
                                }, 1000);
                            }
                        });
                    });

                    /*上拉加载分页*/
                    $.pagination({
                        scrollBox: '.dropload',
                        api: '/beans',
                        container: '.dropload',
                        fnSuccess: function (res, ele) {
                            console.log(JSON.stringify(res));
                        },
                        fnFailed: function (res,ele) {
                            ele.data('locked',false);
                        }
                    });
                }
            };
            /*鼠标滚动header展开或收缩*/
            var headroom = {
                url: '/headroom',
                className: 'm-headroom flex-column',
                render: function () {
                    return $('#tpl_headroom').html();
                },
                bind: function () {
                    require.async('headroom', function () {

                        //鼠标滚动上滑展开下滑收缩
                        $("#header").headroom({
                            scroller: $(".headroom-body")[0],
                            classes: {
                                initial: "animated",
                                pinned: "fadeInDown", //向下拖动
                                unpinned: "fadeOutUp"  //向上拖动
                            }
                        });
                    });
                }
            };

            router.push(home)
                .push(navCenter)
                .push(headroom)
                .push(dropload)
                .setDefault('/').init();
        }
    };

    page.init();

});