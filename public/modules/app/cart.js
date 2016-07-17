define(function(require, exports, module) {
    var test = require('app/test');

    window.wx = require('weixin');
    console.log(wx)

    console.log(test.test())

});