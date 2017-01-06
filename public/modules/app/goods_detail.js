/*
 * 商品详情
 * by xqs
 * */
define(function (require, exports, module) {
    var page = {
        config: {
            params: M.url.params(),
            hashParams: function () {
                return M.url.getParams((location.hash.match(/(\w+=)([^\&]*)/gi) || []).join('&'));  //json params
            },
            // ajax向node请求的url;
            api: {
                "extra": "/api/goods_detail_extra"
            }
        },
        init: function () {
            var self = this, c = self.config, params = c.params;
            c.$container = $(".spa");
            //懒加载，定时器不要删除
            setTimeout(function () {
                M.lazyLoad.init();
            }, 250);

            //加载swipe
            M.swipe.init(); //初始化Swipe
            // 购物车内是否有新商品;
            if (localStorage.getItem(CONST.local_cart_newGoods)) {
                $(".js-goods-cart").addClass("new");
            }

            // 因目前从H5活动页面去详情页较多，故暂时默认都显示;
            if (c.params.vip) {
                $(".m-goods-detail").prepend('<div class="history-back"><a href="//' + location.host + '/sale/">妈妈好 - 每月购</a><div');
            } else {
                $(".m-goods-detail").prepend('<div class="history-back"><a href="//' + location.host + '/">商城首页</a><div');
            }

            // 详情页微信定义分享
            require.async('weixin', function (wx) {
                M.wx.share(wx, {
                    title: $(".js-share-title").text(),
                    url: location.href,
                    image: $("#swipe-banner img:first").data("share"),
                    desc: $(".js-share-desc").text()
                });
            });

            page.bindEvents();

            M.ajax({
                showLoading: true,
                url: c.api.extra,
                data: params ? {data: JSON.stringify(params)} : {},
                success: function (res) {
                    //console.log('success--->', res);
                    var template = res.template;
                    c.$container.append(template);
                }
            });
        },
        bindEvents: function () {
            var c = page.config, hashParams = c.params;
            var $module = c.$container;

            /*质检报告，数据缓存到本地*/
            var templateId = hashParams.templateId,
                qualityPic = JSON.parse(localStorage.getItem(CONST.local_qualityPic)) || {};
            qualityPic[templateId] = $('.quality').data('pic');
            localStorage.setItem(CONST.local_qualityPic, JSON.stringify(qualityPic));

            //固定tab，此处有待优化
            var $tab = $('.u-tab'), $items = $('#swipe-detail .ui-swipe-item');
            var $detail = $('.m-goods-detail'), flexH = $detail.height() - $tab.height();
            $items.height(flexH);
            /*var $tab = $('.u-tab'), $items = $('#swipe-detail .ui-swipe-item'), offsetTop = $tab[0].offsetTop;
             $module.on('touchmove scroll', function () {
             var $this = $(this), flexH = $this.height() - $tab.height();
             $items.css("min-height", flexH);
             if (!$tab.hasClass('top')) offsetTop = $tab[0].offsetTop;
             if ($this.scrollTop() >= offsetTop) {
             $tab.addClass('top');
             } else {
             $tab.removeClass('top');
             }
             });*/

            //点击好妈妈说
            $module.on('click', '.guide .ellipsis', function () {
                $(this).toggleClass('collapse');
            });

            //呼出模态框
            $module.on('click', '.js-modal', function () {
                var modal = $($(this).data("target"));
                modal.addClass("show");
                if (modal.hasClass('m-select-address')) {
                    // 定位地址模态框，单独事件;
                    var location = JSON.parse(new M.Base64().decode($.cookie(CONST.local_cookie_location))) || {};
                    if (location.deliveryAddrId) {
                        $("#add-" + location.deliveryAddrId).attr("checked", "checked");
                    }
                    // 引用其他地址选择;
                    require.async('app/choose_pcd', function (pcd) {
                        c.PCD = new pcd({
                            trigger: $('.js-select-gps'),
                            //className: "bottom",
                            confirmed: function (data) {
                                var storageGPS = JSON.parse(new M.Base64().decode(localStorage.getItem(CONST.local_store_gps))) || {};
                                var info = {
                                    lat: storageGPS.lat, // 当前定位的lat
                                    lng: storageGPS.lng, // 当前定位的lng
                                    areaId: data.areaID,
                                    district: data.areaName,
                                    city: data.cityName,
                                    province: data.proName,
                                    formattedAddress: data.proName + data.cityName + data.areaName,
                                    timestamp: +new Date()
                                };
                                if (storageGPS.city != data.cityName) info.nolocal = true;
                                //console.log(info);
                                $.cookie(CONST.local_cookie_location, new M.Base64().encode(JSON.stringify(info)), {
                                    expires: 365,
                                    path: '/'
                                });
                                M.reload();
                            }
                        }).init();
                    });
                }
            });

            //点击优惠券或促销列表
            $module.on('click', '.js-nav-list', function () {
                var next = $(this).next(), pop = $("." + next.data("pop"));
                pop.addClass("show");
                if (!pop.find(".list").text()) {
                    pop.find(".list").html(next.html());
                }
            });

            //点击领券优惠券
            $module.on('click', '.js-voucher', function () {
                var $this = $(this), id = $this.closest('li').data('id');
                if ($this.hasClass('ban')) return false;
                M.ajax({
                    url: '/api/coupons_receive',
                    data: {tid: id},
                    success: function (res) {
                        if (res.success_code == 200) {
                            $this.addClass('ban').text('已领取');
                            M.tips({
                                class: 'true',
                                body: '领取成功'
                            });
                        } else {
                            return M.tips(res.msg);
                        }
                    },
                    error: function (res) {
                        var errorMsg = res.msg;
                        if (/^(-1)$/.test(res.error_code)) {
                            errorMsg = '您还未登录，请登录后再试！';
                        }
                        M.tips(errorMsg);
                    }
                });
            });


            // 切换定位地址
            $module.on('click', '.m-select-address .list li', function () {
                var $this = $(this), info = $this.data('json'),
                    storageGPS = JSON.parse(new M.Base64().decode(localStorage.getItem(CONST.local_store_gps))) || {};
                // 记录当前用户操作的时间;
                info.timestamp = +new Date();
                // 校验切换后的地址是否为当前城市内；
                if (storageGPS.city && storageGPS.city != info.city) {
                    info.nolocal = true;
                }
                $.cookie(CONST.local_cookie_location, new M.Base64().encode(JSON.stringify(info)), {
                    expires: 365,
                    path: '/'
                });
                M.reload();
            });

            $module.on('click', '.m-select-address .gps', function () {
                $.removeCookie(CONST.local_cookie_location, {path: '/'});
                M.reload();
            });


            //点击遮罩或关闭按钮
            $module.on('click', '.mask, .js-close, .js-select-gps', function () {
                $(this).closest('.u-fixed').removeClass('show');
            });

            //加入购物车、立即购买
            $module.on('click', '.js-addToCart, .js-buy', function () {
                if ($(this).hasClass('ban') || !$module.find('.sku').data('sku-map')) return false;
                var action = $(this).is('.js-buy') ? 'buy' : 'addToCart';
                require.async('app/sku', function (sku) {
                    sku.init($module.find('.sku'));
                    $module.find('.u-quantity .number').spinner();  //改变数量控制
                    $module.find('.js-sku-confirm').data('action', action);
                    $('.sku-sales')[hashParams.vip ? 'hide' : 'show']();
                    $module.find('.u-sku').addClass('show');
                });
            });

            //点击sku的促销选择
            $module.on('click', '.sku-sales dd a', function () {
                var $this = $(this);
                $this.addClass('active').siblings().removeClass('active');
            });

            //选完sku，点击确定
            $module.on('click', '.js-sku-confirm', function () {
                var action = $(this).data('action');
                switch (action) {
                    case 'buy':
                        page.buyNow();
                        break;
                    case 'addToCart':
                        page.addToCart();
                        break;
                }
            });

            // 点击查看评论大图;
            $module.on('click', '.js-comment-pic li img', function () {
                var thas = $(this), parents = thas.parents(".js-comment-pic");
                require.async('weixin', function (wx) {
                    wx.previewImage({
                        urls: parents.data("json"),
                        current: thas.data("pic")
                    });
                });
            });

            // 妈豆商品计时;
            var beanTime = $(".js-bean-time");
            if (beanTime.length) {
                var thas = beanTime, start = Number(thas.data("start")), end = Number(thas.data("end")), current = Number(thas.data("current"));
                console.log(start, end, current);
                if (start > current) {
                    // 未开始;
                    $(".js-buy").addClass("ban");
                    thas.timeCountDown({
                        startDate: current,
                        endDate: start,
                        callback: function () {
                            $(".js-buy").removeClass("ban");
                            thas.timeCountDown({
                                startDate: start,
                                endDate: end,
                                callback: function () {
                                    // 已结束
                                    $(".js-buy").addClass("ban");
                                    M.reload();
                                }
                            });
                        }
                    });
                } else if (start <= current && current <= end) {
                    // 进行中;
                    $(".js-buy").removeClass("ban");
                    thas.timeCountDown({
                        startDate: current,
                        endDate: end,
                        callback: function () {
                            // 已结束
                            $(".js-buy").addClass("ban");
                            M.reload();
                        }
                    });
                } else {
                    $(".js-buy").addClass("ban");
                    thas.html("已结束");
                }
            }


        },
        //添加商品到购物车
        addToCart: function () {
            var c = page.config, hashParams = c.params;
            //获取当前选中的sku信息
            require.async('app/sku', function (sku) {
                var skuInfo = sku.selected();

                if (!skuInfo.itemId) {
                    var specTips = $.map($('.sku dl dt'), function (item) {
                        if (!$(item).closest('dl').find('.sku-key.active')[0]) {
                            return $(item).text();
                        }
                    })[0];
                    return M.tips('请选择' + specTips);
                }

                var local_cartId = localStorage.getItem(CONST.local_cartId);   //本地购物车ID
                var params = {
                    cartId: local_cartId,
                    jsonTerm: JSON.stringify([{
                        "isBindShop": hashParams.shopId ? true : false,
                        "itemId": skuInfo.itemId,
                        "shopId": hashParams.shopId,
                        "templateId": hashParams.templateId,
                        "companyId": hashParams.companyId,
                        "count": +$('.u-sku .u-quantity .number').text(),
                        "pmtCode": c.params.vip ? 1 : ($('.sku-sales')[0] ? +$('.sku-sales dd a.active').data('value') : 0)
                    }]),
                    pmtType: 0
                };
                M.ajax({
                    location: true,
                    url: '/api/addToCart',
                    data: {data: JSON.stringify(params)},
                    success: function (res) {
                        if (res.success_code == 200) {
                            localStorage.setItem(CONST.local_cartId, res.cartId);  //更新本地购物车ID
                            M.tips({class: 'true', body: '加入购物车成功'});
                            $('.u-sku .js-close').trigger('click');
                            // 标记购物车图标加红点;
                            localStorage.setItem(CONST.local_cart_newGoods, 1);
                            $(".js-goods-cart").addClass("new");
                        } else {
                            return M.tips(res.msg);
                        }
                    }
                });
            });
        },
        //立即购买
        buyNow: function () {
            var c = page.config, hashParams = c.params;
            //获取当前选中的sku信息
            require.async('app/sku', function (sku) {
                var skuInfo = sku.selected();

                if (!skuInfo.itemId) {
                    var specTips = $.map($('.sku dl dt'), function (item) {
                        if (!$(item).closest('dl').find('.sku-key.active')[0]) {
                            return $(item).text();
                        }
                    })[0];
                    return M.tips('请选择' + specTips);
                }

                var pmtCode = c.params.vip ? 1 : (!$('.sku-sales')[0] ? ($('.monthly .nav-list')[0] ? 1 : 0) : +$('.sku-sales dd a.active').data('value'));
                var params = {
                    inlet: hashParams.inlet == 2 ? 4 : 2,  //1 购物车  2 商品详情 4 麻豆尊享
                    jsonTerm: JSON.stringify({
                        "itemId": skuInfo.itemId,
                        "templateId": hashParams.templateId,
                        "count": +$('.u-sku .u-quantity .number').text(),
                        "shopId": hashParams.shopId,
                        "companyId": hashParams.companyId,
                        "isBindShop": hashParams.shopId ? 1 : 0,
                        "pmtCode": pmtCode
                    })
                };

                var checkoutURL = '/settlement#/checkout/' + $.param(params);
                if (pmtCode === 1) {
                    params.vip = 1;
                    checkoutURL = '/settlement#/selection/' + $.param(params);
                }
                location.href = checkoutURL;

            });
        }
    };
    page.init();
});