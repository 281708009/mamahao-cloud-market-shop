/*
 * 个人信息
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
                "profile_update": "/api/profile_update",
                "profile_geo_update": "/api/profile_geo_update",
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
            var app = $(".spa");

            if (/#\/profile$/gi.test(location.hash)) {

                /*选择省市区*/
                require.async('app/choose_pcd', function (fun) {
                    new fun({
                        container: app,
                        trigger: $('.js-district'),
                        confirmed: function (data) {
                            $('.js-district').val([data.proName, data.cityName, data.areaName].join('-'));
                            M.ajax({
                                url: c.api.profile_geo_update,
                                data: {data: JSON.stringify({areaId: data.areaID})},
                                success: function () {
                                    console.info('geo update success!');
                                    page.updateProfileCache();
                                }
                            })

                        }
                    }).init();
                });

                //更新昵称
                app.on('blur', '.js-nickname', function () {
                    var $this = $(this), his_val = $this.data('val'), curr_val = $this.val();
                    if (curr_val !== his_val) {
                        if (!curr_val) return M.tips('输入不能为空');
                        if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(curr_val)) {
                            return M.tips('只支持汉字，英文和数字');
                        }
                        M.ajax({
                            url: c.api.profile_update,
                            data: {data: JSON.stringify({nickname: curr_val})},
                            success: function () {
                                console.info('nickname update success!');
                                $this.data('val', curr_val);
                                page.updateProfileCache();
                            }
                        })
                    }
                });

                // 展示删除宝宝信息按钮
                $(".js-babies").touchwipe({
                    wipeLeft: function (el) {
                        $(".js-babies.delIn").removeClass("delIn").addClass("delOut");
                        el.removeClass("delOut").addClass("delIn");
                    },
                    wipeRight: function (el) {
                        el.hasClass("delIn") && el.removeClass("delIn").addClass("delOut");
                    }
                });
                // 外部删除宝宝信息;
                $(".js-babies").on("click", ".delete", function () {
                    var id = $(this).data("id"), data = {};
                    id && (data = {babyId: id});
                    M.ajax({
                        url: c.api.breed_delete,
                        data: {data: JSON.stringify(data)},
                        success: function () {
                            page.updateProfileCache(function () {
                                M.reload();
                            });
                        }
                    });
                    console.log();
                });

                return false;
            }

            //选择状态
            app.on('click', '.u-checkbox', function () {
                var section = $(this).data('section');
                $('.section').addClass('none');
                if (section) $(section).removeClass('none');
                $('.datetime-picker').data('picker', null);
                if (/^.(baby|prepare)$/.test(section)) {
                    var modal = $('.picker-modal.modal-in');
                    modal && modal.trigger('close');
                }
            });

            //选择性别
            app.on('change', '.babyGender', function () {
                var $this = $(this), _val = $this.val();
                $('.babyGenderShow').text($this.find('option:selected').text()).data('val', $this.val()).addClass('val');
            });

            //保存及删除
            app.on('click', '.js-submit', function () {
                page.breedSave();
            });
            app.on('click', '.js-delete', page.breedDelete);

            //日期选择控件
            require.async('picker', function () {
                var defaults = {
                    container: app,
                    format: 'yyyy-MM-dd',   //最终要返回的日期字符串格式
                    level: 3,    //日期默认可选层级
                    atOnce: false      //实时显示文本域中的值
                };
                var breedPickerParams = {
                    affix: true,
                    toolbarTitle: '请选择预产期',
                    toolbarCloseText: '',
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
                        page.breedSave({duaDate: res.string});
                    }
                };
                if($('.u-checkbox:checked').is('.datetime-picker-mother')){
                    breedPickerParams.appear = true;
                }

                var babyPickerParams = {
                    mask: true,
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
                        res.input.text(res.string).data('val', res.string).addClass('val');
                    }
                };

                //选择宝宝性别
                $('.babyGenderShow').picker({
                    mask: true,
                    atOnce: false,  //实时显示文本域中的值
                    toolbarTitle: '请选择宝宝性别',
                    cols: [{
                        values: ['王子', '公主']
                    }],
                    onConfirm: function (res) {
                        res.input.val(res.value.join('')).addClass('val');
                    }
                });
                $('.babyGenderShow,.babyBirthday').on("touchstart", function () {
                    $('.babyName').blur();
                });

                //初始化
                $(".datetime-picker-mother").datetimePicker($.extend({}, defaults, breedPickerParams));
                $(".datetime-picker-baby").datetimePicker($.extend({}, defaults, babyPickerParams));
            });

        },
        breedSave: function (data) {
            var c = page.config, hashParams = c.hashParams();
            var ajaxData = {
                status: $('.u-checkbox:checked').data('status')
            };

            //-用户状态 ：0=未选择，1=怀孕，2=宝妈，3=备孕
            switch (ajaxData.status) {
                case 1:
                    break;
                case 2:
                    ajaxData.baby = {
                        "babyName": $('.babyName').val(),
                        "babyBirthday": $('.babyBirthday').data('val')
                    };
                    var gender = $('.babyGenderShow').val();
                    if (gender) {
                        if (gender == '王子') {
                            ajaxData.baby.babyGender = 1;
                        } else {
                            ajaxData.baby.babyGender = 2;
                        }
                    }
                    console.log(ajaxData.baby);

                    if (hashParams.id) ajaxData.baby.babyId = hashParams.id;

                    //校验
                    if (!ajaxData.baby.babyName) {
                        return M.tips('请输入宝宝昵称');
                    }

                    if (!/^[\u4e00-\u9fa5_a-zA-Z0-9]+$/.test(ajaxData.baby.babyName)) {
                        return M.tips('宝宝昵称只支持汉字，英文和数字');
                    }

                    if (!ajaxData.baby.babyGender || ajaxData.baby.babyGender == -1) {
                        return M.tips('请选择宝宝性别');
                    }
                    if (!ajaxData.baby.babyBirthday) {
                        return M.tips('请选择宝宝生日');
                    }
                    break;
                case 3:
                    break;
            }

            var apiURL = hashParams.status == 0 ? c.api.breed_add : c.api.breed_update;
            ajaxData = {json: JSON.stringify($.extend(ajaxData, data || {}))};
            M.ajax({
                url: apiURL,
                data: {data: JSON.stringify(ajaxData)},
                success: function () {
                    page.updateProfileCache(function () {
                        history.go(-1);
                    });
                }
            });
        },
        breedDelete: function () {
            var c = page.config, hashParams = c.hashParams();
            var ajaxData = {};
            if (hashParams.id) ajaxData.babyId = hashParams.id;
            confirm('确认删除？', function () {
                M.ajax({
                    url: c.api.breed_delete,
                    data: {data: JSON.stringify(ajaxData)},
                    success: function () {
                        page.updateProfileCache(function () {
                            history.go(-1);
                        });
                    }
                });
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

    module.exports = page;

});