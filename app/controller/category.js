/*
* 分类
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');

var store = {
    index: function (req, res, next) {
        res.render("category/index");
    }
};

module.exports = store;
