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
        //加载swipe
        require.async('swipe', function () {
            M.swipe.init();//初始化Swipe
        });

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
            var $item = $(this).closest('.item')
                ,data = JSON.stringify({orderNo: $item.data('id')});
            confirm('是否确认删除订单',function(){
                M.ajax({
                    url:'/api/order/orderDelete',
                    data:{data:data},
                    success:function(res){
                        M.tips('删除成功');
                        $item.remove();
                    }
                })
                this.hide();
            });
        });

        // 提醒发货
        $this.on('click', '.js-btn-remind', function () {
            var data = JSON.stringify({orderNo: $(this).closest('.item').data('id')});
            M.ajax({
                url:'/api/order/orderRemind',
                data:{data:data},
                success:function(res){
                    M.tips({body: "提醒成功",delay: 10000000, class: "true"});
                }
            })
        });

        // 门店信息
        $this.on('click', '.js-btn-shop', function () {
            var data = JSON.stringify({orderNo: $(this).closest('.item').data('id'),shopId:$(this).data('shopId')});
            M.ajax({
                url:'/api/order/shopInfo',
                data:{data:data},
                success:function(res){
                    console.log(res);
                    var bodyHtml = ['<dl><dt>门店名称:</dt><dd>',res.shopName,'</dd>','<dt>门店地址:</dt><dd>',res.addr,'</dd>','<dt>营业时间:</dt><dd><p>工作日:' + res.workTime + '</p>','<p>节假日:' + res.holiday + '</p>','</dd>','<dt>联系方式:</dt><dd><a href="tel:' + res.telephone + '">',res.telephone,'</a></dd>','</dl>'];
                    M.dialog({
                        body: bodyHtml.join(''),
                        buttons: [
                            {"text": "确定", "class": "success", "onClick": function(){this.hide();}}
                        ]
                    })
                }
            });
        });

        // 确认收货
        $this.on('click', '.js-btn-receive', function () {
            var $item = $(this).closest('.item')
                ,data = JSON.stringify({orderNo: $item.data('id')});
            confirm('是否确认收货',function(){
                //M.ajax({
                //    url:'/api/order/orderReceive',
                //    data:{data:data},
                //    success:function(res){
                //        跳转成功页面
                //    }
                //})
                this.hide();
            });
        });
    };




});