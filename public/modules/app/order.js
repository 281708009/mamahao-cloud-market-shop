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
        //$this.on('click', '.js-goods', function (e) {
        //    e.stopPropagation();
        //    location.href = $(this).attr('url');
        //});
        $this.on('click', '.u-btn', function (e) {
            e.stopPropagation();
        });

        // 删除订单
        $this.on('click', '.js-btn-del', function () {
            var $item = $(this).closest('.item')
                , data = {orderNo: $item.length ? $item.data('id') : $(this).data('orderNo')};
            confirm('是否确认删除订单', function () {
                M.ajax({
                    url: '/api/order/orderDelete',
                    data: {data: JSON.stringify(data)},
                    success: function (res) {
                        M.tips('删除成功');
                        $item.length ? $item.remove() : location.href = '/center#/orders';
                    }
                })
                this.hide();
            });
        });

        // 提醒发货
        $this.on('click', '.js-btn-remind', function () {
            var data = JSON.stringify({orderNo: $(this).closest('.item').data('id')});
            M.ajax({
                url: '/api/order/orderRemind',
                data: {data: data},
                success: function (res) {
                    M.tips({body: "提醒成功", delay: 1000, class: "true"});
                }
            })
        });

        // 门店信息
        $this.on('click', '.js-btn-shop', function () {
            var data = JSON.stringify({orderNo: $(this).closest('.item').data('id'), shopId: $(this).data('shopId')});
            M.ajax({
                url: '/api/order/shopInfo',
                data: {data: data},
                success: function (res) {
                    console.log(res);
                    var bodyHtml = ['<dl><dt>门店名称:</dt><dd>', res.shopName, '</dd>', '<dt>门店地址:</dt><dd>', res.addr, '</dd>', '<dt>营业时间:</dt><dd><p>工作日:' + res.workTime + '</p>', '<p>节假日:' + res.holiday + '</p>', '</dd>', '<dt>联系方式:</dt><dd><a href="tel:' + res.telephone + '">', res.telephone, '</a></dd>', '</dl>'];
                    M.dialog({
                        body: bodyHtml.join(''),
                        buttons: [
                            {
                                "text": "确定", "class": "success", "onClick": function () {
                                this.hide();
                            }
                            }
                        ]
                    })
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
                    var bodyHtml = ['<dl><dt>门店名称:</dt><dd>', res.shopName, '</dd>', '<dt>配送员:</dt><dd>', res.deliveryStaff, '</dd>', '<dt>送达时间:</dt><dd><p>预计' + res.arriveTime + '前送达</p>', '</dd>', '</dl>'];
                    M.dialog({
                        body: bodyHtml.join(''),
                        buttons: [
                            {
                                "text": "确定", "class": "success", "onClick": function () {
                                this.hide();
                            }
                            }
                        ]
                    })
                }
            });
        });

        // 确认收货
        $this.on('click', '.js-btn-receive', function () {
            var $item = $(this).closest('.item'),
                orderNo = $item.data('id'),
                data = JSON.stringify({orderNo: orderNo});
            confirm('是否确认收货', function () {
                M.ajax({
                    url: '/api/order/orderReceive',
                    data: {data: data},
                    success: function (res) {
                        //跳转成功页面
                        if (res.success) {
                            location.href = '/center#/order/result/' + data.templateId + '/' + orderNo;
                        } else {
                            alert(res.msg);
                        }
                    }
                })
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
            })
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
                        //location.href = '/cart'
                    }
                }
            });
        }
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
        })

        // 订单详情页 点击单个商品的'再次购买'
        $this.on('click', '.js-single-rebuy', function () {
            var goodsArr = [];
            var $goods = $(this).closest('.js-goods')
            var goods = $goods.data('infos');
            goods.count = 1;
            goods.isBindShop = false;
            goodsArr.push(goods);
            rebuy(goodsArr);
        })


    };


});