/*
 * 筛选相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function () {
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
                if($target.hasClass('types')){
                    $this.siblings().removeClass('active')
                }
            });

            $('.js-filter').on('click', page.filterGoods);
        },
        /*筛选商品*/
        filterGoods: function (keywords) {
            var $this = $(this);
            var redirectURL = '/goods/search/result?keywords=' + $this.text();
            window.location.href = redirectURL;
        }
    };

    page.init();
});