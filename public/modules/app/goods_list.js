/*
 * 搜索相关
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            searchParams: function () {
                return JSON.parse(localStorage.getItem(CONST.local_search_params)) || {};   //local: 请求商品列表需要的参数
            }
        },
        init: function (container) {
            var c = page.config;
            c.$container = container;
            var $module = c.$container;

            //点击排序
            $module.on('click', '.u-tab ul li', page.goodsSort);

            //点击筛选，到筛选页
            $module.on('click', '.js-to-filter', page.toFilter);

            //点击购买须知
            $module.on('click', '.js-ellipsis', function () {
                $(this).toggleClass('collapse');
            });

            page.bindEvents();
        },
        //绑定事件
        bindEvents: function () {
            var c = page.config;
            var $module = c.$container;

            var hashParams = c.hashParams(), searchParams = c.searchParams();

            //懒加载
            setTimeout(function () {
                M.lazyLoad.init({
                    container: $module.find('.list')
                });
            }, 250);

            //分页配置
            var pgParams = $.extend({}, searchParams, hashParams);
            $.pagination({
                params: pgParams,
                keys: {index: "nextPageStart"},
                container: '.u-goods-list',
                scrollBox: '.m-goods-list .list',
                api: '/api/goods_list',
                fnLoading: function (ele) {
                    ele.append('<li class="tc pagination-loading">正在加载中...</li>');
                },
                fnSuccess: function (res, ele) {
                    var data = res.data;
                    if (!data.template) {
                        return ele.data('locked', true)
                    }
                    ele.append(data.template);
                    //懒加载
                    M.lazyLoad.init({
                        container: ele
                    });
                }
            });

            //鼠标滚动上滑展开下滑收缩
            require.async('headroom', function () {
                var $target = $module.find(".desc");
                $target.headroom({
                    scroller: $module.find('.list')[0],
                    onPin: function () {
                        $target.show();
                    },
                    onUnpin: function () {
                        $target.hide();
                    }
                });
            });

        },
        //排序
        goodsSort: function () {
            var o = page.elements, c = page.config;
            var $module = c.$container;
            var $this = $(this), index = $this.index();

            if ($this.hasClass('active') && !$this.find('em')[0]) return false;

            if ($this.hasClass('active')) {
                $this.toggleClass('down');  //js动态控制，不在pug文件中控制
            } else {
                $this.addClass('active').siblings().removeClass('active');
            }

            //hashParams
            var hashParams = c.hashParams();  //json params

            //sortParams: //searchType: 0综合，1销量，2价格，3最新  sort: 0从高到低, 1从低到高
            var sortParams = {
                searchType: index,
                sort: $this.hasClass('down') ? 0 : 1
            };

            var searchParams = JSON.parse(localStorage.getItem(CONST.local_search_params));
            var params = $.extend({}, searchParams, sortParams, hashParams);

            //将参数存储到本地
            localStorage.setItem(CONST.local_search_params, JSON.stringify(params));

            M.ajax({
                location: true,
                url: '/api/goods_list',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    var $list = $(res.template).find('.list').html();
                    $module.find('.list').empty().append($list);

                    //重新绑定事件
                    page.bindEvents();
                }
            });
        },
        //到筛选页
        toFilter: function () {
            var hashParamsStr = (location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&');
            location.href = '#/filter/' + hashParamsStr;
        }
    };

    module.exports = page;
});