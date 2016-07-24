/*
 * 搜索相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        init: function () {
            var $fm_search = $('.fm-search'), $js_search = $('.js-search');
            $js_search.on('click', function () {
                $fm_search.trigger('submit');
            });
            $fm_search.on('submit',function () {
                var keywords = $.trim($('#keywords')  .val());
                if(!keywords){
                    M.tips('关键字不能为空');
                    return false;
                }
            });
        }
    };

    page.init();
});