/*
 * 首页
 * by xqs
 * */
define(function(require, exports, module) {
    var page = {
        config: {
            
        },
        init: function () {
            page.bindEvents();
        },
        bindEvents: function () {
            // dropload 测试
            M.dropLoad({
                callback: function (me) {
                    setTimeout(function () {
                        console.log('end');
                        me.pullToRefreshDone();
                    }, 1000);
                }
            });


            //分页测试
            window.onload = function () {
                $.pagination({
                    scrollBox: '.container',
                    api: '/test/request',
                    container: '.container .floor-list',
                    fnSuccess: function (res, ele) {
                        console.log(JSON.stringify(res))
                        ele.data('locked', true);
                    }
                });
            };
        }
    };

    page.init();
});