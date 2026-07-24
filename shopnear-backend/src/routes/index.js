const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/user", require("./users"));
router.use("/seller", require("./sellers"));
router.use("/order", require("./order"));
router.use("/admin", require("./admin"));
router.use("/coupon", require("./coupon"));
router.use("/offers", require("./offers"));

module.exports = router;
