/**
 * 购物车
 */
define(function(require, exports, module) {

    var Cart = {
        config:{
            api:{
                'selectedCart':'/api/cart/opt/selectedCart',
                'removeCartItem':'/api/cart/opt/removeCartItem',
                'cleanCart':'/api/cart/opt/cleanCart',
                'updateCartItemCount':'/api/cart/opt/updateCartItemCount',
                'changeSKU':'/api/cart/changeSKU',
                'getSKU':'/api/goods_sku',
                'getRecommendList':'/api/cart/getRecommendList'
            },
            elements:{
                'cartModule':'.cart-goods-module'
            }
        },
        init: function(obj) {
            var self = this, API = self.config.api;
            $.extend(self.config,obj);

            self.params = {
                cartId: localStorage.getItem(CONST.local_cartId),
                vip:+$('input[name="frVIP"]').val()
            };
            self.fn_renderFooter();
            self.bindEvents();
            localStorage.removeItem(CONST.local_cart_newGoods); // 清除购物车新商品标识;

            if($('.u-goods-list').length){
                // 分页
                $.pagination({
                    container: '.u-goods-list',
                    keys:{count:'pageSize'},
                    scrollBox: '.js-cart-content',
                    api: API['getRecommendList'],
                    fnSuccess: function (res, ele) {
                        var data = res.data;
                        if (!data.template) {
                            return ele.data('locked', true)
                        }
                        var $container = $(data.template);
                        ele.append($container);
                    }
                });
            }
        },
        // 处理ajax请求
        optAjaxReqHandler:function(api,params,callback){
            var self = this, API = self.config.api, eles = self.config.elements
                ,$cartModule = $(eles.cartModule);
            params.isEdit = $('.valid-list.edit').length;
            M.ajax({
                location: true,
                url: API[api],
                data: {data: JSON.stringify(params)},
                success: function(res) {
                    $cartModule.html(res.template);
                    self.fn_renderFooter();
                    if($('.valid-list').length == 0){
                        $('.random-list').show();
                    }
                    if(callback && typeof callback == "function"){
                        callback();
                    }
                }
            });
        },
        // 事件绑定
        bindEvents: function() {
            var self = this, hashParams = self.params,
                $container = $('.js-cart-content, #app'),
                $footer = $('#js-cart-footer, #js-cart-tools');
            var c = {
                editBtn: '.js-edit', // 顶部编辑
                saveBtn: '.js-save', // 顶部完成
                checkAll: '.js-select-all', // 底部全选/平台全选(目前只有妈妈好平台一个)
                checkbox: '.js-checkbox', // 购物车选择/取消选择商品 checkbox
                editCheckAll: '.js-edit-checkAll', // 编辑状态下全选/取消全选
                editDeleteBtn: '.js-edit-del.success', // 编辑状态下底部删除按钮
                deleteIcon: '.js-del', // 失效商品删除icon
                clearBtn: '.js-clear', // 清空失效商品按钮
                updateCountBtn: '.js-update', // 修改商品数量按钮
                editSKUBtn: '.sku-edit', // 修改SKU按钮
                addToCartBtn: '.js-add-cart' // 添加到购物车按钮
            };


            //点击遮罩或关闭按钮 用于sku弹窗的关闭
            $container.on('click', '.mask, .js-close', function(e) {
                $(this).closest('.u-fixed').removeClass('show');
            });

            // 编辑/取消编辑操作
            $container.off('click', c.editBtn).on('click', c.editBtn, function() {
                $(this).removeClass('edit js-edit').addClass('save js-save').html('完成');
                $('.random-list').hide(); // 隐藏推荐列表
                $('.valid-list').addClass('edit');
                $('.delete').show();
                $('.m-cart-footer .info').hide();

                $('.u-edit-checkbox, .js-edit-checkAll').prop('checked',false);
                $('.js-edit-checkAll').next().html('全选');
                $('.js-edit-del').removeClass('success').addClass('ban');
            });
            $container.off('click', c.saveBtn).on('click', c.saveBtn, function() {
                $(this).removeClass('save js-save').addClass('edit js-edit').html('编辑');
                $('.random-list').show(); // 显示推荐列表
                $('.valid-list').removeClass('edit');
                $('.delete').hide();
                $('.m-cart-footer .info').show();
            });

            // 全选/取消全选
            $footer.off('click', c.checkAll).on('click', c.checkAll, function(e) {
                if ($(this).closest('.edit').length) return;
                var selected = $(this).find('.u-checkbox:visible').is(':checked') ? 2 : 3,
                    data = $.extend(true, hashParams, {
                        isSelected: selected
                    });
                self.optAjaxReqHandler('selectedCart',data);
            });
            $container.off('click', c.checkAll).on('click', c.checkAll, function(e) {
                if ($(this).closest('.edit').length) return;
                var selected = $(this).find('.u-checkbox:visible').is(':checked') ? 2 : 3,
                    data = $.extend(true, hashParams, {
                        isSelected: selected
                    });
                self.optAjaxReqHandler('selectedCart',data);
            });
            // 编辑 全选
            $container.off('click', c.editCheckAll).on('click', c.editCheckAll, function(e) {
                if ($(this).is(':checked')) {
                    $('.u-edit-checkbox').prop('checked', true);
                    $('.js-edit-del').addClass('success').removeClass('ban');
                    $('.js-edit-checkAll').prop('checked', true).next().html('全选(已选' + $('.js-item .u-checkbox:visible:checked').length + ')');
                } else {
                    $('.u-edit-checkbox').prop('checked', false);
                    $('.js-edit-del').addClass('ban').removeClass('success');
                    $('.js-edit-checkAll').prop('checked', false).next().html('全选');
                }
            });
            // 选择/取消选择该商品
            $container.off('click', c.checkbox).on('click', c.checkbox, function(e) {
                e.stopPropagation();
                if ($(this).closest('.edit').length) {
                    // 编辑状态下选择商品
                    if ($('.u-edit-checkbox:checked').length) {
                        //- 有选中状态
                        $('.js-edit-del').addClass('success').removeClass('ban');
                        $('.js-edit-checkAll').next().html('全选(已选' + $('.js-item .u-checkbox:visible:checked').length + ')');
                        if ($('.u-checkbox:visible:checked').length == $('.u-checkbox:visible').length || $('.js-item .u-checkbox:visible').length == $('.js-item .u-checkbox:visible:checked').length) {
                            $('.js-edit-checkAll').prop('checked', true);
                        } else {
                            $('.js-edit-checkAll').prop('checked', false);
                        }
                    } else {
                        //- 全部没有选
                        $('.js-edit-del').addClass('ban').removeClass('success');
                        $('.js-edit-checkAll').next().html('全选');
                    }
                } else {
                    var $item = $(this).closest('.js-item'),
                        selected = $(this).find('.u-checkbox:visible').is(':checked') ? 0 : 1,
                        data = $.extend(true, hashParams, {
                            isSelected: selected,
                            compoentId: typeof($(this).closest('li').data('compoentId')) !== "undefined" ? $(this).closest('li').data('compoentId') : $item.data('compoentId')
                        });
                    self.optAjaxReqHandler('selectedCart',data);
                }
            });
            // 批量删除商品
            $container.off('click', c.editDeleteBtn).on('click', c.editDeleteBtn, function(e) {
                e.stopPropagation();
                var $item = $(this).closest('.item'),
                    jsonTermArr = [],
                    domArr = [];
                $('.u-edit-checkbox:checked').each(function(index, obj) {
                    var $dom = $(obj).closest('.js-item');
                    if ($dom.length) {
                        domArr.push($dom[0]);
                        jsonTermArr.push({
                            compoentType: $dom.data('compoentType'),
                            compoentId: $dom.data('compoentId')
                        });
                    }
                });
                var data = $.extend(true, hashParams, {
                        'jsonTerm': JSON.stringify(jsonTermArr)
                    }),
                    tips = '确定要将这' + jsonTermArr.length + '个宝贝删除?';
                confirm(tips, function() {
                    this.hide();

                    self.optAjaxReqHandler('removeCartItem',data,function(){
                        $('.u-edit-checkbox, .js-edit-checkAll').prop('checked',false);
                        $('.js-edit-checkAll').next().html('全选');
                        $('.js-edit-del').removeClass('success').addClass('ban');
                    });
                });
            });
            // 删除该商品
            $container.off('click', c.deleteIcon).on('click', c.deleteIcon, function(e) {
                e.stopPropagation();
                var $item = $(this).closest('.js-item'),
                    data = $.extend(true, hashParams, {
                        'jsonTerm': JSON.stringify([{
                            compoentType: $(this).closest('li').data('compoentType') || $item.data('compoentType'),
                            compoentId: typeof($(this).closest('li').data('compoentId')) !== "undefined" ? $(this).closest('li').data('compoentId') : $item.data('compoentId')
                        }])
                    }),
                    tips = $(this).data('tips');
                confirm(tips, function() {
                    this.hide();
                    self.optAjaxReqHandler('removeCartItem',data);
                });
            });
            // 清空购物车 removeType 1:整个购物车 2:清空失效商品 3:清空平台内的商品
            $container.off('click', c.clearBtn).on('click', c.clearBtn, function(e) {
                e.stopPropagation();
                var tips = $(this).data('tips'),
                    data = $.extend(true, hashParams, {
                        "removeType": 2
                    });
                confirm(tips, function() {
                    this.hide();
                    self.optAjaxReqHandler('cleanCart',data);
                });
            });
            // 修改商品数量
            $container.off('click', c.updateCountBtn).on('click', c.updateCountBtn, function(e) {
                e.stopPropagation();
                var $self = $(this),
                    $item = $(this).closest('.js-item'),
                    count = +$(this).data('count');
                if (count <= 0 || $(this).is('.disabled')) {
                    if ($(this).data('tips')) return alert($(this).data('tips'));
                    return;
                }

                var data = $.extend(true, hashParams, {
                    newCount: count,
                    compoentId: typeof($(this).closest('li').data('compoentId')) !== "undefined" ? $(this).closest('li').data('compoentId') : $item.data('compoentId'),

                });
                self.optAjaxReqHandler('updateCartItemCount',data);
            });
            // sku选择促销政策
            $container.off('click', '.sku-sales dd a').on('click', '.sku-sales dd a', function () {
                var $this = $(this);
                $this.addClass('active').siblings().removeClass('active');
            });
            // 选完sku，点击确定
            $container.off('click', '.js-sku-confirm').on('click', '.js-sku-confirm', function(e) {
                var $this = $(this),
                    $goods = $('.js-sku.current').closest('.goods'),
                    $item = $goods.closest('.item'),
                    $curItem = Cart.curItem;
                var local_cartId = localStorage.getItem(CONST.local_cartId); //本地购物车ID
                //获取当前选中的sku信息
                require.async('app/sku', function(sku) {
                    var skuInfo = sku.selected();
                    if (!skuInfo.itemId) {
                        var specTips = $.map($('.sku dl dt'), function(item) {
                            if (!$(item).closest('dl').find('.sku-key.active')[0]) {
                                return $(item).text();
                            }
                        })[0];
                        return M.tips('请选择' + specTips);
                    }

                    //显示已选sku信息
                    $goods.attr('data-item-id', skuInfo.itemId)
                        .attr('data-price', skuInfo.detail.price)
                        .attr('data-oprice', skuInfo.detail.oprice)
                        .find('.spec').addClass('selected').text('已选' + skuInfo.desc.join(','));

                    //关闭模态框
                    $this.closest('.u-sku').find('.js-close').trigger('click');
                    var params = {}
                    if ($('.valid-list.edit').length) {
                        params = {
                            cartId: local_cartId,
                            jsonTerm: JSON.stringify([{
                                "itemId": hashParams.itemId,
                                "compoentId": hashParams.compoentId,
                                "newItemId": skuInfo.itemId,
                                "pmtCode": $('.sku-sales')[0] ? +$('.sku-sales dd a.active').data('value') : 0
                            }])
                        };

                        self.optAjaxReqHandler('changeSKU',params);
                    } else {
                        params = {
                            cartId: local_cartId,
                            jsonTerm: JSON.stringify([{
                                "itemId": skuInfo.itemId,
                                "templateId": hashParams.templateId,
                                "count": +$('.u-sku .u-quantity .number').text(),
                                "pmtCode": $('.sku-sales')[0] ? +$('.sku-sales dd a.active').data('value') : 0
                            }]),
                            pmtType: 0
                        };
                        M.ajax({
                            location: true,
                            url: '/api/addToCart',
                            data: {
                                data: JSON.stringify(params)
                            },
                            success: function(res) {
                                if (res.success_code == 200) {
                                    localStorage.setItem(CONST.local_cartId, res.cartId); //更新本地购物车ID
                                    M.tips({
                                        body: '加入购物车成功',
                                        class: 'true'
                                    });
                                    $('.u-sku .js-close').trigger('click');
                                    //location.reload();
                                } else {
                                    return M.tips(res.msg);
                                }
                            }
                        });
                    }

                });
            });
            // 编辑状态修改sku
            $container.off('click', c.editSKUBtn).on('click', c.editSKUBtn, function() {
                var $item = $(this).closest('.item');
                Cart.curItem = $item;
                var templateId = $item.data('templateId'),
                    itemId = $item.data('itemId'),
                    compoentId = $item.data('compoentId');
                hashParams.templateId = templateId;
                hashParams.itemId = itemId;
                hashParams.compoentId = compoentId;
                //当前sku模态框，不需要再次初始化
                if (templateId === $('.js-sku-confirm').data('template-id')) {
                    $('.u-sku').addClass('show');
                    return false;
                }
                var params = {
                    inlet: 6,
                    templateId: templateId
                };
                M.ajax({
                    location: true,
                    url: '/api/goods_sku',
                    data: {
                        data: JSON.stringify(params)
                    },
                    success: function(res) {
                        $('.u-sku').find('.content').empty().append(res.template);;
                        require.async('app/sku', function(sku) {
                            sku.init($('.sku'));
                            $('.js-sku-confirm').data('template-id', templateId);
                            $('.quantity').remove();
                            $('.u-sku').addClass('show')
                        });
                    }
                });
            });

            // 跳转商品详情页
            $container.off('click', '.box').on('click', '.box', function() {
                var $item = $(this).closest('.item');
                if ($(this).closest('.edit').length) {
                    return;
                } else {
                    var link = '/goods/detail/?inlet=6&templateId=' + $item.data('templateId') + '&itemId=' + $item.data('itemId');
                    if(hashParams.vip) {
                        link += ('&vip=' +hashParams.vip);
                    }
                    location.href = link;
                }
            });

            // 推荐商品列表 点击购物车图标 弹出sku选择框
            $container.off('click', c.addToCartBtn).on('click', c.addToCartBtn, function() {
                var templateId = $(this).closest('li').data('templateId');
                hashParams.templateId = templateId;
                //当前sku模态框，不需要再次初始化
                if (templateId === $('.js-sku-confirm').data('template-id')) {
                    $('.u-sku').addClass('show');
                    return false;
                }
                var params = {
                    inlet: 6,
                    templateId: templateId
                };
                M.ajax({
                    location: true,
                    url: '/api/goods_sku',
                    data: {
                        data: JSON.stringify(params)
                    },
                    success: function(res) {
                        $('.u-sku').find('.content').empty().append(res.template).end().addClass('show');
                        require.async('app/sku', function(sku) {
                            sku.init($('.sku'));
                            $('.u-quantity .number').spinner(); //改变数量控制
                            $('.js-sku-confirm').data('template-id', templateId);
                        });
                    }
                });
            });
        },
        // 渲染底部合计工具条
        fn_renderFooter: function() {
            var self = this;

            if (!$('.cart-goods-module .valid-list').length) {
                $('.m-cart-footer').remove();
                $('.m-cart-tools').remove();
                self.config.refresh && self.config.refresh();
                return;
            }
            var infos = {
                allSelected: +$('input[name="allSelected"]').val(),
                totalPrice: +$('input[name="totalPrice"]').val(),
                disPrice: +$('input[name="disPrice"]').val(),
                goodsCount: +$('input[name="goodsCount"]').val(),
                hasMonthItem: +$('input[name="hasMonthItem"]').val(),
                frVIP: +$('input[name="frVIP"]').val(),
            };
            var footerHtmlArr = [];
            footerHtmlArr.push('<ul class="field">');
            if (infos.allSelected) {
                footerHtmlArr.push('<li class="li-1"><label class="js-select-all"><input class="u-checkbox" type="checkbox" checked="checked"><em>全选</em></label></li>');
            } else {
                footerHtmlArr.push('<li class="li-1"><label class="js-select-all"><input class="u-checkbox" type="checkbox"><em>全选</em></label></li>');
            }
            footerHtmlArr.push('<li class="li-2"><dl><dt>合计：<strong>￥ ' + infos.totalPrice + '</strong></dt><dd>为您节省 ￥ <span>' + infos.disPrice + '</span></dd></dl></li>');
            if (infos.goodsCount === 0) {
                footerHtmlArr.push('<li class="li-3"><a class="u-btn ban" href="javascript:;">结算<span>(' + infos.goodsCount + ')</span></a></li>');
            } else {
                if($('.vip :checked').length){
                    footerHtmlArr.push('<li class="li-3"><a class="u-btn success" href="' + '/settlement#/selection/vip=1' + '">结算<span>(' + infos.goodsCount + ')</span></a></li>');
                }else{
                    footerHtmlArr.push('<li class="li-3"><a class="u-btn success" href="' + '/settlement#/checkout/' + '">结算<span>(' + infos.goodsCount + ')</span></a></li>');
                }
            }
            footerHtmlArr.push('</ul>');
            $('.m-cart-footer .info').html(footerHtmlArr.join(''));
            self.config.refresh && self.config.refresh();
            return $('.m-cart-footer .info');
        }
    };

    //导出
    module.exports = Cart;
});