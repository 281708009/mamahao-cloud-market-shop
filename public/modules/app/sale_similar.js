/**
 * Created by Administrator on 2016/11/24.
 */
define(function (require, exports, module) {
    var page = {
        config: {},
        info: {},
        init: function () {
            var self = this, o = self.info, c = self.config;
            o.elems = $(".m-sale-with");
            c.params = M.url.params();

            self.bind();
        },
        bind: function () {
            var self = this, o = self.info, c = self.config;
            //懒加载
            setTimeout(function () {
                M.lazyLoad.init({
                    container: o.elems.find('.u-goods-one')
                });
            }, 250);

            //分页配置
            $.pagination({
                params: {keyword: c.params.keyword, groupId: c.params.groupId, firstTime: false},
                scrollBox: '#app',
                api: "/sale/similar/",
                fnSuccess: function (res, ele) {
                    var data = res.data;
                    if (!data.template) {
                        return ele.data('locked', true).after('<div class="u-null-page"><em>所有商品已加载完成</em></div>');
                    }
                    ele.append(data.template);
                    M.lazyLoad.init({
                        container: o.elems.find('.u-goods-one')
                    });
                }
            });
        }
    };
    page.init();
    module.exports = page;
});