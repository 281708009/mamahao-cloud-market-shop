define(function (require, exports, module) {

    //构造函数
    function pageFunc(page, container) {
        this.page = page;
        this.container = container;
    }

    //导出
    module.exports = pageFunc;

    //渲染页面
    pageFunc.prototype.render = function () {
        var me = this, page = me.page;
        if (me.container.is('.m-order')) {

            //加载swipe
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
                    var $container = $(data.template);
                    ele.append($container);
                    $container.find('.js-countdown').each(function () {
                        var $this = $(this);
                        $this.timeCountDown({
                            second: $this.data('seconds'),
                            callback: function () {
                                $this.remove();
                            }
                        });
                    });
                }
            });
        }
        //M.tips($(".js-footer-rebuy").length);
        me.bind(); //绑定事件

    };

    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this;

        var $this = me.container;

        $this.on('click', '.js-order-detail', function (e) {
            location.href = $(this).attr('url');
        });
        $this.on('click', '.js-goods', function (e) {
            e.stopPropagation();
            location.href = '/goods/detail/?inlet=6&templateId=' + $(this).data('infos').templateId + '&itemId=' + $(this).data('infos').itemId;
        });
        $this.on('click', '.u-btn, .u-checkbox', function (e) {
            e.stopPropagation();
        });

        // 待付款倒计时
        $('.js-countdown').each(function () {
            var $this = $(this);
            $this.timeCountDown({
                second: $this.data('seconds'),
                callback: function () {
                    if ($this.data('pageType') == 1) {
                        $this.remove();
                        $this.closest('.item').find('.js-option').html('<li><button class="u-btn ban">已经失效</button></li>');
                    } else {
                        $this.html('订单已失效，请重新生成。').removeClass('shot');
                        $this.closest('dl').find('.u-btn').remove();
                        $this.closest('dl').append('<button class="u-btn ban"> 订单失效</button>');
                    }
                }
            });
        });

        // 删除订单
        $this.on('click', '.js-btn-del', function () {
            var $item = $(this).closest('.item')
                , data = {orderNo: $(this).data('id')};
            confirm('是否确认删除订单', function () {
                M.ajax({
                    url: '/api/order/orderDelete',
                    data: {data: JSON.stringify(data)},
                    success: function (res) {
                        M.tips('删除成功');
                        $item.length ? $item.remove() : location.href = '/center#/orders';
                    }
                });
                this.hide();
            });
        });
        // 取消订单
        $this.on('click', '.js-btn-cancel', function () {
            var $item = $(this).closest('.item'),
                orderNo = $(this).data('id'),
                data = {orderNo: orderNo};
            confirm('您确定取消订单', function () {
                M.ajax({
                    url: '/api/order/orderCancel',
                    data: {data: JSON.stringify(data)},
                    success: function (res) {
                        window.location.href = '/center#/orders';//跳转到订单页
                    }
                });
                this.hide();
            });
        });

        // 获取取消原因列表
        $this.on('click', '.js-btn-intercept', function () {
            var orderNo = $(this).data('id'), orderLineId = $(this).data('lineId');
            if ($('.js-pop-causes').children().length) {
                $('.js-pop-causes').children().addClass('show');
                return;
            }
            M.ajax({
                url: '/api/order_query_causes',
                data: {data: JSON.stringify({'type': 2})}, // type 1:取消订单, 2:取消发货
                success: function (res) {
                    $('.js-pop-causes').html(res.template);
                    $('.js-close,.mask').on('click', function () {
                        $('.show').removeClass('show');
                    });
                    // 取消发货
                    $('.js-submit-causes').off().on('click', function () {
                        var params = {
                            orderNo: orderNo,
                            orderLineId: orderLineId,
                            causeId: +$('[name="causeId"]:checked').val(),
                            causeDes: $('[name="causeId"]:checked').next().html()
                        };
                        M.ajax({
                            url: '/api/order/orderIntercept',
                            data: {data: JSON.stringify(params)},
                            success: function (res) {
                                M.tips({body: "取消成功", delay: 1000, class: "true"});
                                location.reload();
                            }
                        });
                    });
                    // 做安卓滚动兼容;
                    if(M.tools.isAndroid){
                        require.async('jquery/iscroll-lite', function (func) {
                            new IScroll('.m-returns-pop .i-scroll');
                        });
                    }
                }
            });

        });

        // 提醒发货
        $this.on('click', '.js-btn-remind', function () {
            var $item = $(this).closest('.item'),
                data = {orderNo: $(this).data('id')};
            M.ajax({
                url: '/api/order/orderRemind',
                data: {data: JSON.stringify(data)},
                success: function (res) {
                    M.tips({body: "提醒成功", delay: 1000, class: "true"});
                }
            });
        });

        // 门店信息
        $this.on('click', '.js-btn-shop', function () {
            var data = JSON.stringify({orderNo: $(this).data('id'), shopId: $(this).data('shopId')});
            M.ajax({
                url: '/api/order/shopInfo',
                data: {data: data},
                success: function (res) {
                    console.log(res);
                    var bodyHtml = ['<div class="dialog-delivery-info">'];
                    bodyHtml.push('<p><strong>门店名称：</strong><em>' + res.shopName + '</em></p>');
                    bodyHtml.push('<p><strong>门店地址：</strong><em>' + res.addr + '</em></p>');
                    bodyHtml.push('<p><strong>营业时间：</strong></p>');
                    bodyHtml.push('<p><strong>工作日：</strong><em>' + res.workTime + '</em></p>');
                    bodyHtml.push('<p><strong>节假日：</strong><em>' + res.holiday + '</em></p>');
                    bodyHtml.push('<p><strong>联系方式：</strong><em><a href="tel:' + res.telephone + '">' + res.telephone + '</a></em></p>');
                    bodyHtml.push('</div>');
                    M.dialog({
                        body: bodyHtml.join(''),
                        buttons: [
                            {
                                "text": "确定", "class": "alone", "onClick": function () {
                                this.hide();
                            }
                            }
                        ]
                    });
                }
            });
        });

        $this.on('click', '.js-btn-delivery', function () {
            var data = JSON.stringify({orderNo: $(this).closest('.item').data('id'), shopId: $(this).data('shopId')});
            M.ajax({
                url: '/api/order/deliveryInfo',
                data: {data: data},
                success: function (res) {
                    console.log(res);
                    var bodyHtml = ['<div class="dialog-delivery-info">'];
                    bodyHtml.push('<p><strong>门店名称：</strong><em>' + res.shopName + '</em></p>');
                    bodyHtml.push('<p><strong>配送人：</strong><em>' + res.deliveryStaff + '</em></p>');
                    bodyHtml.push('<p><strong>预计送达时间：</strong><em>' + res.text + '</em></p>');
                    bodyHtml.push('<p><strong>联系方式：</strong><a href="tel:' + res.phone + '">' + res.phone + '</a></p>');
                    bodyHtml.push('</div>');
                    M.dialog({
                        body: bodyHtml.join(''),
                        buttons: [
                            {
                                "text": "我知道啦", "class": "alone", "onClick": function () {
                                this.hide();
                            }
                            }
                        ]
                    });
                }
            });
        });

        // 确认收货
        $this.on('click', '.js-btn-receive', function () {
            var $item = $(this).closest('.item'),
                orderNo = $(this).data('id'),
                data = JSON.stringify({orderNo: orderNo});
            confirm('是否确认收货', function () {
                M.ajax({
                    url: '/api/order/orderReceive',
                    data: {data: data},
                    success: function (res) {
                        //跳转成功页面
                        if (res.success) {
                            location.href = '/center#/order/result/orderNo=' + orderNo;
                        } else {
                            alert(res.msg);
                        }
                    }
                });
                this.hide();
            });
        });

        $this.on('click', '.refund-explain', function () {
            M.dialog({
                body: '如需退换货请您下载并登录“妈妈好APP"申请', buttons: [{
                    "text": "我知道了", "class": "", "onClick": function () {
                        this.hide();
                    }
                }, {
                    "text": "下载APP", "class": "success", "onClick": function () {
                        this.hide();
                        location.href = 'http://app.mamahao.com'
                    }
                }]
            });
        });
        // 提交再次购买请求
        var rebuy = function (goodsList) {
            var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
            var params = {
                cartId: local_cartId,
                jsonTerm: JSON.stringify(goodsList),
                pmtType: 0
            };
            console.log(params);
            M.ajax({
                location: true,
                url: '/api/addToCart',
                data: {data: JSON.stringify(params)},
                success: function (res) {
                    if (res.success_code == 200) {
                        localStorage.setItem(CONST.local_cartId, res.cartId);  //更新本地购物车ID
                        location.href = '/cart#/';
                    }
                }
            });
        };
        // 再次购买选择页 点击确定
        $this.on('click', '.js-rebuy', function () {
            var goodsArr = [];
            $('.js-goods').each(function () {
                if ($(this).find(':checked').length) {
                    var goods = $(this).data('infos');
                    goods.count = 1;
                    goods.isBindShop = false;
                    goodsArr.push(goods);
                }
            });
            rebuy(goodsArr);
        });

        // 订单详情页 点击单个商品的'再次购买'
        $this.on('click', '.js-single-rebuy', function () {
            var goodsArr = [];
            var $goods = $(this).closest('.js-goods')
            var goods = $goods.data('infos');
            goods.count = 1;
            goods.isBindShop = false;
            goodsArr.push(goods);
            rebuy(goodsArr);
        });

        $this.on('click', '.js-topay', function () {
            M.pay.order($(this).data('orderNo'));
        });

        // 底部再次购买按钮;
        $this.on("click", ".js-footer-rebuy", function () {
            var thas = $(this), number = $(".js-goods").length;

            if (number > 1) {
                window.location.href = "#/order/rebuy/" + thas.data("order");
            } else {
                var goodsArr = [],
                    $goods = $(".js-goods").eq(0),
                    goods = $goods.data('infos');
                goods.count = 1;
                goods.isBindShop = false;
                goodsArr.push(goods);
                //alert(JSON.stringify(goodsArr));
                rebuy(goodsArr);
            }
        });
        $this.on("click", ".js-btn-inspect", function () {
            var thas = $(this);
            window.location.href = "#/order/cart/" + thas.data("id");
        });
    };


});