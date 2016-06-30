/*
* 门店
* */
var HttpClient = require("../utils/http_client");
var API = require('../config/api');

var store = {
    index: function (req, res, next) {
        res.render("store/index");
    }
};

module.exports = store;