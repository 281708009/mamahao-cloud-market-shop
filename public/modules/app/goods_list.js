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
        init: function () {
            page.bindEvents();
        },
        //绑定事件
        bindEvents: function () {
            var c = page.config;

            var hashParams = c.hashParams(), searchParams = c.searchParams();

            //懒加载
            M.lazyLoad.init({
                container: $('.u-goods-list')
            });

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

            //点击排序
            $('.u-tab').on('click', 'ul li', page.goodsSort);

            //点击筛选，到筛选页
            $('.js-to-filter').on('click', page.toFilter);
        },
        //排序
        goodsSort: function () {
            var o = page.elements, c = page.config;
            var $this = $(this), index = $this.index();

            if ($this.hasClass('active') && !$this.find('em')[0]) return false;

            //hashParams
            var hashParams = c.hashParams();  //json params

            //sortParams: //searchType: 0综合，1销量，2价格，3最新  sort: 0从高到低, 1从低到高
            var sortParams = {
                searchType: index,
                sort: $this.hasClass('down') ? 1 : 0
            };

            var params = $.extend({}, sortParams, hashParams);

            //将参数存储到本地
            localStorage.setItem(CONST.local_search_params, JSON.stringify(params));

            M.ajax({
                url: '/api/goods_list',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    $('.spa').empty().append(res.template);
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