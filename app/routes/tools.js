/**
 * 工具路由控制器
 */

var testRouter = express.Router();

var toolsCtrl = require('../controller/tools');


/**
 * 网站主页
 */
testRouter
    .get("/", toolsCtrl.index)
    .get("/unbind", toolsCtrl.unbind)
    .get("/cleanCache", toolsCtrl.cleanCache)
;


module.exports = testRouter;