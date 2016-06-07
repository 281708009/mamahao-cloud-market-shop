
var express = require('express');
var router = express.Router();
var users = require('../controllers/users');


/*
* 个人中心
* */
router.get('/center', users.center);



module.exports = router;  //必须要有