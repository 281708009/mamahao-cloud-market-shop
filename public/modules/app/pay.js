define(function(require, exports, module) {

    var wx = require('weixin');

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


    //支付宝支付
    $('.js-alipay').on('click',function () {
        var $this = $(this);

        M.ajax({
            url: '/api/aliPay',
            data: {'batchNo': $this.parent().data('no'),'resource':2},
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
        })


    });
    
    //微信支付
    $('.js-weixin').on('click',function () {
        //console.log(wx);
        var $this = $(this);
        M.ajax({
            url: '/api/wxPay',
            data: {'orderNo': $this.parent().data('no'),'openId':$this.parent().data('openid')},
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
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.parent().data('no')
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
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.parent().data('no')
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
                                        location.href='/pay/result?orderPayType=2&batchNo=' + $this.parent().data('no')
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
                                location.href='/pay/result?orderPayType=2&batchNo=' + $this.parent().data('no')
                            }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                        }
                    );
                }

            }
        })
    });
    //点击二维码支付，调用后台接口请求接口，生成支付二维码
    $('.js-codepay').on('click',function () {
        $('.code').show();
        var $this = $(this);
        var orderNo = $this.parent().data('no');
        var openId = $this.parent().data('openid');
        /*$.ajax({
            url: 'http://localhost:8080/mamahao-app-api/pay/weixin/makeWeixinScanCode.htm',
            dataType:'jsonp',
            data: {'orderNo': $this.parent().data('no'), 'openId': $this.parent().data('openid'),'size':240},
            success: function (res) {
                console.log(res);
                $('.code').find('p > img').attr('src',res);
            }
        });*/
        //移除原有的图片
        $('.code').find('p > img').remove();
        //TODO 二维码地址暂时写死，回头再改
        $('.code').find('p.img').append('<img src="http://api.mamhao.com/mamahao-app-api/pay/weixin/makeWeixinScanCode.htm?batchNo='+orderNo+'&openId='+openId+'&size=240" style="width:200px;height:200px;"/>');
    });

});
