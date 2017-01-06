/*
 * 选择省市区
 * by xqs
 * */
define(function (require, exports, module) {

    function PCD(options) {
        var defaults = {
            container: 'body',
            trigger: $('.js-district'), //触发弹窗显示的节点
            className: 'right',  //控件显示的样式className， right表示方向
            confirmed: function (res) {
                //选择完成，点击确认按钮
                console.info('[PCD info] ', JSON.stringify(res));
            }
        };

        this.options = $.extend({}, defaults, options);
    }

    /*初始化*/
    PCD.prototype.init = function () {
        var me = this;
        var $trigger = $(me.options.trigger),
            pcdInfo = {
                proID: $trigger.data('pro-id'),
                cityID: $trigger.data('city-id'),
                areaID: $trigger.data('area-id'),
                proName: $trigger.data('pro-name'),
                cityName: $trigger.data('city-name'),
                areaName: $trigger.data('area-name')
            };

        me.modal = $('.u-area');
        if (!me.modal[0]) {
            me.modal = $(me.setLayout());
            me.bindEvents();
        }

        me.selects = {
            pro: me.modal.find('#list-pro'),
            city: me.modal.find('#list-city'),
            area: me.modal.find('#list-area')
        };

        //打开
        $trigger.on('click', function () {
            me.open();
        });

        //首次进入时，如果已有省市区，则选中
        $.when(function () {
            var dtd = $.Deferred();
            //获取省份
            me.queryItem({
                type: 1,
                callback: function () {
                    var _id = pcdInfo.proID, proName = pcdInfo.proName;
                    if (_id || proName) {
                        var $option = $.grep(me.selects.pro.find('option'), function (v) {
                            return ($(v).val() == _id) || ($(v).text() === proName);
                        });
                        $($option[0]).attr('selected', true);

                        dtd.resolve($($option[0]).val());
                    } else {
                        dtd.reject();
                    }
                }
            });
            return dtd.promise();

        }()).then(function (id) {
            var dtd = $.Deferred();
            //获取市
            me.queryItem({
                type: 2,
                id: id,
                callback: function () {
                    var _id = pcdInfo.cityID, cityName = pcdInfo.cityName;
                    var $option = $.grep(me.selects.city.find('option'), function (v) {
                        return ($(v).val() == _id) || ($(v).text() === cityName);
                    });
                    $($option[0]).attr('selected', true);

                    dtd.resolve($($option[0]).val());
                }
            });
            return dtd.promise();

        }).then(function (id) {
            //获取区
            me.queryItem({
                type: 3,
                id: id,
                callback: function () {
                    var _id = pcdInfo.areaID, areaName = pcdInfo.areaName;
                    var $option = $.grep(me.selects.area.find('option'), function (v) {
                        return ($(v).val() == _id) || ($(v).text() === areaName);
                    });
                    $($option[0]).attr('selected', true);
                }
            });
        });

        return me;
    };

    /*查询省市区*/
    PCD.prototype.queryItem = function (params) {
        var me = this;
        var $target,
            dom = [];
        var $PCD = me.selects;
        console.log(params);
        switch (params.type) {
            case 1:
                dom.push('<option value="-1">请选择省份</option>');
                $target = $PCD.pro;
                $PCD.city.attr("disabled", true).addClass("ban");
                $PCD.area.attr("disabled", true).addClass("ban");
                $PCD.city.empty().append('<option value="-1">请选择城市</option>');
                $PCD.area.empty().append('<option value="-1">请选择区域</option>');
                break;
            case 2:
                dom.push('<option value="-1">请选择城市</option>');
                $target = $PCD.city;
                $PCD.city.attr("disabled", true).addClass("ban");
                $PCD.area.attr("disabled", true).addClass("ban");
                $PCD.area.empty().append('<option value="-1">请选择区域</option>');
                break;
            case 3:
                dom.push('<option value="-1">请选择区域</option>');
                $target = $PCD.area;
                $PCD.area.attr("disabled", true).addClass("ban");
                break;
        }

        $target.empty().append(dom);
        if (!/-1/.test(params.id)) {
            M.ajax({
                showLoading: false,
                url: '/api/address/queryArea',
                data: {data: JSON.stringify(params || {})},
                success: function (res) {
                    //console.log('success--->', res);
                    var list = res.data;
                    $.each(list, function (i, v) {
                        dom.push('<option value="' + v.id + '">' + v.name + '</option>');
                    });
                    $target.empty().append(dom);
                    $target.removeAttr("disabled").removeClass("ban");
                    params.callback && params.callback();
                }
            });
        }
    };

    //显示
    PCD.prototype.open = function () {
        var me = this;
        me.modal.addClass('show');
    };
    //关闭
    PCD.prototype.close = function () {
        var me = this;
        me.modal.removeClass('show');
    };

    //设置布局
    PCD.prototype.setLayout = function () {
        var me = this;
        var arr = [
            '<section class="u-fixed u-area ' + me.options.className + '">',
            '<div class="mask"></div>',
            '<div class="content">',
            '<ul class="u-form gap fm-addr-pcd">',
            '<li><em>省 份</em><div class="field"><select id="list-pro"></select></div></li>',
            '<li><em>城 市</em><div class="field"><select id="list-city" disabled></select></div></li>',
            '<li><em>区 域</em><div class="field"><select id="list-area" disabled></select></div></li>',
            '</ul>',
            '<div class="u-submit"><button class="u-btn max success alone js-confirm">确定</button></div>',
            '</div></section>'
        ];
        return $(arr.join('')).appendTo(me.options.container);
    };


    //绑定事件
    PCD.prototype.bindEvents = function () {

        var me = this;
        var $module = me.modal;

        //关闭
        $module.on('click', '.mask', function () {
            me.close();
        });

        //选择select
        $module.on('change', '.fm-addr-pcd select', function () {
            var params = {
                id: $(this).val()
            };
            switch (this.id) {
                case 'list-pro':
                    params.type = 2;
                    me.queryItem(params);
                    break;
                case 'list-city':
                    params.type = 3;
                    me.queryItem(params);
                    break;
                case 'list-area':
                    break;
            }
        });

        //选完省市区后点击确定按钮
        $module.on('click', '.js-confirm', function () {
            var $PCD = me.selects;

            for (var i in $PCD) {
                var $item = $PCD[i];
                if (/-1/.test($item.val())) {
                    return M.tips($item.find('option:eq(0)').text());
                }
            }

            var pcdInfo = {
                proID: +$PCD.pro.val(),
                proName: $PCD.pro.find('option:selected').text(),
                cityID: +$PCD.city.val(),
                cityName: $PCD.city.find('option:selected').text(),
                areaID: +$PCD.area.val(),
                areaName: $PCD.area.find('option:selected').text()
            };

            $(me.options.trigger).data({"pro-id": pcdInfo.proID, "city-id": pcdInfo.cityID, "area-id": pcdInfo.areaID});

            me.options.confirmed.call(this, pcdInfo);
            me.close();
        });
    };

    module.exports = PCD;

});