
var express = require('express');
var router = express.Router();
var users = require('../controllers/users');


/*
* 首页
* */
router.get('/',users.index)
    .get('/index',users.index);


/*
* 登录
* */
router.get('/login', users.login);


/**
 * 门店
 */
router
    .get("/store", users.store);

/**
 * 分类
 */
router
    .get("/category", users.category);

/**
 * 购物车
 */
router
    .get("/cart", users.cart);

/*
 * 个人中心
 * */
router.get('/center', users.center.index);
router
    .post('/address', users.center.address)
    .post('/address/edit', users.center.addressEdit)
    .post('/beans', users.center.beans)
    .post('/integral', users.center.integral)

module.exports = router;
