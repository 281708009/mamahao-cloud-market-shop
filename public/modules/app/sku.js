/*
 * sku算法
 * by xqs 16.08.11
 * */

define(function (require, exports, module) {

    'use strict';

    //按钮样式class
    var className = {
        sku: 'sku-key',
        active: 'active',
        disabled: 'ban'
    };

    //sku对象
    var sku = {
        delimiter: 'b'      //分隔符
    };

    //sku结果集
    var skuMap = {};


    //初始化，组合新的结果集
    sku.init = function (container) {

        console.time('skuInit time');

        sku.container = $(container);  //存储skuData的外容器

        var data = $(container).data('sku-map');
        if (!data || sku.container.data('initialized')) return;
        //console.log(JSON.stringify(data))

        //拿到已有skuMap中所有的sku组合key
        var skuKeys = $.map(data, function (val, key) {
            if (!val.count) val.count = 0;
            return key;
        });
        //console.log(skuKeys, skuMap)

        //转换成数组后，排列组合计算出所有的可能，存储在skuMap中
        $.each(skuKeys, function (i, v) {
            var keyArr = v.split(sku.delimiter).sort(function (a, b) {
                    return parseInt(a) - parseInt(b);
                }),
                combArr = sku.combineArr(keyArr);
            //console.log(JSON.stringify(combArr))

            var skuInfo = data[v];
            $.each(combArr, function (j, k) {
                if (skuMap[k]) {
                    skuMap[k].count += skuInfo.count;
                    skuMap[k].prices.push(skuInfo.price);
                    $.unique(skuMap[k].prices);  //数组去重
                } else {
                    skuMap[k] = {
                        count: skuInfo.count,
                        prices: [skuInfo.price]
                    }
                }
            });

            //已有的skuMap中的信息存储到skuMap中,替换原有的key
            skuMap[keyArr.join(sku.delimiter)] = $.extend(null, {
                count: skuInfo.count,
                prices: [skuInfo.price]
            }, skuInfo);

        });

        sku.container.data('initialized', true);

        //打印一下sku字典拼装花费的时间
        console.timeEnd('skuInit time');

        //console.info(JSON.stringify(skuMap));


        //点击sku选项
        var showPrice, skuDesc,
            defaultPrice = $('.sku-price').text(),
            showPic = $('.sku-pic').attr('src');

        //未选择之前，先检查一下状态
        sku.container.find('.' + className.sku).each(function () {
            //先初始化一下，看看是否所有的按钮都可选
            var $this = $(this);
            if (!skuMap[$this.data('value')]) {
                $this.addClass(className.disabled).removeClass(className.active);
            } else {
                $this.removeClass(className.disabled);
            }
        }).end().off('click').on('click', '.' + className.sku, function () {
            //添加click事件
            var $this = $(this);

            if ($this.hasClass(className.disabled)) return false;

            //选中自己，取消兄弟元素选中状态
            $this.toggleClass(className.active).siblings().removeClass(className.active);

            //已选择的sku按钮信息
            var skuSelected = sku.selected();
            if (skuSelected.keys.length) {
                var skuSelectedKey = skuSelected.keys.join(sku.delimiter);
                //console.info('skuKey==', skuSelectedKey);

                //显示价格区间及sku描述等信息
                var minPrice = Math.min.apply(null, skuMap[skuSelectedKey].prices),
                    maxPrice = Math.max.apply(null, skuMap[skuSelectedKey].prices);

                showPrice = minPrice === maxPrice ? ['￥', maxPrice].join('') : ['￥', minPrice, '-', maxPrice].join('');
                skuMap[skuSelectedKey].itemPic && (showPic = skuMap[skuSelectedKey].itemPic);
                skuDesc = $.map(skuSelected.desc, function (v, i) {
                    return '<span>' + v + '</span>';
                }).join('');

                //验证其他sku按钮
                var $skuOthers = $('.' + className.sku).not('.' + className.active).not($this);
                $.each($skuOthers, function () {
                    var $that = $(this), $sibSelected = $that.siblings('.' + className.active);
                    var othersArr = [];
                    if ($sibSelected[0]) {
                        //同级别的sku已有选择，则在新数组中取出
                        othersArr = $.grep(skuSelected.keys, function (v, i) {
                            return v != $sibSelected.data('value');
                        });
                    } else {
                        othersArr = skuSelected.keys.concat();
                    }
                    othersArr = othersArr.concat($that.data('value')).sort(function (a, b) {
                        return parseInt(a) - parseInt(b);
                    });

                    //console.info('othersArr==', othersArr.join(sku.delimiter));

                    if (!skuMap[othersArr.join(sku.delimiter)]) {
                        $that.addClass(className.disabled);
                    } else {
                        $that.removeClass(className.disabled);
                    }

                });

            } else {
                //设置默认价格
                showPrice = defaultPrice;
                $.each($('.' + className.sku), function () {
                    var $this = $(this);
                    if (!skuMap[$this.data('value')]) {
                        $this.addClass(className.disabled).removeClass(className.active);
                    } else {
                        $this.removeClass(className.disabled);
                    }
                })
            }

            //显示价格和图片等信息
            $('.sku-price').text(showPrice);
            $('.sku-pic').attr('src', showPic);
            $('.sku-desc').html(skuDesc);

        });

    };

    //数组排列组合算法
    sku.combineArr = function (arr) {
        //console.log('arr', arr)
        var len = arr.length, result = [];
        combine();
        function combine(item, index) {
            item = item || '';
            index = index || 0;
            if (index == len)return;
            for (var i = index; i < len; i++) {
                var newItem = (item ? [item, sku.delimiter, arr[i]] : [item, arr[i]]).join('');
                result.push(newItem);
                combine(newItem, ++index);
            }
        }

        return result;
    };


    //获取已选中的sku信息
    sku.selected = function () {
        var $skuSelected = $('.' + className.sku + '.' + className.active);
        var result = {
            keys: []
        };
        if ($skuSelected[0]) {
            result.keys = $.map($skuSelected, function (v, i) {
                return $(v).data('value');
            }).sort(function (a, b) {
                return parseInt(a) - parseInt(b);
            });

            result.desc = $.map($skuSelected, function (v, i) {
                return $(v).text();
            });

            if (skuMap[result.keys.join(sku.delimiter)].itemId) {
                result.itemId = skuMap[result.keys.join(sku.delimiter)].itemId;
            }

        }

        return result;
    };


    module.exports = sku;


});