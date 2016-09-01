// 扫码付-获取订单信息;
define(function (require, exports, module) {
    var page = {
        tools: {
            // 获取url参数;
            search: function(v){var value = location.search.match(new RegExp("[\?\&]" + v + "=([^\&]*)(\&?)", "i"));return value ? decodeURIComponent(value[1]) : "";},
            param: function(search){
            var url = search, obj = {};
            if(url !== ""){
                url = url.substr(1);
                var arr = url.split("&"), i = 0, l = arr.length;
                for(; i < l; i++){
                    var a = arr[i].split("=");
                    obj[a[0]] = a[1];
                }
            }
            return obj;
        }
        },
        config: {
            params: M.url.query(),
            // ajax向node请求的url;
            api: {

            }
        },
        init: function () {
            var self = this, c = self.config;
            c.resource = 3; // 扫码付来源参数;
            VM && $.extend(c, VM);
            // 校验状态，提示对应信息;
            if(c.status == 2){
                M.tips("验证码已失效，请重试！");
            }else if(c.status == 3){
                M.tips("验证码错误，请重试！");
            }
            //console.log(c);

            page.bindEvents();
        },
        bindEvents: function () {
            var self = this, c = self.config;
            // 微信端进行受权;
            if(c.isWeChat){
                require.async('weixin', function (wx) {
                    //M.wx.share(wx);
                    // 隐藏可分享按钮;
                    M.wx.init(wx, {
                        ready: function () {
                            wx.hideOptionMenu();
                        }
                    });
                });
            }
            // 刷新页面;
            $(".js-code-reload").on("click", function () {
                window.location.reload();
            });
            //支付宝支付
            $('.js-alipay').on('click',function () {
                M.ajax({
                    url: '/api/aliPay',
                    data: {batchNo: c.orderNo, shopId: c.shopId, resource: c.resource},
                    success:function (res) {
                        var $form = $(res.data);
                        var queryParam = '';
                        $form.find("input").each(function(){
                            var name = $(this).attr("name");
                            var value = $(this).attr("value");
                            //console.log(name+"  "+ value);
                            queryParam += name + '=' + encodeURIComponent(value) + '&';
                        });
                        var gotoUrl = $form.attr('action') + queryParam;
                        require.async('3rd/ap.js',function () {
                            _AP.pay(gotoUrl);
                        });
                    }
                });
            });
            //微信支付
            $('.js-weixin').on('click',function () {
                //console.log(wx);
                M.ajax({
                    url: '/api/wxPay',
                    data: {orderNo: c.orderNo, openId: c.openId, shopId: c.shopId, resource: c.resource},
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
                                                location.href='/pay/codeSuccess.html';
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
                                                location.href='/pay/codeSuccess.html';
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
                                                location.href='/pay/codeSuccess.html';
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
                                        location.href='/pay/codeSuccess.html';
                                    }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。

                                }
                            );
                        }

                    }
                })
            });
            // 图文验证码;
            $(".js-submit").on("click", function () {
                var code = $(".js-code");
                if(c.isAjax) return;
                if(code.val() == ""){
                    return M.tips("请输入图文验证码!");
                }
                /*c.isAjax = true;
                var params = JSON.stringify({
                    k: self.tools.search("k"),
                    vcode: code.val()
                });
                console.log(params);
                M.ajax({
                    url: "/pay/codeAjax.html",
                    data: {data: params},
                    success:function(res){
                        alert(res.status);
                        console.log(res);
                    },
                    complete: function () {
                        c.isAjax = false;
                    }
                });*/

                // 页面跳转;
                var location = window.location;
                var param = self.tools.param(location.search);
                param.vcode = code.val();
                window.location.href = [location.origin, location.pathname, "?", $.param(param)].join("");
                //var location = window.location;
                //window.location.href = [location.origin, location.pathname, "?k=", c.k, "&vcode=", code.val()].join("");
            });
        }
    };
    page.init();
});