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
    // 填充页面数据
    pageFunc.prototype.fillData = function (data) {
        var me = this, $this = me.container;
        // 地址信息 {"deliveryAddrId":27442,"addr":"浙江宁波市海曙区天宁大厦1111","consignee":"网瘾少年","phone":"15267436078","areaId":330203}

        var htmlArr = [
            '<a class="u-arrow right" href="/center#/address/f=1&amp;id=', data.deliveryAddrId + '">',
            '<dl class="default"><dt><strong>', data.consignee, '</strong><em>', data.phone, '</em></dt><dd>', data.addr,
            '</dd></dl></a>'
        ];

        $('.js-address').html(htmlArr.join(''));
        $this.find('[name="deliveryAddrId"]').val(data.deliveryAddrId);
    };

    /* 获取页面结算请求数据
     * return data 支付请求参数
     * */
    pageFunc.prototype.getFormData = function () {
        var me = this, $this = me.container;
        var deliveryWays = $this.find('.js-delivery').data('delivery'),
            $deliveryAddrId = $this.find('[name="deliveryAddrId"]'),
            $vouchers = $this.find('.js-vouchers'),
            $mbean = $('.open input[name="mbean"]'),
            $gbCount = $('.open input[name="gbCount"]'),
            $mcCount = $('.open input[name="mcCount"]'),

            data = {
                orderBatchNo: $this.find('[name="orderNo"]').val(),
                dealingType: 1,      // 支付方式 1 线上支付 2 线下支付
                madouCount: $mbean.length ? +$mbean.val() : 0,       // 妈豆数
                gbCount: $gbCount.length ? +$gbCount.val() : 0,          // gb积分
                mothercareCount: $mcCount.length ? +$mcCount.val() : 0,  // mc积分
                deliveryAddrId: $deliveryAddrId.length ? $deliveryAddrId.val() : '', // 收货地址id
                deliveryWays: JSON.stringify(deliveryWays),    // 配送方式
            };
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
        var payPrice = $('[name="payPrice"]').val(),    // 实付金额(已计算邮费)
            maxTotalDiscount = $('.js-point').data('totalDiscount'),  // 最大可抵扣金额
            voucherDiscount = $('.js-vouchers').length ? $('.js-vouchers').data('discount') : 0;   // 优惠券优惠金额

        // 计算妈豆
        // 计算gb积分
        // 计算mc积分
        var $mbean = $('.open input[name="mbean"]'),
            $gbCount = $('.open input[name="gbCount"]'),
            $mcCount = $('.open input[name="mcCount"]');
        var mbeansDiscount = $mbean.length ? M.calc.divide($mbean.val(), $mbean.data('ratio')) : 0, //mbeansCount/mbeansRatio;   // 妈豆|积分抵扣金额 = 妈豆|积分数 / 妈豆|积分数抵扣率
            gbDiscount = $gbCount.length ? M.calc.divide($gbCount.val(), $gbCount.data('ratio')) : 0,
            mcDiscount = $mcCount.length ? M.calc.divide($mcCount.val(), $mcCount.data('ratio')) : 0;

        var discount = voucherDiscount + mbeansDiscount + gbDiscount + mcDiscount,
            price = M.calc.subtract(payPrice, discount);
        $('.js-finalPrice').html('￥' + price);

        $.each($('.js-point li').not('.open'), function () {
            var $input = $(this).find('input[type="tel"]'), // 当前虚拟货币数量输入框
                ratio = $input.data('ratio'),   // 当前虚拟货币的比率
                max = $input.data('max'),
                maxDiscount = M.calc.subtract(maxTotalDiscount, discount),
                maxCount = max;
            if ($input.attr('name') == 'mcCount') {
                maxCount = M.calc.multiply(~~(maxDiscount / 100), 100) * ratio;
            } else {
                maxCount = M.calc.multiply(maxDiscount, ratio);
            }
            var useableCount = max < maxCount ? max : maxCount; // 剩余最大可抵扣金额

            $input.data('useable', useableCount);
            $input.val(useableCount);
            $input.next().html('￥' + M.calc.divide(useableCount, ratio));
            $input.prev().html(useableCount);
        })

    }
    pageFunc.prototype.stockOut = function (data) {
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
                    html.push('<em>赠品</em>')
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
                            location.href = '/'
                        }
                    },
                    {
                        "text": "继续结算", "class": "success", "onClick": function () {
                            this.hide();
                            location.reload();
                        }
                    }
                ]
            });
        } else {
            M.dialog({
                body: '您选购的商品缺货', buttons: [{
                    "text": "找其他商品", "class": "", "onClick": function () {
                        location.href = '/'
                    }
                }, {
                    "text": "我知道了", "class": "success", "onClick": function () {
                        this.hide();
                        history.go(-1);
                    }
                }]
            });
        }
    }
    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this;

        var $this = me.container, $spa = $('.spa'), $dom = $('#settlement');
        var stockOutCode = $dom.data('stockout');
        if (stockOutCode && stockOutCode != 0) {
            me.stockOut(stockOutCode == -10001?[]:$dom.data('stockoutGoods'));
            return;
        }
        // 获取本地配送地址
        var localData = localStorage.getItem(CONST.local_settlement_addr);
        if (localData) {
            localData = JSON.parse(localData);
            me.fillData(localData);
            localStorage.removeItem(CONST.local_settlement_addr);
            // 配送方式
        }


        me.calcu(); // 计算优惠后最终金额

        $this.on('click', '.mask', function () {
            $(this).closest('.u-fixed').removeClass('show');
        });
        $this.on('click', '.js-cancel', function () {
            $(this).closest('.u-fixed').removeClass('show');
        })

        // 切换配送方式
        var $delivery = $('#delivery-ways');

        $this.on('click', '.js-delivery', function () {
            $delivery.addClass('show');
        });
        // 点击不同的配送方式,切换显示不同的配送信息
        $this.on('click', '.js-btn-delivery', function () {
            if ($(this).is('.checked')) return;
            var $item = $(this).closest('.js-delivery-item'),
                deliveryType = $(this).data('type');
            $item.find('button[data-type=' + deliveryType + ']').addClass('checked').siblings().removeClass('checked');
            $item.find('.js-tips[for=' + deliveryType + ']').slideDown().siblings('.js-tips').slideUp();
        });

        // 保存 更新结算页配送方式信息
        $this.on('click', '.js-ok', function () {
            var ways = [], desc = '';
            $this.find('.js-delivery-item').each(function () {
                var $item = $(this);
                ways.push({
                    type: $item.data('type'),
                    sid: $item.data('id'),
                    deliveryWay: $item.find('button.checked').data('type')
                });
                if ($item.index() > 0) desc += ' + ';
                desc += $item.find('button.checked').text();
            });
            $('.js-delivery').data('delivery', ways).find('em').html(desc);
            $delivery.removeClass('show');
        });

        // 点击显示切换优惠券弹出层
        $this.on('click', '.js-coupon', function () {
            $('#coupon').addClass('show');
        });

        // 点击切换优惠券 弹出层隐藏
        $this.on('click', '.js-coupon-item', function () {
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
            $('#coupon').removeClass('show');
            me.calcu();
        });

        // 妈豆积分使用
        $this.on('click', '.u-switch', function () {

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
        $this.on('input', '.js-point input[type="tel"]', function () {
            var $input = $(this);
            var max = $input.data('useable');
            if ($input.val() == '') {

            } else if ($input.val() > max || !/^[1-9]+\d*$/.test($input.val())) {
                $input.val(max);
            }
            $input.next().html('￥' + $input.val() / $input.data('ratio'));
            me.calcu();
        });

        $this.on('change', '.js-point input[type="tel"]', function () {
            var $input = $(this);
            var max = $input.data('useable');
            if ($input.val() == '') {
                $input.closest('li').find('.u-switch').trigger('click');
            } else if ($input.val() > max) {
                $input.val(max);
            }
            if ($input.attr('name') == 'mcCount') {
                if (~~($input.val() / 300) == 0) {
                    $input.val(300)
                } else {
                    $input.val(~~($input.val() / 300) * 300);
                }
            }
            $input.next().html('￥' + $input.val() / $input.data('ratio'));
            me.calcu();
        });

        // 点去付款, 跳转支付方式选择页
        $this.on('click', '.js-pay', function () {
            var data = me.getFormData();
            if (!data.deliveryAddrId) {
                return alert('请填写收货地址');
            }
            console.log('支付提交数据--------', data);
            M.ajax({
                url: '/api/pay',
                data: {data: data},
                success: function (res) {
                    if (res.success_code == 200) {
                        // 跳转支付方式选择页
                        location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx230909e739bb72fd&redirect_uri=http://api.mamhao.com/mamahao-app-api/pay/weixin/getOpenId.htm?orderNo=' + res.orderBatchNo + '&response_type=code&scope=snsapi_base&state=123456#wechat_redirect';
                    }
                }
            });

        });
    }
});