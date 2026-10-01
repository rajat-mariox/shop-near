const router = require("express").Router();

router.use("/auth", require("./auth"));
router.use("/user", require("./users"));
router.use("/seller", require("./sellers"));
router.use("/order", require("./order"));
router.use("/admin", require("./admin"));
router.use("/coupon", require("./coupon"));
router.use("/offers", require("./offers"));

// Public (no auth) CMS content - mobile app (CmsScreen) aur admin panel ke
// public /privacy-policy page ke liye. type: terms | privacy | about | shipping |
// cancellation | refund | contact
router.get(
  "/cms/:type",
  require("../controllers/PublicPagesController")().cmsJson
);

module.exports = router;
