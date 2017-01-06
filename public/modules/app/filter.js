/*
 * 筛选相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        config: {
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            searchParams: function () {
                return JSON.parse(localStorage.getItem(CONST.local_search_params)) || {};   //local: 请求商品列表需要的参数
            }
        },
        init: function () {
            var c = page.config;
            var hashParams = c.hashParams(), searchParams = c.searchParams();
            //选中当前筛选条件
            searchParams.ages && $.each(searchParams.ages.split(','), function (i, v) {
                $('.ages .content li[data-id="' + v + '"]').addClass('active');
            });
            searchParams.categoryId && $.each(searchParams.categoryId.split(','), function (i, v) {
                $('.types .content li[data-id="' + v + '"]').addClass('active');
            });
            searchParams.brandIds && $.each(searchParams.brandIds.split(','), function (i, v) {
                $('.brands .content li[data-id="' + v + '"]').addClass('active');
            });

            /*筛选商品*/
            $('.js-collapse').on('click', function () {
                var $this = $(this), $target = $this.closest('.item').find('.content li:eq(5)~li');
                if ($this.hasClass('bottom')) {
                    $this.text('全部收起').removeClass('bottom').addClass('top');
                    $target.removeClass('hide');
                } else {
                    $this.text('全部展开').removeClass('top').addClass('bottom');
                    $target.addClass('hide');
                }
            });

            $('.m-filter').on('click', '.content li', function () {
                var $this = $(this), $target = $this.closest('.item');
                $this.toggleClass('active');
                if (!$target.hasClass('ages')) {
                    $this.siblings().removeClass('active');
                }
            });

            $('.js-filter').on('click', page.filterGoods);
        },
        /*筛选商品*/
        filterGoods: function () {
            var c = page.config;
            var hashParams = c.hashParams(), searchParams = c.searchParams();

            //组装参数
            var $items = $('.item'), params = {};
            $.each($items, function () {
                var $this = $(this), $active = $this.find('li.active'), field = $this.data('field');
                params[field] = (function () {
                    var arr = [];
                    $.each($active, function () {
                        arr.push($(this).data('id'));
                    });
                    return arr.join(',');
                })();
            });

            //将参数存储到本地
            localStorage.setItem(CONST.local_search_params, JSON.stringify($.extend(searchParams, hashParams, params)));

            hashParams = $.extend({}, c.hashParams());
            window.location.href = '#/list/' + $.param(hashParams);
        }
    };

    module.exports = page;
});