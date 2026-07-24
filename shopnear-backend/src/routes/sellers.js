const router = require("express").Router();
const SellerAuthController = require("../controllers/SellerAuthController");
const SellerController = require("../controllers/SellerController");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const CategoryController = require("../controllers/CategoryController");
const AdminController = require("../controllers/AdminController");
const AdminValidator = require("../validators/AdminValidator");
const { authRateLimiter } = require("../middlewares/RateLimitMiddleware");

/**
 * --------------------- AUTH ---------------------
 */
router.post(
  "/login",
  authRateLimiter,
  ErrorHandlerMiddleware(SellerAuthController().login),
  ResponseMiddleware,
);

router.post(
  "/verify-otp",
  authRateLimiter,
  ErrorHandlerMiddleware(SellerAuthController().verifyOtp),
  ResponseMiddleware,
);

/**
 * --------------------- PROFILE ---------------------
 */
router.get(
  "/profile",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(SellerController().getDetails),
  ResponseMiddleware,
);

router.put(
  "/profile",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(SellerController().editSellerProfile),
  ResponseMiddleware,
);

/**
 * --------------------- KYC ---------------------
 */
router.put(
  "/kyc",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(SellerController().updateKyc),
  ResponseMiddleware,
);

/**
 * --------------------- BANK DETAILS ---------------------
 */
router.put(
  "/bank",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(SellerController().updateBankDetails),
  ResponseMiddleware,
);

/**
 * --------------------- SHOP TIMING ---------------------
 */
router.put(
  "/shop-timing",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(SellerController().updateShopTiming),
  ResponseMiddleware,
);

/**
 * --------------------- PRODUCTS ---------------------
 */

// List seller products (with filters)
router.get(
  "/products",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerProductList,
  ErrorHandlerMiddleware(SellerController().listSellerProducts),
  ResponseMiddleware,
);

// Get product detail
router.get(
  "/products/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerProductId,
  ErrorHandlerMiddleware(SellerController().getSellerProductDetail),
  ResponseMiddleware,
);

// Create product
router.post(
  "/products",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerProductCreate,
  ErrorHandlerMiddleware(SellerController().createSellerProduct),
  ResponseMiddleware,
);

// Edit product
router.put(
  "/products/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerProductId,
  AdminValidator().validateSellerProductUpdate,
  ErrorHandlerMiddleware(SellerController().editSellerProduct),
  ResponseMiddleware,
);

// Delete product
router.delete(
  "/products/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerProductId,
  ErrorHandlerMiddleware(SellerController().deleteSellerProduct),
  ResponseMiddleware,
);

/**
 * Category Management
 */

router.get(
  "/categories",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(CategoryController().getAllCategories),
  ResponseMiddleware,
);

router.get(
  "/categories/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateCategoryId,
  ErrorHandlerMiddleware(CategoryController().getCategoryById),
  ResponseMiddleware,
);

/**
 * Brands (read-only, for product form dropdown)
 */

router.get(
  "/brands",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(AdminController().Brands),
  ResponseMiddleware,
);

/**
 * --------------------- ADMIN APIs ---------------------
 */
router.get(
  "/admin/list",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().getAllSellerList),
  ResponseMiddleware,
);

router.get(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().getDetails),
  ResponseMiddleware,
);

router.put(
  "/admin/:id/approve",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().approveSeller),
  ResponseMiddleware,
);

router.put(
  "/admin/:id/reject",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().rejectSeller),
  ResponseMiddleware,
);

router.put(
  "/admin/:id/toggle-status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().activateDeactivateSeller),
  ResponseMiddleware,
);

router.delete(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().deleteSeller),
  ResponseMiddleware,
);

module.exports = router;
