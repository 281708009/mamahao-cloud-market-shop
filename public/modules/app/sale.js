define(function (require, exports, module) {
    var page = {
        tools: {},
        config: {
            fixed: 1,                   // 定位到哪一页;
            pageSize: 35,               // 翻页象素值;
            is: {},                     // 判断;
            iScroll: {
                promise: false,         // 服务承诺滚动
                goods: false,           // 商品清单滚动
                cart: false             // 购物车滚动
            },
            page: {
                promise: false,         // 服务承诺滚动
                goods: false,           // 商品清单滚动
                cart: false             // 购物车滚动
            },
            goodEnd: false              // 清单加载完
        },
        info: {},
        init: function () {
            var self = this, c = self.config, o = self.info;

            o.sale = $(".m-sale-all");
            o.block = o.sale.find(".m-sale-block");
            o.one = $(".m-sale-one");               // 承诺和商品清单大块
            o.two = $(".m-sale-two");               // 购物车大块
            o.promise = $("#js-promise");           // 服务承诺;
            o.exp = $(".js-exp");                   // 服务承诺展开控制;
            o.goods = $(".js-goods");               // 商品清单;
            o.pageTip = $(".js-page-tip");          // 加载更多提示;
            o.goodsTools = $("#js-goods-tools");    // 商品清单底部固定的工具栏;
            o.goCart = $(".js-go-cart");            // 跳转至购物车;
            o.cart = $("#js-cart");                 // 购物车;
            o.cartContent = $("#js-cart-content");  // 购物车内容区;
            o.more = $("#js-more");                 // 导购菜单
            o.details = $("#m-sale-pop-details");   // 详情页预留;
            o.cover = $("#js-sale-cover");          // 封面;
            o.im = $(".js-open-im");                // 联系客服;
            o.gps = $(".js-user-gps");            // 定位地址;
            o.address = $(".m-select-address");     // 用户收货地址;



            c.win = $(window);
            c.width = c.win.width();
            c.height = c.win.height();
            c.vm = VM;
            c.fixed = c.vm.fixed || 1;
            c.goodType = c.vm.groupType;
            c.goodPage = 1; // 初始化页数
            self.size();


            // 初始化哪一块;
            self.go();
            self.bind();
            // 未登录状态没有倒计时;
            c.vm.fixed != -1 && self.welfareTime();
            // 分享信息;
            M.wx.shareData.url = "//" + location.host + "/sale/";
            //self.serviceCity();
        },
        // 大小适配;
        size: function () {
            var self = this, c = self.config, o = self.info;
            o.block.height(c.height);
        },
        go: function (fixed) {
            var self = this, c = self.config, o = self.info;
            // 清除相关状态;
            o.promise.off("touchend");
            c.iScroll.promise && c.iScroll.promise.destroy();
            o.goods.off("touchend");
            c.iScroll.goods && c.iScroll.goods.destroy();
            o.cart.off("touchend");
            c.iScroll.cart && c.iScroll.cart.destroy();
            o.sale.removeAttr("style");

            c.fixed = fixed || Number(c.fixed);
            switch(c.fixed){
                case 1:
                    o.one.addClass("IN");
                    self.promise.init();  //初始化服务承诺;
                    break;
                case 2:
                    o.one.addClass("IN");
                    self.goods.init();  //初始化商品清单;
                    break;
                case 3:
                    self.cart.init();  //初始化购物车;
                    break;
            }
            $.hash.set("fixed", c.fixed);
        },
        // 初始化服务承诺
        promise: {
            init: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                o.one.removeClass("flex-column page-2").find(".i-scroll").removeAttr("style");
                sale.size(); // 大小调整;
                c.iScroll.promise = new IScroll('#js-promise', {
                    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ },
                    probeType: 2
                });
                sale.bind(); // 事件绑定;

                // 是否显示底部图
                var footer = o.promise.find(".footer");
                //console.log(footer.height() + footer.offset().top , c.height);
                if(localStorage.getItem(CONST.local_sale_promise) && footer.length){
                    footer.remove();
                    c.iScroll.promise.refresh();
                }else if(footer.length && (footer.height() + footer.offset().top - 20) > c.height){
                    footer.remove();
                    c.iScroll.promise.refresh();
                    localStorage.setItem(CONST.local_sale_promise, "true")
                }else{
                    localStorage.setItem(CONST.local_sale_promise, "true")
                }
            },
            size: function () {
                var sale = this, self = page, o = self.info, c = self.config,
                    height = c.height - o.one.find('.header').height();
                o.promise.height(height).find(".promise-content").css({"min-height": height + 2});
            },
            bind: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                // 滚动中内容处理;
                c.iScroll.promise.on("scroll", function () {
                    var xy = this.scrollerHeight - this.wrapperHeight + this.y;
                    // 是否达到翻页值;
                    xy <= -c.pageSize ? (c.page.promise = true) : (c.page.promise = false);
                    //console.log(this.y);
                });
                // 是否翻页服务承诺至商品清单;
                o.promise.on("touchend", function () {
                    if(c.page.promise){
                        self.go(2);
                        //self.goods.init();
                    }
                });
            }
        },
        // 初始化商品清单
        goods: {
            init: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                if(!c.page.cart && c.page.promise){
                    // 非购物车返回并且是从第一区块跳至此区块时才设置此样式;
                    o.promise.removeAttr("style").css({"transition": ".2s", "-webkit-transition": ".2s", "opacity": 0});
                }else if(!c.page.promise){
                    o.one.addClass("flex-column");
                }
                // 清除状态
                c.page.promise = false;

                o.one.addClass("page-2");
                sale.size();
                c.iScroll.goods = new IScroll('#js-goods', {
                    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ },
                    probeType: 2
                });
                sale.bind(); // 事件绑定;
                sale.total();
            },
            size: function () {
                var sale = this, self = page, o = self.info, c = self.config,
                    height = c.height - o.one.find('.header').height() - 110;
                o.goods.css({"min-height": height + 2});
            },
            bind: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                // 滚动中内容处理;
                c.iScroll.goods.on("scroll", function () {
                    // 是否达到翻页值;
                    var xy = this.scrollerHeight - this.wrapperHeight + this.y;
                    if(c.goodEnd){
                        xy <= -c.pageSize ? (c.page.goods = true) : (c.page.goods = false);
                    }else{
                        xy <= -c.pageSize ? (o.pageTip.find("em").html("松开加载更多")) : (o.pageTip.find("em").html("下拉加载更多"));
                    }
                    // 隐藏当前删除提示;
                    $(".js-goods-item").hasClass("del") && $(".js-goods-item").removeClass("del");
                    console.log(c.page.goods);
                });
                c.iScroll.goods.on("scrollEnd", function () {
                    var xy = this.scrollerHeight - this.wrapperHeight + this.y;
                    if(xy <= 50){
                        sale.page();
                    }
                });
                o.goods.on("touchend", function () {
                    if(c.page.goods){
                        self.go(3);
                        //self.cart.init();
                    }
                });

            },
            // 合计
            total: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                M.ajax({
                    showLoading: false,
                    url: "/api/sale/goods_total/",
                    success: function (res) {
                        o.goodsTools.find(".li-1 del").html("￥" + res.price);
                        o.goodsTools.find(".li-1 strong").html("￥" + res.pmtPrice);
                        res.desc && o.goodsTools.find(".js-tip").html('<div class="tip"><p>' + res.desc + '</p></div>');
                        // 促销政策
                        if(res.popUps){
                            var pop = $(".m-monthly-pop"), Ups = res.popUps, i = 0, l = Ups.length, arr = [];
                            arr.push('<h2>'+ res.title +'</h2><ul class="list">');
                            for(; i < l; i++){
                                arr.push('<li><div class="icon"><img src="'+ Ups[i].icon +'" alt="'+ Ups[i].title +'"></div><dl><dt>'+ Ups[i].title +'</dt><dd>'+ Ups[i].content +'</dd></dl></li>');
                            };
                            arr.push('</ul><button class="u-btn success max js-close">关闭</button>');
                            pop.find(".content").html(arr.join(''));
                        }
                        // 购物车数量
                        if(res.count > 0){
                            o.goCart.html('<i>'+ res.count +'</i>');
                        }
                    }
                });
            },
            // 查看商品详情;
            details: function (id) {

            },
            // 加载更多
            page: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                if(c.isAjax) return;
                var el = $("#js-group-list-" + c.goodType), json = el.data("json");
                if(c.goodPage < json.pageCount){
                    // 查看下一页;
                    c.goodPage++;
                    c.isNewGroup = false;
                }else if(json.nextGroupType && json.nextGroupType != -1){
                    // 切换类型;
                    c.goodType = json.nextGroupType;
                    c.goodPage = 1;
                    c.isNewGroup = true;
                }else{
                    // 无更多商品;
                    o.pageTip.find("em").html("上拉查看购物车");
                    c.goodEnd = true;
                    return;
                }
                var params = {
                    groupType: c.goodType,
                    page: c.goodPage
                };
                console.log(params);
                M.ajax({
                    url: "/api/sale/group_page/",
                    data: {data: JSON.stringify(params)},
                    success: function (res) {
                        var template = sale.isUnread(res.template);
                        if(c.isNewGroup){
                            var arr = [], data = res.data;
                            arr.push('<div class="items" id="js-group-list-'+ data.groupType +'" data-json='+ JSON.stringify(data.pageConfig) +'>');
                            arr.push('<div class="title"><strong><span>'+ data.groupName +'</span></strong></div>');
                            arr.push('<ul class="items-content"></ul>');
                            arr.push('</div>');
                            el.after(arr.join(''));
                            $("#js-group-list-" + data.groupType).find(".items-content").html(template);
                        }else{
                            el.find(".items-content").append(template);
                        }
                        c.iScroll.goods.refresh(); // 刷新滚动;
                        //sale.longPress();
                        //console.log(res);
                    }
                });
            },
            // 屏蔽内容;
            shield: function (el, type) {
                var sale = this, self = page, o = self.info, c = self.config;
                var item = el.parents(".js-goods-item"), id = item.data("id");
                var params = {
                    monspGoodsId: id,
                    neverShow: type
                };
                M.ajax({
                    url: "/api/sale/goods_shield/",
                    data: {data: JSON.stringify(params)},
                    success: function () {
                        item.remove();
                        c.iScroll.goods.refresh(); // 刷新滚动;
                    }
                });
            },
            // 是否未读
            isUnread: function (data) {
                var template = data ? $(data) : $(".js-goods-item"), haveRead = JSON.parse(localStorage.getItem(CONST.local_sale_haveRead));
                template.each(function () {
                    var thas = $(this), id = thas.data("id");
                    if(!haveRead || haveRead.getIndex(id) == -1) thas.addClass("new");
                });
                if(data){
                    return template;
                }
            },
            // 设置为已读
            haveRead: function (id) {
                if(!id) return;
                var haveRead = JSON.parse(localStorage.getItem(CONST.local_sale_haveRead)) || [];
                haveRead.unshift(id);
                localStorage.setItem(CONST.local_sale_haveRead, JSON.stringify(haveRead));
            }
        },
        // 初始化购物车
        cart: {
            init: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                !M.url.query("fixed") && o.sale.addClass("trans");
                c.page.goods = false;
                o.sale.css({
                    "-webkit-transform":        "translate3d(0, -"+ c.height +"px, 0)",
                    "transform":                "translate3d(0, -"+ c.height +"px, 0)"
                });
                sale.size();
                c.iScroll.cart = new IScroll('#js-cart', {
                    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|A)$/ },
                    probeType: 2
                });
                sale.bind(); // 事件绑定;
                sale.get(); // 加载购物车;
            },
            size: function (size) {
                var sale = this, self = page, o = self.info, c = self.config,
                    height = c.height - (size || 0);
                o.cartContent.css({"min-height": height + 2});
            },
            bind: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                // 滚动中内容处理;
                c.iScroll.cart.on("scroll", function () {
                    var y = this.y;
                    // 是否达到翻页值;
                    y >= c.pageSize ? (c.page.cart = true) : (c.page.cart = false);
                    //console.log(c.page.cart);
                });
                // 滚动结束之后处理相关内容;
                o.cart.on("touchend", function () {
                    if(c.page.cart){
                        o.cart.off("touchend");
                        o.sale.addClass("trans").css({
                            "-webkit-transform":        "translate3d(0, 0, 0)",
                            "transform":                "translate3d(0, 0, 0)"
                        });
                        // 如果商品清单那边没有销毁滚动，就不需要再初始化;
                        self.go(2);
                        //self.goods.init();
                    }
                });
                // 滚动结束之后处理相关内容;
                c.iScroll.cart.on("scrollEnd", function () {
                    if(c.page.cart){
                        this.destroy(); // 销毁商品清单滚动-可以选择不销毁，这样从购物车回来的时候还是定位到之前的位置;
                    }
                });
            },
            get: function () {
                var sale = this, self = page, o = self.info, c = self.config;
                var tools = $("#js-cart-tools");
                tools.find(".info").show();
                tools.find(".delete").hide();
                M.ajax({
                    url: "/api/cart/",
                    data: {data: JSON.stringify({vip: 1})},
                    success: function (res) {
                        o.cartContent.html(res.template);
                        require.async('app/cart_home', function(cart) {
                            cart.init({
                                refresh: function () {
                                    if(tools.find(".m-cart-footer").length){
                                        tools.show();
                                        sale.size(50);
                                    }else{
                                        tools.hide();
                                        sale.size();
                                    }
                                    c.iScroll.cart.refresh();
                                }
                            });
                            c.iScroll.cart.refresh();
                        });
                    }
                });
            }
        },
        // 事件绑定;
        bind: function () {
            var self = this, c = self.config, o = self.info;
            // 如果有封面，初始化封面相关方法;
            if(o.cover.length){
                self.cover.init();
            }else{
                self.newborn();
            }
            // 服务承诺合并结束后内容处理;
            o.promise.transitionEnd(function () {
                o.one.addClass("flex-column");
                o.promise.removeAttr("style").find(".i-scroll").removeAttr("style");
                c.iScroll.goods.refresh(); // 刷新商品清单的位置;
                o.exp.removeClass("merge");
            });
            o.exp.on("touchstart", "a", function () {
                if(o.exp.hasClass("merge")){
                    o.exp.removeClass("merge");
                    c.page.promise = true;
                    self.go(2);
                }else{
                    o.exp.addClass('merge');
                    self.go(1);
                }
            });
            // 查看城市;
            o.promise.on("click", ".js-show-city", function () {
                self.serviceCity($(this).data("json"));
            });
            // 第二区块动画结束后内容处理;
            o.sale.transitionEnd(function () {
                o.one.find(".i-scroll").removeAttr("style"); // 可以选择不清除，这样从购物车回来的时候还是定位到之前的位置
                if(c.page.cart){
                    o.cart.find(".i-scroll").removeAttr("style");
                    c.page.cart = false;
                }
            });
            // 显示菜单;
            o.more.on("click", "dt a", function (e) {
                e.preventDefault();
                e.stopPropagation();
                if(!o.more.hasClass("show")){
                    o.more.addClass("show");
                    o.gps.hide();
                }
                // 初始化联系客服;
                if(!M.im.easemobim) M.im.init();
            });
            // 隐藏菜单;
            o.one.on("touchstart", function (e) {
                // 隐藏菜单
                var target = $(e.target);
                if(o.more.hasClass("show") && !target.parents(".menu").length){
                    o.more.removeClass("show");
                    o.gps.show();
                }
                // 头像用户中心跳转,安卓做兼容
                if(M.tools.isAndroid && target.parents(".js-avatar").length){
                    window.location.href = target.parents(".js-avatar").attr("href");
                }
            });
            // 跳转至购物车;
            o.goCart.on("click", function () {
                self.go(3);
            });
            // 联系客服
            o.im.on("click", function () {
                M.im.track({
                    desc: $("meta[itemprop=name]").attr("content") || "妈妈好·每月购",
                    price: "",
                    img_url: $("meta[itemprop=image]").attr("content") || "//img.mamhao.cn/s/common/images/icon-114.png",
                    item_url: "//" + location.host + "/sale/"
                });
            });
            // 长按事件;
            //self.goods.longPress();
            // 屏蔽内容
            o.goods.on("click", ".item-delete", function (e) {
                e.preventDefault();
                e.stopPropagation();
                $(this).parent().removeClass("del");
            });
            o.goods.on("click", ".js-hide", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.goods.shield($(this), 0);
            });
            o.goods.on("click", ".js-delete", function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.goods.shield($(this), 1);
            });
            // 查看促销
            o.goodsTools.on("click", ".js-tip", function () {
                $(".m-monthly-pop").addClass("show");
            });
            $(".m-monthly-pop").on("click", ".js-close", function () {
                $(".m-monthly-pop").removeClass("show");
            });
            // 查看详情
            self.goods.isUnread();
            o.goods.on("click", ".js-goods-item.new", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var thas = $(this), id = thas.data("id");
                self.goods.haveRead(id);
                thas.removeClass("new");
                window.location.href = thas.find("a").attr("href");
            });
            o.goods.on("click", ".js-goods-item .but-delete", function (e) {
                e.preventDefault();
                e.stopPropagation();
                var items = o.goods.find(".js-goods-item");
                var parent = $(this).parent();
                if(parent.hasClass("item")) return;
                items.removeClass("del");
                parent.addClass("del");
            });
            // 切换地址;
            o.gps.on("click", function () {
                self.address.show();
            });
            // window hash监听;
            $(window).on("hashchange", function () {
                var hash = $.hash.getAll();
                if(hash.fixed != c.fixed){
                    // 如果当前在1，点击返回跳到2去，得把c.page.promise设置成true，2那边会做一些动画操作;
                    if(c.fixed == 1){
                        c.page.promise = true;
                    }
                    self.go(hash.fixed);
                }
                //console.log(hash, c.fixed);
            });
            // 查看商品;
            /*o.goods.on("click", ".items-content li", function () {
                $.hash.set("styleNumId", 10);
                o.details.removeClass("hide").addClass('show');
                //.find("iframe").attr("src", "http://h5.mamahao.com/app/vipbuy/2016101001/");
            });*/

        },
        // 新生儿-首次登录提示
        newborn: function () {
            var self = this, c = self.config, o = self.info;
            if(!c.vm.popupWords) return;
            M.dialog({
                className: "m-sale-pop-newborn",
                title: "<em>"+ c.vm.nickName +"</em>",
                body: c.vm.popupWords + "<time>"+ (new Date(Number(c.vm.endTime)).format("yyyy-MM-dd")) +"</time>",
                buttons: [{"text": "我知道了", "class": "success", "onClick": function () {
                    this.hide();
                }}]
            });
        },
        // 服务城市
        serviceCity: function (data) {
            var self = this, c = self.config, o = self.info, i = 0, arr = [];
            for(; i < data.length; i++){
                arr.push('<dl><dt>'+ data[i].cityName +'：</dt><dd>'+ data[i].areas +'</dd></dl>');
            }
            M.dialog({
                className: "m-sale-pop-city",
                title: "<em>当前提供服务城市</em>",
                body: arr.join(''),
                buttons: [{"text": "我知道了", "class": "alone", "onClick": function () {
                    this.hide();
                }}]
            });
        },
        // 福利计时
        welfareTime: function () {
            var self = this, c = self.config, o = self.info;
            var welfare = $(".js-welfare-time");
            if(!welfare.length) return; // 无此元素，不执行倒计时相关操作;
            var current = welfare.data("current"), end = welfare.data("end"), d = M.date.diff(current, end);
            // 结束时间小于等于当前时间;
            if(Number(end) <= Number(current)){
                return welfare.parent().remove();
            }
            if(d < 3){
                d && welfare.find("em").html(d + "天"); // 大于1天;
                welfare.find("time").html('<span class="hour"></span><span class="minute"></span><span class="second"></span>')
                .timeCountDown({
                    endDate: end,
                    startDate: current,
                    callback: function () {
                        M.reload();
                    }
                });
            }else if(d >= 3){
                welfare.html(d + "天");
            }
        },
        // 封面滑动
        cover: {
            config: {
                min: [0, 0],    // x,y的最小可移动值;
                max: [175, 0],  // x,y的最大可移动值;
                back: [100, 0], // x,y的最大返回值;
                newX: 0,    // 新的x轴位置;
                newY: 0,    // 新的y轴位置;
                opacity: 1 // 透明度;
            },
            info:　{},
            init: function () {
                var self = this, o = self.info, c = self.config;
                o.cover = page.info.cover;
                o.move = o.cover.find(".js-move");
                o.text = o.cover.find(".js-text");
                self.bind();
                self.time();
            },
            bind: function () {
                var self = this, o = self.info;
                $(window).on('touchmove', function(e){e.preventDefault();}, false);
                o.move.on("touchstart", function (e) {
                    self._start(e.originalEvent);
                });
                o.cover.transitionEnd(function () {
                    o.cover.remove();
                }, true);
                o.cover.on("click", function (e) {
                    o.move.css({
                        "transition": ".2s",
                        "-webkit-transition": ".2s"
                    });
                    o.cover.css({
                        "transition": ".4s",
                        "-webkit-transition": ".4s"
                    });
                    self.enter();
                });
                // 点击logo，弹出提示信息;
                o.cover.on("click", ".logo", function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    M.dialog({
                        className: "m-sale-pop-logo",
                        title: '<img src="//img.mamhao.cn/s/m/images/bg-sale-logo-pop.jpg">',
                        isMask: true,
                        body: '妈妈好·每月购是好孩子集团旗下会员服务品牌，专注为集团内部会员和妈妈好粉丝用户提供个性化、专业化、高品质、相互信赖的管家式服务。<div><img src="http://img.mamhao.cn/s/m/images/bg-sale-logo-pop-2.png"></div>',
                        buttons: [{"text": "取消"}]
                    });
                });
            },
            _start: function (e) {
                var self = this, o = self.info, c = self.config;
                var point = e.touches ? e.touches[0] : e;
                e.preventDefault();
                e.stopPropagation();

                c.initiated = true;
                c.moved = false;
                c.lastPointX	= point.pageX;
                c.lastPointY	= point.pageY;
                o.move.removeAttr("style");
                o.cover.on("touchmove", function (e) {
                    self._move(e.originalEvent);
                });
                o.cover.on("touchend", function (e) {
                    self._end(e.originalEvent);
                });
            },
            _move: function (e) {
                var self = this, o = self.info, c = self.config;
                var point = e.touches ? e.touches[0] : e, deltaX, deltaY;
                e.preventDefault();
                e.stopPropagation();
                c.moved = true;
                deltaX = point.pageX - c.lastPointX;
                c.lastPointX = point.pageX;
                deltaY = point.pageY - c.lastPointY;
                c.lastPointY = point.pageY;

                c.newX = c.newX + deltaX;
                c.newY = c.newY + deltaY;
                if(c.newX < c.min[0]) c.newX = c.min[0];
                if(c.newX > c.max[0]) c.newX = c.max[0];
                //console.log(c.newX, c.newY);
                self.css();
            },
            _end: function (e) {
                var self = this, o = self.info, c = self.config;
                if (!c.initiated) { return; }
                c.initiated = false;
                e.preventDefault();
                e.stopPropagation();
                o.move.css({
                    "transition": ".2s",
                    "-webkit-transition": ".2s"
                });
                if(c.newX < c.back[0]){
                    c.newX = c.min[0];
                    self.css();
                }else{
                    self.enter();
                }
                o.cover.off("touchmove");
                o.cover.off("touchend");
            },
            enter: function () {
                var self = this, o = self.info, c = self.config;
                c.newX = c.max[0];
                self.css();
                $(window).off('touchmove');
                o.move.off("touchstart");
                o.cover.addClass("hide");
                if(page.config.fixed == -1){
                    //alert("去微信绑定页面");
                    var params = {
                        origin: location.origin + location.pathname + location.search
                    };
                    // 导购员的key;
                    if(M.url.query("k")) params.k = M.url.query("k");
                    window.location.href = "/account/bind/?" + $.param(params);
                }else{
                    page.newborn();
                }
            },
            css: function () {
                var self = this, o = self.info, c = self.config;
                o.move.css({
                    "-webkit-transform": "translate3d("+ c.newX +"px,0,0)",
                    "transform": "translate3d("+ c.newX +"px,0,0)"
                });
                o.text.css({
                    "opacity": c.opacity - c.newX / c.max[0]
                });
            },
            time: function () {
                var self = this, c = self.config, o = self.info, time = o.cover.find(".time");
                if(!time.length) return;
                var current = time.data("current"),
                    end = time.data("end"),
                    d = M.date.diff(current, end),
                    arr = ["距结束 "];
                if(Number(end) <= Number(current)) return; // 结束时间小于等于当前时间;
                if(d < 3){
                    d && arr.push(d + "天"); // 大于1天;
                    arr.push('<span class="hour"></span>:<span class="minute"></span>:<span class="second"></span>');
                    time.html(arr.join('')).timeCountDown({
                            endDate: end,
                            startDate: current,
                            callback: function () {
                                M.reload();
                            }
                        });
                }else{
                    arr.push(d + "天");
                    time.html(arr.join(''));
                }
            }
        },
        // 获取收货地址列表;
        address: {
            show: function () {
                var self = page, o = self.info, c = self.config;
                if(o.address.find(".list li").length){
                    o.address.addClass("show");
                }else{
                    // 获取信息;
                    this.get();
                    // 切换地址;
                    this.set();
                    // 关闭;
                    o.address.on("click", ".js-close,.js-select-gps", function () {
                        o.address.removeClass("show");
                    });
                    // 用定位地址;
                    o.address.on("click", ".js-gps-address", function () {
                        $.removeCookie(CONST.local_sale_areaId, {path: '/'});
                        M.reload();
                    });
                }
            },
            get: function () {
                var self = page, o = self.info, c = self.config;
                M.ajax({
                    url: '/api/myAddress',
                    success:function(res){
                        o.address.addClass("show").find(".list").html(res.template);
                        var location = $.cookie(CONST.local_sale_areaId);
                        if(location){
                            location = JSON.parse(location);
                            location.deliveryAddrId && $("#add-" + location.deliveryAddrId).attr("checked", "checked");
                        }
                        require.async('app/choose_pcd', function (pcd) {
                            c.PCD = new pcd({
                                trigger: $('.js-select-gps'),
                                //className: "bottom",
                                confirmed: function (data) {
                                    var location = JSON.stringify(data); // 区域id
                                    $.cookie(CONST.local_sale_areaId, location, { expires: 365, path: '/' });
                                    M.reload();
                                }
                            }).init();
                        });
                    },
                    error: function (res) {}
                });
            },
            set: function () {
                var self = page, o = self.info, c = self.config;
                o.address.on("change", ".u-checkbox", function () {
                    var thas = $(this).parents("li"), info = thas.data("json");
                    var location = JSON.stringify({ areaID: info.areaId, areaName: info.area, deliveryAddrId: info.deliveryAddrId}); // 区域id
                    $.cookie(CONST.local_sale_areaId, location, { expires: 365, path: '/' });
                    M.reload();
                });
            }
     }
    };
    page.init();
    window.Sale = page;
    module.exports = page;
});