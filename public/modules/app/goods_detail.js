/*
 * 商品详情
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.query(),
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {
            //加载swipe
            require.async('swipe', function () {
                M.swipe.init(); //初始化Swipe
            });

            page.bindEvents();
        },
        bindEvents: function () {

            /*质检报告，数据缓存到本地*/
            var templateId = M.url.query('templateId'),
                qualityPic =  JSON.parse(localStorage.getItem('qualityPic')) || {};
            qualityPic[templateId] = $('.quality').data('pic');
            localStorage.setItem('qualityPic', JSON.stringify(qualityPic));

        }
    };

    page.init();
});