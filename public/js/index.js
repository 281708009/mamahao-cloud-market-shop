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
        M.dropload({
            loadUpFn: function (me) {
                setTimeout(function () {
                    me.resetload();
                },2000);
            }
        });
    }
};

page.init();