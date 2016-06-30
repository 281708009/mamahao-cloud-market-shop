/*
* 购物车
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');

var store = {
    index: function (req, res, next) {
        res.render("cart/index");
    }
};

module.exports = store;
