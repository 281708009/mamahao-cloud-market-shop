
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



module.exports = router;
