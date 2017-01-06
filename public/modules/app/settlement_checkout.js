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
        me.bind(); //绑定事件

    };
    /* 缺货提醒 */
    pageFunc.prototype.stockOut = function (code,data) {
        var localData = localStorage.getItem(CONST.local_settlement_addr);
        if (localData) {
            localData = JSON.parse(localData);
            localStorage.removeItem(CONST.local_settlement_addr);
        }
        if(code == 14001 || code == 3119){
            location.href = '/cart';
        }else{
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
                                    location.href = '/cart';
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
                                    location.href = '/cart';
                                }
                            }
                        }]
                    });
                }
            }
        }
    };
    // 填充页面数据
    pageFunc.prototype.fillData = function (data) {
        var me = this, $container = me.container;
        // 地址信息 {"deliveryAddrId":27442,"addr":"浙江宁波市海曙区天宁大厦1111","consignee":"网瘾少年","phone":"15267436078","areaId":330203}
        console.log(data);
        var htmlArr = [];
        htmlArr.push('<a class="u-arrow right" href="/center#/address/f=1&amp;id=' + data.deliveryAddrId + '">');
        if (data.isDefult) {
            htmlArr.push('<dl class="default"><dt><strong>');
        } else {
            htmlArr.push('<dl><dt><strong>');
        }
        htmlArr.push(data.consignee + '</strong><em>' + data.phone + '</em></dt><dd>' + data.addr);
        htmlArr.push('</dd></dl></a>');

        $('.js-address').html(htmlArr.join(''));
        $container.find('[name="deliveryAddrId"]').val(data.deliveryAddrId);
    };

    /* 获取页面结算请求数据
     * return data 支付请求参数
     * */
    pageFunc.prototype.getFormData = function () {
        var me = this, $container = me.container;
        var deliveryWays = $container.find('.js-delivery').data('delivery'),
            $deliveryAddrId = $container.find('[name="deliveryAddrId"]'),
            $vouchers = $container.find('.js-vouchers'),
            $mbean = $('.open input[name="mbean"]'),
            $gbCount = $('.open input[name="gbCount"]'),
            $mcCount = $('.open input[name="mcCount"]');
        if ($('#mbean').find('.u-switch:checked').length) $mbean = $('input[name="mbean"]');
        var data = {
            orderBatchNo: $container.find('[name="orderNo"]').val(),
            dealingType: 1,      // 支付方式 1 线上支付 2 线下支付
            madouCount: $mbean.length ? +$mbean.val() : 0,       // 妈豆数
            gbCount: $gbCount.length ? +$gbCount.val() : 0,          // gb积分
            mothercareCount: $mcCount.length ? +$mcCount.val() : 0  // mc积分
        };

        if ($deliveryAddrId.length) {
            data.deliveryAddrId = $deliveryAddrId.val();// 收货地址id
        }
        if (deliveryWays) {
            data.deliveryWays = JSON.stringify(deliveryWays);// 配送方式
        }
        // invoice 发票信息
        // {
        //    "invoiceType":1, 1-个人(默认)；2-公司；0-不开发票
        //    "invoiceName":"个人" 个人；公司名称；空字符串
        //}
        var invoice = {};
        var invoiceType = $('.js-invoice').data('type');
        invoice.invoiceType = invoiceType || 0;
        if (/(1|2)/.test(invoiceType)) {
            invoice.invoiceName = $('.js-invoice').data('name');
        }

        data.invoice = JSON.stringify(invoice);
        if ($vouchers.length && $vouchers.data('ids')) {
            data.voucherIds = '' + $vouchers.data('ids');    // 优惠券ids
        }
        return data;
    };
    /* 计算最终付款金额  */
    pageFunc.prototype.calcu = function () {
        // 最终支付金额 = 实付金额 + 邮费 - 优惠券discount - 妈豆抵扣 - gb积分抵扣 - mc积分抵扣
        // 计算优惠券
        // 计算折扣券
        var payPrice = +$('[name="payPrice"]').val(),    // 商品金额
            mailPrice = +$('[name="mailPrice"]').val(),     // 邮费
            maxTotalDiscount = $('.js-point').data('totalDiscount'),  // 最大可抵扣金额
            voucherDiscount = $('.js-vouchers').length ? $('.js-vouchers').data('discount') : 0,   // 优惠券优惠金额
            $finalPayPrice = $('[name="finalPrice"]');
        //payPrice += mailPrice;
        var $mbean = $('.open input[name="mbean"]'),
            $gbCount = $('.open input[name="gbCount"]'),
            $mcCount = $('.open input[name="mcCount"]');
        var mbeansDiscount = $mbean.length ? M.calc.divide($mbean.val(), $mbean.data('ratio')) : 0, //mbeansCount/mbeansRatio;   // 妈豆|积分抵扣金额 = 妈豆|积分数 / 妈豆|积分数抵扣率
            gbDiscount = $gbCount.length ? M.calc.divide($gbCount.val(), $gbCount.data('ratio')) : 0,
            mcDiscount = $mcCount.length ? M.calc.divide($mcCount.val(), $mcCount.data('ratio')) : 0;

        var discount = M.calc.add(M.calc.add(M.calc.add(voucherDiscount, mbeansDiscount), gbDiscount), mcDiscount);
        var price = M.calc.subtract(payPrice, discount);
        if ($('#deliveryFee:visible').length) {
            $('.js-finalPrice').html('￥' + (price + mailPrice));
            $finalPayPrice.val(price + mailPrice);
        } else {
            $('.js-finalPrice').html('￥' + price);
            $finalPayPrice.val(price);
        }

        $.each($('.js-point li').not('.open'), function () {
            if ($(this).find('.u-switch').is('.disabled')) return false;
            var $input = $(this).find('input[type="tel"]'), // 当前虚拟货币数量输入框
                ratio = $input.data('ratio'),   // 当前虚拟货币的比率
                max = $input.data('max'),
                maxDiscount = M.calc.subtract(payPrice, discount),
                maxCount = max;
            if ($input.attr('name') == 'mcCount') {
                maxCount = Math.floor(maxDiscount * ratio / 100) * 100;
            } else {
                maxCount = M.calc.multiply(maxDiscount, ratio);
            }
            var useableCount = max < maxCount ? max : maxCount; // 剩余最大可抵扣金额

            $input.data('useable', useableCount);
            $input.val(useableCount);
            $input.next().html('￥' + M.calc.divide(useableCount, ratio));
            $input.prev().html(useableCount);

            // 可用虚拟货币数量为0时 不可点击
            if (!$(this).find('.u-switch').is('.disabled')) {
                if (useableCount == 0) {
                    $(this).find('.u-switch').addClass('diabled').attr('disabled', true);
                } else {
                    $(this).find('.u-switch').removeClass('diabled').attr('disabled', false);
                }
            }
        });

    };
    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this;

        var $container = me.container, $spa = $('.spa'), $dom = $('#settlement');
        var stockOutCode = $dom.data('stockout');
        if (stockOutCode && stockOutCode != 0) {
            me.stockOut(stockOutCode, $dom.data('stockoutGoods'));
            return;
        }
        // 获取本地配送地址
        var localData = localStorage.getItem(CONST.local_settlement_addr);
        if (localData) {
            localData = JSON.parse(localData);
            me.fillData(localData);
            //localStorage.removeItem(CONST.local_settlement_addr);
        }

        if (!$('[name="payPrice"]')[0]) return;

        me.calcu(); // 计算优惠后最终金额

        $container.on('click', '.mask', function () {
            $(this).closest('.u-fixed').removeClass('show');
        });
        $container.on('click', '.js-cancel', function () {
            $(this).closest('.u-fixed').removeClass('show');
        });

        //呼出模态框
        $container.on('click', '.js-modal', function () {
            var modal = $($(this).data("target"));
            modal.addClass("show");
        });

        $container.on('click', '.m-invoice-pop dd em', function () {
            var $this = $(this), index = $this.index(), invoiceName = $this.data('txt');
            $this.addClass('active').siblings().removeClass('active');
            if (index !== 2) {
                $('.invoice-cont').removeClass('none');
                if (index == 0) {
                    $('.invoice-cont').find('input').val(invoiceName);
                } else {
                    $('.invoice-cont').find('input').val('');
                }
            } else {
                $('.invoice-cont').addClass('none');
            }
        });

        $container.on('click', '.js-confirm-invoice', function () {
            var $type = $('.invoice-type em.active'),
                invoice_type = +$type.data('type'),
                $input = $('.invoice-cont input'),
                input_val = $.trim($input.val());
            var invoice_info = {type: invoice_type};
            if (/(1|2)/.test(invoice_type)) {
                if (!input_val) return M.tips('请输入发票抬头');
                invoice_info.name = input_val;
            }
            $('.js-invoice').data(invoice_info).find('em').text($type.text());
            $(this).closest('.u-fixed').removeClass('show');
        });

        // 点击不同的配送方式,切换显示不同的配送信息
        $container.on('click', '.js-btn-delivery', function () {
            if ($(this).is('.checked')) return;
            var $item = $(this).closest('.js-delivery-item'),
                deliveryType = $(this).data('type');
            $item.find('button[data-type=' + deliveryType + ']').addClass('checked').siblings().removeClass('checked');
            $item.find('.js-tips[for=' + deliveryType + ']').slideDown().siblings('.js-tips').slideUp();
            // 共几种配送方式;
            var sum = [];
            $(".js-btn-delivery.checked").each(function () {
                sum.push($(this).data("type"));
            });
            // 如果所有配送方式里面只有门店自提那么就不需要快递费用;
            if (sum.getIndex(1) == -1 && sum.getIndex(3) == -1) {
                // 配送方式门店配送时,去掉运费显示
                $('#deliveryFee').hide();
            } else {
                $('#deliveryFee').show();
            }
            me.calcu();
        });

        // 保存 更新结算页配送方式信息
        $container.on('click', '.js-ok', function () {
            var ways = [], desc = [];

            $container.find('.js-delivery-item').each(function () {
                var $item = $(this);
                ways.push({
                    type: $item.data('type'),
                    sid: $item.data('id'),
                    deliveryWay: $item.find('button.checked').data('type')
                });
                if(desc.getIndex($item.find('button.checked').text())===-1){
                    desc.push($item.find('button.checked').text());
                }
            });
            desc = desc.join(' + ');
            $('.js-delivery').data('delivery', ways).find('em').html(desc);
            $('#delivery-ways').removeClass('show');
        });

        // 点击切换优惠券 弹出层隐藏
        $container.on('click', '.js-coupon-item', function () {
            $('.open').each(function () {
                $(this).find('.u-switch').trigger('click');
            });
            $('.u-radio:checked').prop('checked', false);
            var ids = $(this).data('id'), discount = $(this).data('discount');
            if (ids) {
                $('.js-vouchers').data({
                    ids: ids,
                    discount: discount
                }).html('省' + discount + '元');
            } else {
                $('.js-vouchers').data({
                    ids: null,
                    discount: 0
                }).html('不使用优惠券');
            }
            $(this).find('.u-radio').prop('checked', true);
            $('#coupon').removeClass('show');
            me.calcu();
        });

        // 妈豆积分使用
        $container.on('click', '.u-switch', function () {

            if ($(this).is('.disabled')) return;
            if ($(this).is(':checked')) {
                $(this).closest('li').addClass('open');
                var $input = $(this).closest('li').find('input[type="tel"]');
                //var count = (!$input.data('max2') || $input.data('max') < $input.data('max2')) ? $input.data('max') : $input.data('max2')
                $input.val($input.data('useable'));
            } else {
                $(this).closest('li').removeClass('open');
                var $d = $(this).closest('li').find('.js-point-discount-display');
                $d.html('￥' + $d.data('max'));
            }
            me.calcu();


        });

        //
        $container.on('input', '.js-point input[type="tel"]', function () {
            var $input = $(this);
            var max = $input.data('useable');
            if ($input.val() == '') {

            } else if ($input.val() > max || !/^[1-9]+\d*$/.test($input.val())) {
                $input.val(max);
            }
            $input.next().html('￥' + $input.val() / $input.data('ratio'));
            me.calcu();
        });

        $container.on('change', '.js-point input[type="tel"]', function () {
            var $input = $(this);
            var max = $input.data('useable');
            if ($input.val() == '') {
                $input.closest('li').find('.u-switch').trigger('click');
            } else if ($input.val() > max) {
                $input.val(max);
            }
            if ($input.attr('name') == 'mcCount') {
                if (~~(M.calc.divide($input.val(), 100)) == 0) {
                    $input.val(100);
                } else {
                    $input.val(~~(M.calc.divide($input.val(), 100)) * 100);
                }
            }
            $input.next().html('￥' + $input.val() / $input.data('ratio'));
            me.calcu();
        });

        // 点去付款, 跳转支付方式选择页
        $container.on('click', '.js-pay', function () {
            var data = me.getFormData();
            // data.paysType = 5;  // 微商城专用区分订单所用 paysType=5;废弃，在另外的地方传值;
            if (!data.deliveryAddrId) {
                return alert('请填写收货地址');
            }
            if (+$('[name="finalPrice"]').val() == 0) {
                M.dialog({
                    body: '全妈豆支付请下载妈妈好APP', buttons: [{
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
                return;
            }
            M.ajax({
                url: '/api/pay',
                data: {data: JSON.stringify(data)},
                success: function (res) {
                    if (res.success_code == 200) {
                        // 跳转支付方式选择页
                        M.pay.order(res.orderBatchNo);
                    }
                }
            });

        });

        $container.on('click', '.js-inspect-pay', function () {
            var data = me.getFormData();
            // data.paysType = 5;  // 微商城专用区分订单所用 paysType=5;废弃，在另外的地方传值;
            //return console.log('支付提交数据--------', data);
            if (+$('[name="finalPrice"]').val() == 0) {
                M.dialog({
                    body: '全妈豆支付请下载妈妈好APP', buttons: [{
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
                return;
            }
            M.ajax({
                url: '/api/order/pay',
                data: {data: JSON.stringify(data)},
                success: function (res) {
                    if (res.success_code == 200) {
                        // 跳转支付方式选择页
                        M.pay.order(res.orderBatchNo, 2);
                    }
                }
            });

        });
    };


});