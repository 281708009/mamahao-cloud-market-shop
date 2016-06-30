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
    .post("/request",testCtrl.request)
    .get("/:id/:pid",testCtrl.info);



module.exports = testRouter;