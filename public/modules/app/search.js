/*
 * 搜索相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function () {

            /*关键字搜索商品*/
            var $fm_search = $('.fm-search'), $js_search = $('.js-search');
            $js_search.on('click', function () {
                $fm_search.trigger('submit');
            });
            $fm_search.on('submit', function () {
                var keywords = $.trim($('#keywords').val());
                if (!keywords) {
                    M.tips('关键字不能为空');
                    return false;
                }
            });
            $('.hot dd em, .history .list li').on('click','', page.searchGoods);

        },
        /*关键字搜索商品*/
        searchGoods: function (keywords) {
            var $this = $(this);
            var redirectURL = '/goods/search/result?keywords=' + $this.text();
            window.location.href = redirectURL;
        }
    };

    page.init();
});