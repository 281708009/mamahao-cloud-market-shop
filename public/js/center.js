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
        /*路由测试*/
        var router = new Router({
            container: '.container',
            enter: 'enter',
            leave: 'leave',
            enterTimeout: 250,
            leaveTimeout: 250
        });

        var home = {
            url: '/',
            className: 'home',
            render: function () {
                return $('#tpl_home').html();
            },
            bind: function () {

            }
        };

        var address = {
            url: '/address',
            className: 'address',
            render: function () {
                return $('#tpl_address').html();
            }
        };

        var address_add = {
            url: '/address/add',
            className: 'address-info',
            render: function () {
                return $('#tpl_address_add').html();
            }
        };
        var address_edit = {
            url: '/address/edit',
            className: 'address-info',
            render: function () {
                return $('#tpl_address_edit').html();
            }
        };

        router.push(home)
            .push(address)
            .push(address_add)
            .push(address_edit)
            .setDefault('/').init();

    }
};

page.init();