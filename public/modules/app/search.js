/*
 * 搜索相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function (container) {
            var $module = $(container);

            var $js_search = $module.find('.js-search'),
                $keywords = $module.find('#keywords'),
                $search_tips = $module.find('.search-tips'),
                $default = $module.find('.autoshow');

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
            $module.on('click', '.hot dd em', function () {
                var keywords = $(this).text();
                page.searchGoods(keywords, false);
            });
            //点击提示关键字或历史记录关键字
            $module.on('click', '.search-tips li, .history .list li', function () {
                var keywords = $(this).text();
                page.searchGoods(keywords);
            });

            //搜索下拉提示
            $keywords.on('input', function () {
                var keywords = $.trim($keywords.val());
                if (keywords) {
                    M.ajax({
                        showLoading: false,
                        url: '/api/searchKeywordTips',
                        data: {data: JSON.stringify({keyword: keywords})},
                        success: function (res) {
                            if (res.template) {
                                $default.addClass('none');
                                $search_tips.empty().append(res.template).removeClass('none');
                            } else {
                                $default.removeClass('none');
                                $search_tips.addClass('none');
                            }
                        }
                    });
                } else {
                    $default.removeClass('none');
                    $search_tips.addClass('none');
                }
            });

            //清空历史搜素记录
            $module.on('click', '.js-del-history', function () {
                localStorage.removeItem(CONST.local_search_history);
                M.tips({
                    body: '历史搜索记录已清除',
                    callback: function () {
                        $('.history').fadeOut(function () {
                            $(this).remove();
                        });
                    }
                });
            });

        },
        /*关键字搜索商品*/
        searchGoods: function (keywords, type) {
            if (type !== false) {
                var history = JSON.parse(localStorage.getItem(CONST.local_search_history)) || [];
                history.unshift(keywords);
                localStorage.setItem(CONST.local_search_history, JSON.stringify(history.unique().slice(0, 10)));
            }
            //清除更新本地存储的筛选参数
            localStorage.removeItem(CONST.local_search_params);

            window.location.href = '#/list/keywords=' + keywords;
        }
    };

    module.exports = page;
});