/*
 * 首页
 * by xqs
 * */
var page = {
    config: {},
    init: function () {
        page.bindEvents();
        page.setRouter();
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
            container: '#spa',
            enter: 'enter',
            leave: 'leave',
            enterTimeout: 250,
            leaveTimeout: 250
        });

        var home = {
            url: '/',
            className: 'm-home',
            render: function () {
                return $('#tpl_home').html();
            },
            bind: function () {

            }
        };

        router.push(home)
            .setDefault('/').init();
    }
};

page.init();