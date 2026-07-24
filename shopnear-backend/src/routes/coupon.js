const router = require("express").Router();
const CouponController = require("../controllers/CouponController")();
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdminValidator = require("../validators/AdminValidator");

/**
 * ==================== CUSTOMER COUPON ROUTES ====================
 */

// Get available coupons for customer
router.get(
  "/available",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CouponController.getAvailableCoupons),
  ResponseMiddleware
);

// Apply coupon to order
router.post(
  "/apply",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validateApplyCoupon,
  ErrorHandlerMiddleware(CouponController.applyCoupon),
  ResponseMiddleware
);

// Remove coupon from order
router.post(
  "/remove",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CouponController.removeCoupon),
  ResponseMiddleware
);

/**
 * ==================== SELLER COUPON ROUTES ====================
 */

// Get seller coupons (applicable to seller's products)
router.get(
  "/seller/coupons",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(CouponController.getSellerCoupons),
  ResponseMiddleware
);

// Get seller coupon detail
router.get(
  "/seller/coupons/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateCouponId,
  ErrorHandlerMiddleware(CouponController.getSellerCouponDetail),
  ResponseMiddleware
);

/**
 * ==================== ADMIN COUPON ROUTES ====================
 */

// Create coupon
router.post(
  "/admin/create",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(CouponController.createCoupon),
  ResponseMiddleware
);

// Get all coupons
router.get(
  "/admin/list",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(CouponController.getAllCoupons),
  ResponseMiddleware
);

// Get coupon detail
router.get(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCouponId,
  ErrorHandlerMiddleware(CouponController.getCouponDetail),
  ResponseMiddleware
);

// Update coupon
router.put(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCouponId,
  AdminValidator().validateUpdateCoupon,
  ErrorHandlerMiddleware(CouponController.updateCoupon),
  ResponseMiddleware
);

// Delete coupon
router.delete(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCouponId,
  ErrorHandlerMiddleware(CouponController.deleteCoupon),
  ResponseMiddleware
);

module.exports = router;
