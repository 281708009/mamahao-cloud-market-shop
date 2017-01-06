/**
 * 妈妈好 - 摇妈豆
 */
define(function(require, exports, module) {
    var A = {};
    A.extend = function(o){return o;}
    // 工具;
    A.userAgent = navigator.userAgent.toLowerCase();
    A.tools = {
        orientationSupport: !!window.DeviceOrientationEvent
    };
    var page = A.extend({
        config: {},
        info: {},
        start: function () {
            var self = this;
            require.async('imagesloaded', function (res) {
                self.init();
            });
        },
        init: function(){
            var self = this, o = self.info, c = self.config;
            try{
                APP.config.refresh = false;
                APP.open("refresh");
            }catch(e){console.log(e);}

            o.doc = $(document);
            o.doc.on('touchmove', function(e){e.preventDefault();}, false);
            o.loading = $(".js-loading");
            o.main = $(".A-main-all");
            o.block = o.main.children(".A-block");
            o.ratio = $(".ratio");
            o.mountain = $(".mountain");
            o.tree = $(".tree-block");
            o.girl = $(".girl");
            o.tip = $(".tip");
            o.myBeans = $("#my-beans");
            o.share = $(".js-share");





            //c.API = "http://120.26.78.249:8088/gd-app-api/V1/h5";
            //c.API = "http://192.168.1.236:8080/gd-app-api/V1/h5";
            c.gamepoint = 0;
            c.maxHeight = 1334;
            c.width = parseInt(o.doc.width());
            c.height = parseInt(o.doc.height());
            c.ratio = c.height / c.maxHeight;
            c.margintop = 0-(c.maxHeight-parseInt(c.height))/2;
            // msg;
            c.isError = false;
            c.error = {
                8001: {h1: "机会用完了", content: '<div>今天机会用完了哦，明天再来试试吧~每天还有2次机会邀请好友帮忙摇妈豆，获得更多妈豆哦~</div>', button: '<button onclick="page.open(\'share\');">邀请好友</button>'},
                8005: {h1: "机会用完了", content: '<div class="t2" style="text-align:center;">没有摇到哦。<br>你的好友已在用妈豆抵现，购物更省~</div>', button: '<button ontouchend="page.open(\'beans\');">我也要摇妈豆</button>'}
            };
            // audio;
            c.audio = new Audio();
            c.audio.src = "http://img.mamhao.cn/s/app/static/mp3/shake.mp3";
            c.audio.loop = false;
            c.audio.preload = "auto";
            c.audio.autoplay = false;
            c.audio.controls = false;
            // 用户基本信息;
            c.API = "http://"+ (M.tools.search("http") || "api.mamahao.com");
            c.user = {
                port: M.tools.isMamahao, // 是否为内部;
                id: M.tools.search("memberId") ||M.tools.search("r") // 为他人摇妈豆，他人的用户id;
            };
            // 为朋友摇妈豆;
            if(c.user.id && !c.user.port){
                c.user.friend = true;
            }
            // 自定义分享数据;
            var shareData = {
                callback: false,
                content: "速来围观！我刚摇下一大波金豆子，可以直接兑换成现金使用！",
                desc: "速来围观！我刚摇下一大波金豆子，可以直接兑换成现金使用！",
                image: "http://img.mamhao.cn/s/app/beans/images/share.jpg",
                title: "快来摇，你有1棵摇钱树",
                url: "http://m.mamahao.com/beans/?r=" + VM.id
            };

            // APP内部;
            if(M.tools.isMamahao){
                APP.config.refresh = "true";
                // 妈妈好APP内部，返回默认设置为刷新页面;
                SDK.tools.callpush.push({i: 5, f: "refresh"});
                // 自定义右侧菜单;
                APP.config.Bottom.data.unshift({type: 1, system: 1}, {type: 1, system: 2}, {type: 1, system: 4});
                // 定义音频文件地址;
                MMH.Audio({
                    src: c.audio.src
                });
                // 定义分享内容;
                $.extend(APP.config.Share.data, shareData);
            }else if(M.tools.isWeixin){
                // 微信定义分享
                require.async('weixin', function (wx) {
                    M.wx.share(wx, shareData);
                });
            }
            // 适配处理;
            self.size();
            self.load();
            // 中奖列表;
            c.height > 1000 && self.prize();
            // 事件绑定;
            self.bindEvents();
        },
        bindEvents: function () {
            var self = this, o = self.info, c = self.config;
            console.log("bindEvents");

            // 测试摇树;
            // o.tree.on("click", function(){
            //     self.getTree();
            // });
            // 说明提示;
            $(".js-explain").on("click", function () {
                self.showHelp();
            });
            o.share.on("click", function () {
                o.share.removeClass("show");
            });
            // 我的妈豆;
            $(".js-beans-record").on("click", function () {
               self.open("beansannal");
            });
            $(".js-login").on("click", function () {
                self.open("login");
            });
        },
        // 适配;
        size: function(){
            var self = this, o = self.info, c = self.config;
            //alert(c.margintop);
            var bottom = c.margintop > 0 ? 0 : c.margintop,
                top = parseInt(o.tree.css("margin-top")) - (bottom / 4);
            o.mountain.css({"bottom": bottom / 1.5});
            o.girl.css({"bottom": bottom / 1.5});
            o.tree.css("margin-top", top);
            o.tip.css({"bottom": 170 + bottom / 1.5});
            // 处理比例;
            var r = parseFloat(c.ratio).toFixed(2);
            o.ratio.css({'-webkit-transform': 'scale(' + r + ')', 'transform': 'scale(' + r + ')'});
        },
        // 加载页面IMG;
        load: function(){
            var self = this, o = self.info, c = self.config,
                allImg = $("img"), count = allImg.length, addCount = 0;
            allImg.each(function(){
                imagesLoaded($(this), function(){
                    addCount++;
                    var k = Math.floor((addCount/count)*100);
                    //o.loading.find(".load").html(k);
                    if(count == addCount && !c.isLoad){
                        self.loadend();
                    }
                });
            });
            // 备用加载完成方法;
            setTimeout(function(){
                if(!c.isLoad){
                    //o.loading.find(".load").html(100);
                    self.loadend();
                }
            }, 1000 * 10);
        },
        // 页面结束调用;
        loadend: function(){
            var self = this, o = self.info, c = self.config;
            if(c.isLoad) return;
            c.isLoad = true;
            c.gamevalue = 0; // 开启摇一摇;
            o.loading.hide();
        },
        // 摇一摇事件;
        shake: function(e){
            var self = page, o = self.info, c = self.config;
            var acceleration = e.accelerationIncludingGravity;
            //$(".debut").html(JSON.stringify(c.gamevalue));
            //$(".debut").html(c.gamevalue);
            if(c.gamevalue == -1 || c.gamevalue == undefined) return;
            if(Math.abs(c.gamepoint - acceleration.x) > 5) {
                c.gamepoint = acceleration.x;
                c.gamevalue++;
            }
            if(c.gamevalue > 5){
                c.gamevalue = -1;
                setTimeout(function(){
                    self.getTree();
                }, 500);
                // c.audio.play();
                if(M.tools.isMamahao){
                    // 内部播放摇一摇音乐;
                    APP.open("shake");
                }else{
                    // 外部调用播放;
                    c.audio.play();
                }
                return;
            }
        },
        // 校验;
        getTree: function () {
            var self = this, o = self.info, c = self.config;
            o.tree.removeClass("result").addClass("show");
            if(c.isError && !c.user.friend){
                // 如果已经没有机会可摇就直接提示相应信息，不执行接口调用;
                return self.error({code: c.isError});
            }
            new page.json({
                url: "/api/shakeBeans",
                data: {id: c.user.id, friend: c.user.friend},
                success: function (res) {
                    console.log(res);

                    if(res.noLogin){
                        // 清除摇树事件;
                        o.tree.removeClass("show");
                        return self.showPOP({
                            title: 'title-3',
                            h1: '请先登录',
                            icon: 'icon-2',
                            content: '<p>您还未登录哦~请先登录~</p>',
                            button: '<button onclick="page.open(\'login\');">点击登录</button>'
                        });
                    }else{
                        c.user.data = res.count;
                        setTimeout(function(){
                            self.endTree();
                        }, 1500);
                    }
                }
            });
        },
        // 内部和外部事件统一分别处理;
        open: function (type) {
            var self = this, o = self.info, c = self.config;
            switch(type){
                case "login":
                    M.tools.isMamahao ? APP.open('login'): location.href = "/account/bind/?origin=" + location.href;
                    break;
                case "home":
                    M.tools.isMamahao ? APP.open('home'): location.href = "http://" + location.host;
                    break;
                case "share":
                    M.tools.isMamahao ? APP.open('inbottom'): o.share.addClass("show");
                    break;
                case "beans":
                    location.href = "http://" + location.host + '/beans/';
                    break;
                case "beansannal":
                    M.tools.isMamahao ? APP.open('beansannal'): location.href = "/center/#/beans";
                    break;
            }
        },
        // 结束摇树，出结果;
        endTree: function(){
            var self = this, o = self.info, c = self.config, msg;
            // 清除摇树事件;
            o.tree.removeClass("show");
            if(c.user.data){
                // 摇中妈豆显示;
                msg = {
                    title: 'title-1',
                    h1: c.user.data + '妈豆',
                    icon: 'icon-1',
                    content: !c.user.friend ? '<div>妈豆已发放至您的个人账户，赶紧去购物吧~邀请好友一起帮忙摇妈豆，还有2次机会获得更多妈豆哦～</div>' : ('<p>成功帮好友摇到'+ c.user.data +'妈豆~</p>'),
                    button: !c.user.friend ? '<button ontouchend="page.open(\'home\');" class="js-shop">购物</button><button onclick="page.open(\'share\');" class="js-invite">邀请</button>' : '<button ontouchend="page.open(\'beans\');">我也要摇妈豆</button>'
                };
                o.tree.addClass("result");
                // 中奖后修改状态，再次摇直接出提示;
                c.isError = c.user.port && 8001;
                //c.isError = c.user.port ? 8001 : 8005;
                // 豆子掉完弹出提示;
                setTimeout(function(){
                    self.showPOP(msg);
                }, 1500);
            }else{
                // 没有摇到妈豆;
                msg = {
                    title: 'title-3',
                    h1: '没有摇到哦',
                    icon: 'icon-2',
                    content: '<p>力气还不够大哦~没有帮好友摇出妈豆~</p>',
                    button: '<button ontouchend="page.open(\'beans\');">我也要摇妈豆</button>'
                };
                self.showPOP(msg);
            }
        },
        // 显示弹层;
        showPOP: function(msg){
            var self = page, o = self.info, c = self.config, html = [];
            html.push('<div class="title"><s class="'+ msg.title +'"></s></div>');
            html.push('<div class="h1">'+ msg.h1 +'</div>');
            html.push('<div class="icon"><s class="'+ msg.icon +'"></s></div>');
            html.push('<div class="text">'+ msg.content +'</div>');
            html.push('<div class="button">'+ msg.button +'</div>');
            page.POP.show({
                template: html.join(''),
                closeback: function(){
                    self.resetTree();
                }
            });
        },
        resetTree: function(){
            var self = page, o = self.info, c = self.config;
            c.gamevalue = 0; // 开启摇一摇;
            o.tree.removeClass("result");
        },
        showHelp: function(){
            var self = page, o = self.info, c = self.config;
            self.showPOP({
                title: 'title-3',
                h1: '妈豆说明',
                icon: 'icon-1',
                content: '<div>妈豆是妈妈好平台金币，用户在妈妈好平台购物时可以使用妈豆抵扣一定金额</div>',
                button: '<button class="js-close">我知道啦</button>'
            });
        },
        error: function(msg){
            var self = page, o = self.info, c = self.config;
            var data = c.error[msg.code], val = {
                title: 'title-3',
                h1: msg.h1 || '出错啦~',
                icon: 'icon-2',
                content: '<p>'+ msg.msg +'</p>',
                button: c.user.port ? '<button class="js-close">我知道啦</button>' : '<button ontouchend="page.open(\'beans\');">我也要摇妈豆</button>'
            };
            if(data){
                $.extend(val, data);
            }
            // 如果已经没有机会可摇;
            if(!c.isError && (msg.code == 8001 || msg.code == 8005)){c.isError = msg.code;}
            setTimeout(function(){
                o.tree.removeClass("show");
                self.showPOP(val);
            }, 1500);
        },
        prize: function(){
            var self = page, o = self.info, c = self.config, list = o.tip.find("dd ul");
            var l = list.find("li").length, index = 0;
            list.show();
            if(l < 2) return;
            setInterval(function(){
                index++;
                if(index >= l) index = 0;
                var top = "translateY("+ (-30 * index) +"px)";
                list.css({"transform": top, "-webkit-transform": top});
            }, 2000);
        },
        // ios返回后禁止摇一摇
        stopShake: function(){
            var self = page, c = self.config;
            c.gamevalue = -1;
        }
    });

    // POP;
    page.POP = {
        info: {},
        init: function(){
            var self = this, o = self.info;
            o.elems = $(".pop-all");
            o.block = o.elems.find(".pop-block");
            o.content = o.elems.find(".pop-content");
            o.elems.on("touchstart", ".js-close", function(){
                self.hide();
            }).show();
        },
        show: function(op){
            var self = this, o = self.info;
            $.extend(o, op);
            if(!o.elems){
                self.init();
            }else{
                o.elems.show();
            }
            page.config.gamevalue = -1; // 关闭摇一摇事件;
            if(o.template) o.content.html(o.template);
            o.block.removeClass("hide").addClass("show");
            if(o.startback){o.startback.call(o.startback, self);}
        },
        hide: function(){
            var self = this, o = self.info;
            o.block.removeClass("show").addClass("hide");
            setTimeout(function(){
                o.elems.hide();
            }, 500);
            if(o.closeback){o.closeback.call(o.closeback, self);}
        }
    };

    // ajax json;
    page.json = function(a){
        M.ajax({
            url: $.isArray(a.url) ? [ a.url.join("/") ].join("/") : a.url,
            data: a.data,
            success: function(b){
                if(b.code != 200){
                    page.error(b);
                }else{
                    if($.isFunction(a.success)){
                        a.success.call(a.success, b);
                    }
                }
            },
            error:function(e, status){
                //page.error({code: 8005});
                page.error();
                console.log(e);
            },
            complete: function(XHR, status){
                if(status == "timeout"){
                    page.error({h1: "请求超时啦~", msg: "摇妈豆的人太多了，请稍后再试哦~"});
                }
            }
        });
    };

    // 横屏监听
    var updateOrientation = function(){
        if(window.orientation=='-90' || window.orientation=='90'){
            $(".orientation").show();
        }else{
            $(".orientation").hide();
        }
    };
    window.onorientationchange = updateOrientation;
    window.addEventListener('devicemotion', page.shake);
    page.start();
    window.page = page;
});