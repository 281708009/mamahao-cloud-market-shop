define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.query(),
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {


            page.bindEvents();
        },
        bindEvents: function () {


            // 评价分页;
            $.pagination({
                keys: {count: "count"},
                scrollBox: '#app',
                api: "/store/assess/" + $(".m-stores-assess").data("id"),
                fnSuccess: function (res, ele) {
                    var data = res.data;
                    if (!data.template) {
                        return ele.data('locked', true)
                    }
                    ele.append(data.template);
                }
            });
        }
    };

    page.init();
});