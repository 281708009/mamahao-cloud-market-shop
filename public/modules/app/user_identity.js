/*
 * 首次登录选择身份
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
                "breed_add": "/api/breed_add",
                "breed_update": "/api/breed_update",
                "breed_delete": "/api/breed_delete",
                "update_profile_cache": "/api/update_profile_cache"
            }
        },
        init: function () {
            page.bindEvents();
        },
        bindEvents: function () {
            var c = page.config;
            var app = $("#app");

            //选择状态
            app.on('click', '.type li', function () {
                var $this = $(this), index = $this.index();
                if($this.hasClass('active')) return false;
                $this.addClass('active').siblings().removeClass('active');
                $this.find(':radio').prop('checked', true);
                $('.type li').data('picker', null);
                if(index===0){
                    //备孕
                    var modal = $('.picker-modal.modal-in');
                    modal && modal.trigger('close');
                    page.breedSave();
                }
            });

            //日期选择控件
            require.async('picker', function () {
                var defaults = {
                    container: app,
                    affix: true,
                    format: 'yyyy-MM-dd',   //最终要返回的日期字符串格式
                    level: 3,    //日期默认可选层级
                    atOnce: false,      //实时显示文本域中的值
                    toolbarCloseText: ''
                };
                var breedPickerParams = {
                    toolbarTitle: '请选择预产期',
                    ifClose: function (res) {
                        var today = +new Date(new Date().format('yyyy/MM/dd')),
                            selected = +new Date(res.value[0], res.value[1] - 1, res.value[2]);

                        var maxDate = today + 280 * 24 * 60 * 60 * 1000;   //280天
                        if (selected < today || selected > maxDate) {
                            M.tips('请选择合理的预产期');
                            return false;
                        }
                        return true;
                    },
                    onConfirm: function (res) {
                        page.breedSave(res);
                    }
                };

                var babyPickerParams = {
                    toolbarTitle: '请选择宝宝生日',
                    ifClose: function (res) {
                        var now = new Date(), today = +new Date(now.format('yyyy/MM/dd')),
                            selected = +new Date(res.value[0], res.value[1] - 1, res.value[2]);
                        var minDate = +new Date(now.getFullYear() - 14, now.getMonth(), now.getDay());
                        if (selected > today || selected < minDate) {
                            M.tips('请选择正确的宝宝生日');
                            return false;
                        }
                        return true;
                    },
                    onConfirm: function (res) {
                        page.breedSave(res);
                    }
                };

                //初始化
                $(".li-1").datetimePicker($.extend({}, defaults, breedPickerParams));
                $(".li-2,.li-3").datetimePicker($.extend({}, defaults, babyPickerParams));
            });

        },
        breedSave: function (data) {
            var c = page.config, hashParams = c.hashParams();
            var $checked = $('.u-checkbox:checked');
            var ajaxData = {
                status: $checked.data('status')
            };

            //-用户状态 ：0=未选择，1=怀孕，2=宝妈，3=备孕
            switch (ajaxData.status) {
                case 1:
                    ajaxData.duaDate = data.string;
                    break;
                case 2:
                    ajaxData.baby = {
                        "babyName": '',
                        "babyGender": $checked.data('gender'),
                        "babyBirthday": data.string
                    };
                    break;
                case 3:
                    break;
            }

            ajaxData = {json: JSON.stringify(ajaxData)};
            M.ajax({
                url: c.api.breed_add,
                data: {data: JSON.stringify(ajaxData)},
                success: function () {
                    var redirectURL = c.params.origin || '/center#/';
                    page.updateProfileCache(function () {
                        location.href = redirectURL;
                    });
                }
            });
        },
        //更新用户信息session
        updateProfileCache: function (callback) {
            var c = page.config, hashParams = c.hashParams();
            M.ajax({
                url: c.api.update_profile_cache,
                success: function () {
                    callback && callback();
                    console.info('update profile cache succeed!')
                }
            });
        }
    };

    page.init();

});