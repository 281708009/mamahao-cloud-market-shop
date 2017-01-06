define(function (require, exports, module) {
    var page = {
        config: {
            api: {
                'inspectSettlement': '', // 验货付款结算api接口
            }
        },
        elements: {},
        init: function () {
            var self = this, c = self.config, o = self.elements;
            o.confirmBtn = $('.js-btn-confirm');
            o.module = $('#app');
            self.bind();
        },
        renderDeliveryAddr: function (addr) {
            // 获取本地配送地址
            if (addr) {
                var htmlArr = [];
                htmlArr.push('<a class="u-arrow right" href="/center#/address/f=1&amp;id=' + addr.deliveryAddrId + '">');
                if (addr.isDefult) {
                    htmlArr.push('<dl class="default"><dt><strong>');
                } else {
                    htmlArr.push('<dl><dt><strong>');
                }
                htmlArr.push(addr.consignee + '</strong><em>' + addr.phone + '</em></dt><dd>' + addr.addr);
                htmlArr.push('</dd></dl></a>');

                $('.js-address').html(htmlArr.join(''));
                $('[name="deliveryAddrId"]').val(addr.deliveryAddrId);
                //localStorage.removeItem(CONST.local_settlement_addr);
            }
        },
        stockOutHandler: function (code,data) {
            if(code == 14001 || code == 3119){
                location.href = '/cart';
            }else {
                if (data && data.length > 0) {
                    var html = ['<div class="goods-list"><ul>'];
                    for (i = 0; i < data.length; i++) {
                        var g = data[i];
                        var spDesc = '';
                        $.each(g.spec, function (index) {
                            index > 0 && (spDesc += ',');
                            spDesc += this.value;
                        });
                        html.push('<li>');
                        html.push('<div class="pic"><img src="' + g.itemPic + '@1e_200w_200h_0c_0i_0o_100q_1x.jpg"><em>暂时缺货</em></div>');
                        html.push('<dl><dt>' + g.itemTitle + '</dt><dd><span>' + spDesc + '</span>');
                        if (g.isGift) {
                            html.push('<em>赠品</em>');
                        } else {
                            html.push('<strong>￥' + g.showPrice + '</strong>')
                        }
                        html.push('</dd></dl></li>');
                    }
                    html.push('</ul></div>');
                    M.dialog({
                        className: "m-cart-lack",
                        title: "您选购的以下商品缺货",
                        body: html.join(''),
                        buttons: [
                            {
                                "text": "找相似商品", "class": "", "onClick": function () {
                                location.href = '/';
                            }
                            },
                            {
                                "text": "继续结算", "class": "success", "onClick": function () {
                                this.hide();
                                M.reload();
                            }
                            }
                        ]
                    });
                } else {
                    var localData = localStorage.getItem(CONST.local_settlement_addr);
                    if (localData) {
                        localData = JSON.parse(localData);
                        //localStorage.removeItem(CONST.local_settlement_addr);
                    }
                    if (localData) {
                        M.dialog({
                            body: '商品在该区域暂时缺货', buttons: [{
                                "text": "修改地址", "class": "", "onClick": function () {
                                    location.href = '/center#/address/f=1&id=' + localData.deliveryAddrId;
                                }
                            }, {
                                "text": "我知道了", "class": "success", "onClick": function () {
                                    this.hide();
                                    if (history.length) {
                                        history.go(-1);
                                    } else {
                                        location.reload();
                                    }
                                }
                            }]
                        });
                    } else {
                        M.dialog({
                            body: '商品在该区域暂时缺货', buttons: [{
                                "text": "找其他商品", "class": "", "onClick": function () {
                                    location.href = '/';
                                }
                            }, {
                                "text": "我知道了", "class": "success", "onClick": function () {
                                    this.hide();
                                    if (history.length) {
                                        history.go(-1);
                                    } else {
                                        location.reload();
                                    }
                                }
                            }]
                        });
                    }
                }
            }
        },
        bind: function () {
            var self = this, c = self.config, o = self.elements,
                $dom = $('#settlement');
            var stockOutCode = $dom.data('stockout');
            // 有缺货商品时弹出缺货提醒
            if (stockOutCode && stockOutCode != 0) {
                self.stockOutHandler(stockOutCode,$dom.data('stockoutGoods'));
                return;
            }

            // 获取选择的收货地址并显示
            var localAddr = localStorage.getItem(CONST.local_settlement_addr);
            if(localAddr){
                var localAddr = JSON.parse(localAddr)
                self.renderDeliveryAddr(localAddr);
                var params = $('[name="reqParams"]').val();
                params.deliveryAddrId = localAddr.deliveryAddrId;
                //return console.log(JSON.stringify(params));
                M.ajax({
                    location: false,
                    url: '/api/isSupportInspect',
                    data: {data: params},
                    success: function (res) {
                        $('.js-ctn-selection').html(res.template);
                        localStorage.removeItem(CONST.local_settlement_addr);
                    }
                });
            }
            // 绑定确定按钮事件
            o.module.on('click', '.js-btn-confirm', function () {
                var deliveryAddrId = $('[name="deliveryAddrId"]').val(),
                    dealingType = $('[name="dealingType"]:checked').val(),
                    deliveryWay = $('[name="deliveryWay"]').val(),
                    shopId = $('[name="shopId"]').val(),
                    warehouseId = $('[name="warehouseId"]').val();

                if(!dealingType){
                    return alert('请选择支付方式');
                }
                // 判断是否已填写收货地址 是 next 否:提示填写收货地址
                if (!deliveryAddrId) {
                    M.dialog({
                        body: '您还没有选择收货地址', buttons: [{
                            "text": "取消", "class": "", "onClick": function () {
                                this.hide();
                            }
                        }, {
                            "text": "选择地址", "class": "success", "onClick": function () {
                                location.href = '/center#/address/f=1';
                            }
                        }]
                    });
                    return false;
                }

                var params = {
                    'orderBatchNo': +$('[name="orderNo"]').val(),
                    'dealingType': +dealingType,
                    'deliveryAddrId': +deliveryAddrId,
                    'deliveryWays': $('[name="deliveryWay"]').val()
                };

                var reqParams = JSON.parse($('[name="reqParams"]').val());

                // 判断是否验货付款
                // 是 则调用验货付款结算接口 成功后跳转确认订单成功结果页
                // 否 跳转正常结算页
                if (dealingType == 2) {
                    //return console.log(params);
                    M.dialog({
                        body: $('[name="inspectTopayAlert"]').val(), buttons: [{
                            "text": "暂不下单", "class": "", "onClick": function () {
                                this.hide();
                            }
                        }, {
                            "text": "继续下单", "class": "success", "onClick": function () {
                                M.ajax({
                                    location: true,
                                    url: '/api/checkoutByInspect',
                                    data: {data: JSON.stringify(params)},
                                    success: function (res) {
                                        $('.spa').html(res.template);
                                    }
                                });
                            }
                        }]
                    });

                } else {
                    // 跳转正常结算页
                    reqParams.deliveryAddrId = params.deliveryAddrId;
                    location.href = '/settlement#/checkout/' + $.param(reqParams);

                }
            })
        }
    }

    //page.init();
    module.exports = page;
});