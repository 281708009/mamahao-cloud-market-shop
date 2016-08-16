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
        // 地址信息
        // 配送方式信息
        /*var deliveryWays = data.deliveryWays;

         $this.find('.js-delivery-item').each(function (i, ele) {
         var $e = $(ele);
         for (j = 0; j < deliveryWays.length; j++) {
         if (deliveryWays[j].sid == $e.data('id')) {
         var deliveryType = deliveryWays[j].deliveryWay;
         $e.find('button[data-type=' + deliveryType + ']').addClass('checked').siblings().removeClass('checked');
         $e.find('.js-tips[for=' + deliveryType + ']').show().siblings('.js-tips').hide();
         break;
         }
         }
         });*/
        // 优惠券信息
        // 妈豆数
        // gb积分
        // mc积分
    };
    // 获取页面结算显示信息
    pageFunc.prototype.getPageData = function () {
        var me = this, $this = me.container;
        var deliveryAddr = $this.find('.js-address').data('addr'),
            $vouchers = $this.find('.js-vouchers'),
            data = {
                orderNo: $this.find('[name="orderNo"]').val(),
                dealingType: 1,      // 支付方式 1 线上支付 2 线下支付
                madouCount: 0,       // 妈豆数
                gbCount: 0,          // gb积分
                mothercareCount: 0,  // mc积分
                deliveryAddr: deliveryAddr ? deliveryAddr : '', // 收货地址信息
                deliveryWays: $this.find('.js-delivery').data('delivery'),    // 配送方式
            };
        if ($vouchers.length) {
            data.vouchers = {ids: $vouchers.data('ids'), discount: $vouchers.data('discount')};    // 优惠券ids
        }
        //deliveryAddrId: $this.find('[name="deliveryAddrId"]').val(),  // 收货地址id
        //deliveryWays:[{
        //"type":2,   // 1门店 2仓库
        //"sid":2,    // 相应的id
        //"deliveryWay":1     // 1门店配送 2上门自提 3快递配送
        //}],    // 配送方式
        return data;
    };
    /* 获取页面结算请求数据
     * return data 支付请求参数
     * */
    pageFunc.prototype.getFormData = function () {
        var me = this, $this = me.container;
        var deliveryWays = $this.find('.js-delivery').data('delivery'),
            $deliveryAddrId = $this.find('[name="deliveryAddrId"]'),
            $vouchers = $this.find('.js-vouchers'),
            data = {
                orderBatchNo: $this.find('[name="orderNo"]').val(),
                dealingType: 1,      // 支付方式 1 线上支付 2 线下支付
                madouCount: 0,       // 妈豆数
                gbCount: 0,          // gb积分
                mothercareCount: 0,  // mc积分
                deliveryAddrId: $deliveryAddrId.length ? $deliveryAddrId.val() : '', // 收货地址id
                deliveryWays: JSON.stringify(deliveryWays),    // 配送方式
            };
        if ($vouchers.length && $vouchers.data('ids')) {
            data.vouchers = $vouchers.data('ids');    // 优惠券ids
        }
        return data;
    };
    /* 计算最终付款金额  */
    pageFunc.prototype.calcu = function () {
        // 最终支付金额 = 实付金额 + 邮费 - 优惠券discount - 妈豆抵扣 - gb积分抵扣 - mc积分抵扣
        // 计算优惠券
        // 计算折扣券
        var payPrice = $('[name="payPrice"]').val(),    // 实付金额(已计算邮费)
            voucherDiscount = $('.js-vouchers').length ? $('.js-vouchers').data('discount') : 0;   // 优惠券优惠金额

        // 计算妈豆
        // 计算gb积分
        // 计算mc积分
        var $mbean = $('#mbean.open').length ? $('#mbean.open').find('input[type="tel"]') : null;
        var mbeansDiscount = $mbean ? $mbean.val() / $mbean.data('ratio') : 0, //mbeansCount/mbeansRatio;   // 妈豆|积分抵扣金额 = 妈豆|积分数 / 妈豆|积分数抵扣率
            gbDiscount = 0,
            mcDiscount = 0;

        var price = payPrice - voucherDiscount - mbeansDiscount - gbDiscount - mcDiscount
        $('.js-finalPrice').html('￥' + price.toFixed(2));

    }
    //绑定事件
    pageFunc.prototype.bind = function () {
        var me = this;

        var $this = me.container, $spa = $('.spa');
        // 获取本地结算信息
        var localData = localStorage.getItem('mmh_settlementData');
        if (localData) {
            localData = JSON.parse(localData);
            // 渲染页面
            me.fillData(localData);

            // 配送方式
        } else {
            // 获取页面结算信息,存储到本地
            //console.log(me.getPageData());
            localStorage.setItem('mmh_settlementData', JSON.stringify(me.getPageData()));
        }

        me.calcu(); // 计算优惠后最终金额
        // 切换地址

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
                $input.val($input.data('max'));
            } else {
                $(this).closest('li').removeClass('open');
                var $d = $(this).closest('li').find('.js-point-discount-display');
                $d.html('￥' + $d.data('max'));
            }
            me.calcu();
        });

        //
        $this.on('change', '.js-point input[type="tel"]', function () {
            var $input = $(this);
            $input.next().html('￥' + $input.val() / $input.data('ratio'));
            me.calcu();
        });
        // 点去付款, 跳转支付方式选择页
        $this.on('click', '.js-pay', function () {
            var data = me.getFormData();
            if (!data.orderBatchNo) {
                return alert('请填写收货地址');
            }
            return console.log('支付提交数据--------', data);
            M.ajax({
                url: '/api/pay',
                data: {data: data},
                success: function (res) {
                    $spa.html(res.template);
                }
            });

        });
    }
});