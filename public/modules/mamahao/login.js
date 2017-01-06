/**
 * 商城集成妈妈好JS SDK 登录提示界面;
 * by Adang
 */
define(function(require, exports, module) {
    var page = {
        config: {},
        init: function () {
            SDK.tools.callpush.push({i: 2, f: "login"});
        }
    };
    page.init();
});