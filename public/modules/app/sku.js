//sku算法
define(function (require, exports, module) {

    var DELIMITER = 'b';   //分隔符

    var sku = {};

    //sku结果集
    var skuMap = {};

    sku.init = function (data) {
        if (!data) return;
        console.log(JSON.stringify(data))
        var skuKeys = $.map(data, function (val, key) {
            skuMap[key] = {
                count: val.count || 0,
                price: [val.price]
            };
            return key;
        });
        console.log(skuKeys, skuMap)

        $.each(skuKeys, function (i, v) {
            var combArr = sku.combineArr(v.split(DELIMITER));
            console.log(JSON.stringify(combArr))
        })

    };

    //数组排列组合算法
    sku.combineArr = function (arr) {
        console.log('arr', arr)
        var len = arr.length, result = [];
        combine();
        function combine(item, index) {
            item = item || '';
            index = index || 0;
            if (index == len)return;
            for (var i = index; i < len; i++) {
                var newItem = item ? [item, ':', arr[i]].join('') : [item, arr[i]].join('');
                result.push(newItem);
                combine(newItem, ++index);
            }
        }

        return result;
    };


    module.exports = sku;


});