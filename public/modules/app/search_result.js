/*
 * 搜索结果列表
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function () {
            //懒加载
            M.lazyLoad.init({
                container: $('.list')
            });
        }
    };

    page.init();
});