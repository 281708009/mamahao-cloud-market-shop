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
    .get("/:id/:pid", testCtrl.info)

    .post("/request",testCtrl.request)
    .post("/ali-oss", testCtrl.aliOSS)
    .post("/ossUpload", testCtrl.uploadImage)
;



module.exports = testRouter;