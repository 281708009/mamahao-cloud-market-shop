/**
 * 路由控制器
 */

var testRouter = express.Router();

var testCtrl = require('../controller/test');


/**
 * 网站主页
 */
testRouter
    .get("/",testCtrl.index)
    .get("/mongodb", testCtrl.mongodb)
    .get("/remove/cookie", testCtrl.remove.cookie)
    .get("/sdk", testCtrl.sdk)


    .post("/request",testCtrl.request)
    .post("/ali-oss", testCtrl.aliOSS)
    .post("/ossUpload", testCtrl.uploadImage)
;



module.exports = testRouter;