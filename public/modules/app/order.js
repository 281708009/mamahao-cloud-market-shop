define(function(require, exports, module) {

    //构造函数
    function pageFunc(page, container){
        this.page = page;
        this.container = container;
    }

    //导出
    module.exports = pageFunc;

    //渲染页面
    pageFunc.prototype.render = function () {
        var me = this, page = me.page;

        M.swipe.init();//初始化Swipe
        $.pagination({  //分页
            keys: {count: "count"},
            container: '.ui-swipe-item .list',
            api: page.config.api['orders'],
            fnSuccess: function (res, ele) {
                var data = res.data;
                if (!data.template) {
                    return ele.data('locked', true)
                }
                ele.append(data.template);
            }
        });

        me.bind(); //绑定事件

    };

    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this;

        var $this = me.container;

        $this.on('click', '.item', function (e) {
            location.href = $(this).attr('url');
        });
        $this.on('click', '.u-btn', function (e) {
            e.stopPropagation();
        });

        // 删除订单
        $this.on('click', '.js-btn-del', function () {

        });

        // 提醒发货
        $this.on('click', '.js-btn-remind', function () {

        });

        // 门店信息
        $this.on('click', '.js-btn-shop', function () {

        });

        // 确认收货
        $this.on('click', '.js-btn-receive', function () {

        });
    };




});