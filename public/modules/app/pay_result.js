// 支付成功结果页
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params,
            // ajax向node请求的url;
            api: {}
        },
        init: function () {
            page.bindEvents();
        },
        bindEvents: function () {
            $app = $('#app'), params = this.config.params;
            $app.on('click', '.js-invoice', function () {
                $('.js-invoice-infos').toggleClass('show');
            });
            $app.on('click', '#submitInvoice', function () {
                var data = {
                    orderBatchNo: params.batchNo,
                    invoiceType: $('input[name="invoiceType"]').val(),  // 发票类型 1个人，2公司
                    invoceTitle: $('input[name="invoceTitle"]').val()   // 发票抬头
                };
                if (data.invoceTitle == '') {
                    $('input[name="invoceTitle"]').focus();
                    return alert('请填写发票抬头');
                }
                console.log(data);
                confirm('点击确定后不可修改<br>发票抬头为:' + data.invoceTitle, function () {
                    this.hide();
                    M.ajax({
                        url: '/api/pay/invoice',
                        data: {data: data},
                        success: function (res) {
                            if (res.success_code == 200) {
                                $('.js-invoice-infos li p').eq(0).html('<label>' + (data.invoiceType == 1 ? '个人' : '公司') + '</label>');
                                $('.js-invoice-infos li p').eq(1).html('<label>' + data.invoceTitle + '</label>')
                            }
                        }
                    })
                });
            });
        }
    };
    page.init();
});