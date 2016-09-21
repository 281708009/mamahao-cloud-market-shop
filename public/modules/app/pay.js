define(function(require, exports, module) {

    var wx = require('weixin');
    $('#error').length && M.dialog({
        body: "订单已经支付,请勿重复发起支付",
        buttons: [
            {
                "text": "确定", "class": "success", "onClick": function () {
                location.href = '/center#/orders'
            }
            }
        ]
    });
    (function (wx) {
        var ua = navigator.userAgent.toLowerCase();
        var isWeixin = ua.indexOf('micromessenger') != -1;
        if(!isWeixin){
            $('.js-codepay').hide();
            $('.js-weixin').hide();
            $('.code').hide();
        }else{
            //微信页面支付获取配置信息
        //    $.ajax({
        //        data: {
        //            url: window.location.href,
        //            r: Math.random()
        //        },
        //        dataType: "jsonp",
        //        url: "http://api.mamhao.com/mamahao-app-api/pay/weixin/config.htm",  //这个地址需要动态配置
        //        success: function(data) {
        //            wx.config({
        //                debug: false,
        //                appId: data.appId,
        //                timestamp: data.time,
        //                nonceStr: data.none,
        //                signature: data.sign,
        //                jsApiList: ['checkJsApi', 'onMenuShareTimeline', 'onMenuShareAppMessage', 'onMenuShareQQ', 'onMenuShareWeibo', 'hideMenuItems', 'showMenuItems', 'hideAllNonBaseMenuItem', 'getLocation', 'getNetworkType','chooseWXPay']
        //            });
        //            wx.ready(function() {
        //
        //            });
        //        }
        //    });
        }
    })(wx);

    var checkPay = function(data, fn){
        M.ajax({
            url: '/api/checkPay',
            data: data,
            success: function (res) {
                if (res.error_code && res.error_code == 5000) {
                    M.dialog({
                        body: "订单已经支付,请勿重复发起支付",
                        buttons: [{
                            "text": "确定", "class": "success", "onClick": function () {
                                location.href = '/center#/orders'
                            }
                        }]
                    });
                } else {
                    fn();
                }
            }
        });
    };
    //支付宝支付
    $('.js-alipay').on('click',function () {
        var $this = $(this);
        var params = {batchNo: $this.data('no'), resource: 2};
        // 调用通用支付方法;
        checkPay({orderNo: $this.data('no')},function(){
            M.pay.alipay({
                data: params
            });
        });

        /*M.ajax({
            url: '/api/aliPay',
            data: {'batchNo': $this.data('no'),'resource':2},
            success:function (res) {
                var $form = $(res.data);
                //console.log($form);
                //var params = $form.serialize();
                var queryParam = '';
                $form.find("input").each(function(){
                   // console.log($(this));
                    var name = $(this).attr("name");
                    var value = $(this).attr("value");
                    console.log(name+"  "+ value);
                    queryParam += name + '=' + encodeURIComponent(value) + '&';
                });
                var gotoUrl = $form.attr('action') + queryParam;
                require.async('3rd/ap.js',function () {
                    _AP.pay(gotoUrl);
                });
            },
            error:function () {

            }
        })*/
    });
    
    //微信支付
    $('.js-weixin').on('click',function () {
        var $this = $(this);
        var params = {orderNo: $this.data('no'), openId: $this.data('openid')};
        // 调用通用支付方法;
        checkPay({orderNo: $this.data('no')},function(){
            M.pay.weixin({
                data: params,
                callback: '/pay/result?orderPayType=2&batchNo=' + $this.data('no')
            });
        });
        /*M.ajax({
            url: '/api/wxPay',
            data: {'orderNo': $this.data('no'),'openId':$this.data('openid')},
            success:function (res) {
                console.log(WeixinJSBridge);
               //调起微信支付控件
                if (typeof(WeixinJSBridge) == "undefined"){
                    if( document.addEventListener ){
                        document.addEventListener('WeixinJSBridgeReady', function () {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId" : res.appId,     //公众号名称，由商户传入
                                    "timeStamp":res.timeStamp,         //时间戳，自1970年以来的秒数
                                    "nonceStr" : res.nonceStr, //随机串
                                    "package" :res.package,
                                    "signType" : "MD5",         //微信签名方式：
                                    "paySign" : res.paySign //微信签名
                                },
                                function(res){
                                    alert("1"+res.err_msg);
                                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                        alert('支付成功');
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.data('no')
                                    }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                }
                            );
                        }, false);
                    }else if (document.attachEvent){
                        document.attachEvent('WeixinJSBridgeReady', function () {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId" : res.appId,     //公众号名称，由商户传入
                                    "timeStamp":res.timeStamp,         //时间戳，自1970年以来的秒数
                                    "nonceStr" : res.nonceStr, //随机串
                                    "package" :res.package,
                                    "signType" : "MD5",         //微信签名方式：
                                    "paySign" : res.paySign //微信签名
                                },
                                function(res){
                                    alert("2"+res.err_msg);
                                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                        alert('支付成功');
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.data('no')
                                    }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                }
                            );
                        });
                        document.attachEvent('onWeixinJSBridgeReady', function () {
                            WeixinJSBridge.invoke(
                                'getBrandWCPayRequest', {
                                    "appId" : res.appId,     //公众号名称，由商户传入
                                    "timeStamp":res.timeStamp,         //时间戳，自1970年以来的秒数
                                    "nonceStr" : res.nonceStr, //随机串
                                    "package" :res.package,
                                    "signType" : "MD5",         //微信签名方式：
                                    "paySign" : res.paySign //微信签名
                                },
                                function(res){
                                    alert("3"+res.err_msg);
                                    if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                        alert('支付成功');
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.data('no')
                                    }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                }
                            );
                        });
                    }
                }else{
                    WeixinJSBridge.invoke(
                        'getBrandWCPayRequest', {
                            "appId" : res.appId,     //公众号名称，由商户传入
                            "timeStamp":res.timeStamp,         //时间戳，自1970年以来的秒数
                            "nonceStr" : res.nonceStr, //随机串
                            "package" :res.package,
                            "signType" : "MD5",         //微信签名方式：
                            "paySign" : res.paySign //微信签名
                        },
                        function(res){
                            if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                alert('支付成功');
                                location.href='/pay/result?orderPayType=2&batchNo=' + $this.data('no')
                            }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                        }
                    );
                }

            }
        })*/
    });
    //点击二维码支付，调用后台接口请求接口，生成支付二维码
    $('.js-codepay').on('click',function () {
        var $this = $(this), code = $('.code');
        if(code.data("show")) return; // 已经显示，不再处理;
        code.show().data("show", true);
        checkPay({orderNo: $this.data('no')},function(){
            var orderNo = $this.data('no');
            var openId = $this.data('openid');
            //TODO 二维码地址暂时写死，回头再改
            var img = new Image(), src = M.config.api +'pay/weixin/makeWeixinScanCode.htm?batchNo='+orderNo+'&openId='+openId+'&size=240';
            img.src = src;
            img.onload = function () {
                $('.code').find('.js-code-pay-img').html(img);
            };
            // 定时器去刷新订单状态，如果为支付成功，进行跳转;
            queryOrderState(orderNo);
            //$('.code').show().find('.js-code-pay-img img').attr('src', M.config.api +'pay/weixin/makeWeixinScanCode.htm?batchNo='+orderNo+'&openId='+openId+'&size=240');
        });
    });

    // 获取订单状态;
    function queryOrderState(orderNo) {
        M.ajax({
            url: '/api/queryOrderState',
            data: {batchNo: orderNo},
            success: function (res) {
                console.log(res);
            },
            error: function (error) {
                setTimeout(function(){
                    queryOrderState(orderNo);
                }, 100);
                console.log("error---->", error);
            }
        });
    };

});
