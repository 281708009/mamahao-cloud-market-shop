/*
 * 首页
 * by xqs
 * */
var page = {
    config: {},
    init: function () {
        page.bindEvents();
    },
    bindEvents: function () {
        // dropload 测试
        M.dropLoad({
            callback: function (me) {
                setTimeout(function() {
                    console.log('end');
                    me.pullToRefreshDone();
                }, 1000);
            }
        });


        //分页测试
        window.onload = function () {
            $.pagination({
                scrollBox: '.container',
                api: '/beans',
                container: '.container .floor-list',
                fnSuccess: function (res, ele) {
                    console.log(JSON.stringify(res))
                }
            });
        };
    }
};

page.init();