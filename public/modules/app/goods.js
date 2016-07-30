/*
 * 商品相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {
            page.bindEvents();
        },
        bindEvents: function () {

            //懒加载
            M.lazyLoad.init({
                container: $('.list')
            });

            var $nav = $('.category .nav') , $list = $('.category .list');
            $nav.find('li:eq(0)').data('template',$list.html()); //缓存第一个分类的节点

            //点击一级分类
            $nav.on('click','li', function () {
                var $this = $(this), typeID = $this.data('id');
                $this.addClass('active').siblings().removeClass('active');

                var template = $this.data('template');
                if(template){
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
            });
        }
    };

    page.init();
});