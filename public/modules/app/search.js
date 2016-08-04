/*
 * 搜索相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function () {
            var $js_search = $('.js-search'),
                $keywords = $('#keywords'),
                $search_tips = $('.search-tips'),
                $default = $('.autoshow');

            /*关键字搜索商品*/
            $js_search.on('click', function () {
                var keywords = $.trim($keywords.val());
                if (!keywords) {
                    M.tips('关键字不能为空');
                    return false;
                }
                page.searchGoods(keywords);
            });

            //点击关键字
            $('.hot dd em, .history .list li').on('click', '', function () {
                page.searchGoods($(this).text());
            });

            //搜素下拉提示
            $keywords.on('input', function () {
                var keywords = $.trim($keywords.val());
                if(keywords){
                    M.ajax({
                        url: '/api/searchKeywordTips',
                        data: {data: JSON.stringify({keyword: keywords})},
                        success: function (res) {
                            if(res.template){
                                $default.addClass('none');
                                $search_tips.empty().append(res.template).removeClass('none');
                            }else{
                                $default.removeClass('none');
                                $search_tips.addClass('none');
                            }
                        }
                    });
                }else{
                    $default.removeClass('none');
                    $search_tips.addClass('none');
                }
            });

            //清空历史搜素记录
            $('.js-del-history').on('click', function () {
                localStorage.removeItem(CONST.local_search_history);
                M.tips('历史搜素记录已清除');
            });

        },
        /*关键字搜索商品*/
        searchGoods: function (keywords) {
            var history = JSON.parse(localStorage.getItem(CONST.local_search_history)) || [];
            history.push(keywords);
            localStorage.setItem(CONST.local_search_history, JSON.stringify($.unique(history)));

            window.location.href = '#/list/keywords=' + keywords;
        }
    };

    module.exports = page;
});