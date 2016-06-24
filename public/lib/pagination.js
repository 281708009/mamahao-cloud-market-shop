/*
 * mobile pagination.js v1.0
 * Description: 上拉到底部ajax请求分页数据
 * Params: @container 请求完数据后，列表容器  @api api接口，分页数据请求地址
 * Ps: 依赖common.js中的ajax方法,请求完成判断为无数据或最后一页，可在ele上data-locked:true,减少ajax请求
 * Author: xqs 2016/06/24
 * */

/*
 * 使用示例
 $.pagination({
 scrollBox: '.container',
 api: '/beans',
 container: '.container .floor-list',
 fnLoaded: function (res, ele) {
 console.log(JSON.stringify(res))
 }
 });
 * */

;
(function ($) {

    'use strict';

    $.page = {
        defaults: {
            "scrollBox": window,    //触发分页的滚动容器
            "flex": 40,     // 距离底部距离，加载分页数据
            "api": null,    //api接口，分页数据请求地址
            "container": ".pagination",    //分页列表填充容器
            "fnLoading": null,   //加载中
            "fnLoaded": null    //ajax请求后，回调函数res[请求参数和返回的data]、ele[当前容器]
        },
        init: function (options) {
            var me = this,
                o = me.opts = $.extend({}, me.defaults, options || {});    //参数

            o.scrollBox = $(o.scrollBox); //转为jquery对象

            $(o.container).addClass('pagination');  //添加分页容器标识

            /*初始化*/
            $(o.scrollBox).on("scroll touchmove", function () {
                me.scroll();
            });

            me.run(); //运行

        },
        run: function () {
            var me = this, o = me.opts;
            var $this = me.$ele = $(o.container + ':visible');

            //容器不存在或已被锁定
            if (!$this[0] || $this.data('locked')) return false;

            //容器内没有列表或不满一屏，初始化一次
            if (!$this.children()[0] || !me.isFullScreen()) {
                //主动发起请求
                var ajax_info = $this.data('params');
                me.ajax(ajax_info);
                return false;
            }

        },
        /*滚动触发事件*/
        scroll: function () {
            var me = this, o = me.opts;
            var $this = me.$ele = $(o.container + ':visible');

            //容器不存在或已被锁定
            if (!$this[0] || $this.data('locked')) return false;

            /*滚动到底部*/
            var scrollTop = o.scrollBox.scrollTop(),
                diff = getHeight(o.scrollBox.children()) - (o.scrollBox.height() + scrollTop);
            if (diff < o.flex) {
                var ajax_info = $this.data('params') || {};
                ajax_info.page = ($this.data('page') || 1) + 1;

                console.log('ajax_info--->', ajax_info)
                me.ajax(ajax_info);
            }


            /*计算所有元素总宽*/
            function getHeight(eles) {
                var result = 0;
                $.each(eles, function () {
                    result += $(this).outerHeight(true);
                });
                return result;
            }

        },
        /*判断是否满一屏决定是否需要加载下一页*/
        isFullScreen: function () {
            var me = this, o = me.opts;
            var full_screen = true;
            if ($(o.container).height() < $(window).height()) {
                full_screen = false;
            }
            console.log('is_full_screen--->', full_screen);
            return full_screen;
        },
        /*do ajax*/
        ajax: function (params) {
            var me = this, o = me.opts;

            me.$ele.data('locked', true);   //锁定当前请求

            /*加载中*/
            if (!o.fnLoading) {
                me.$ele.append('<div class="tc pagination-loading">正在加载中...</div>');
            } else {
                o.fnLoading();
            }

            var defaults = {
                "page": 1,
                "count": o.count || 20,   //默认页数和条数
                "index": me.$ele.children().length   //索引值
            };
            var ajax_info = $.extend({}, defaults, params || {});

            //do ajax
            M.ajax({
                showLoading: false,
                url: ajax_info.url || o.api,
                data: ajax_info,
                success: function (res) {
                    var info = {
                        params: ajax_info,
                        data: res
                    };
                    me.$ele.data('page', ajax_info.page); //设置页数

                    o.callback && o.callback.call(this, info, me.$ele);  //将结果返回
                },
                complete: function () {
                    me.$ele.data('locked', false);    //解除锁定
                    $('.pagination-loading').remove(); //移除loading
                }
            });


        }

    };

    /*
     * === 分页ajax加载插件 ===
     * */
    $.pagination = function (options) {
        $.page.init(options);  //初始化
    }

})(window.jQuery);