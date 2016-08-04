/*
 * 搜索结果列表
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        elements: {},
        init: function () {
            //清除列表页需要的参数
            localStorage.removeItem(CONST.local_search_params);

            var $nav = $('.category .nav'), $list = $('.category .list');
            $nav.find('li:eq(0)').data('template', $list.html()); //缓存第一个分类的节点

            //点击一级分类
            $nav.on('click', 'li', page.getTypeTree);
        },
        //获取二级分类
        getTypeTree: function () {
            var $this = $(this), typeID = $this.data('id'), $list = $('.category .list');
            $this.addClass('active').siblings().removeClass('active');

            var template = $this.data('template');
            if (template) {
                return $list.empty().append(template);
            }

            //获取二级分类
            M.ajax({
                url: '/api/goodsTypeTree',
                data: {data: JSON.stringify({typeId: typeID})},
                success: function (res) {
                    $this.data('template', res.template);
                    $list.empty().append(res.template);
                }
            });
        }
    };

    module.exports = page;
});