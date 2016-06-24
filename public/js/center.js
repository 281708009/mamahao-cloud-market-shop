/*
 * 首页
 * by xqs
 * */
var page = {
    config: {
        // ajax向node请求的url;
        api: {
            home: "/home",
            address: "/address",
            addressEdit: "/address/edit",
            beans: "/beans",
            integral: "/integral"
        }
    },
    init: function () {
        page.bindEvents();
        page.setRouter();
    },
    bindEvents: function () {

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
            render: function (callback) {
                var template = $('#tpl_home').html();
                callback(null, template);
            },
            bind: function () {

            }
        };

        /*地址列表*/
        var address = {
            url: '/address',
            className: 'm-address',
            render: function (callback) {
                page.renderModule('address', callback);
            }
        };

        /*新增地址*/
        var address_add = {
            url: '/address/add',
            className: 'm-address-info',
            render: function () {
                return $('#tpl_address_add').html();
            }
        };

        /*编辑地址*/
        var address_edit = {
            url: '/address/edit/:id',
            className: 'm-address-info',
            render: function (callback) {
                var params = this.params;
                page.renderModule('addressEdit', callback, params);
            }
        };

        // 妈豆列表；
        var beans = {
            url: '/beans',
            className: 'm-beans',
            render: function (callback) {
                page.renderModule('beans', callback);
            }
        };

        // 分员积分；
        var integral = {
            url: '/integral/:type',
            className: 'm-integral',
            render: function (callback) {
                var params = this.params;
                page.renderModule('integral', callback, params);
            }
        };

        router.push(home)
            .push(address)
            .push(address_add)
            .push(address_edit)
            .push(beans)
            .push(integral)
            .setDefault('/').init();
    },
    /*渲染模块*/
    renderModule: function (module, callback, params) {
        params && $.each(params, function(key, val){
            params[key] = val.replace(/^:/g,'');
        });
        // console.log(hash)
        M.ajax({
            url: page.config.api[module],
            dataType: "html",
            data: params || {},
            success: function (res) {
                var template = res;
                callback(null, template);
            }
        });
    }
};

page.init();