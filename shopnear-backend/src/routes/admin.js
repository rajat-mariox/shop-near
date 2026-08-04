const adminRouter = require("express").Router();
const AdminController = require("../controllers/AdminController");
const CategoryController = require("../controllers/CategoryController");
const UserController = require("../controllers/UserController");
const SellerController = require("../controllers/SellerController");
const OrderController = require("../controllers/OrderController");
const AdminValidator = require("../validators/AdminValidator");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const { authRateLimiter } = require("../middlewares/RateLimitMiddleware");

adminRouter.post(
  "/register",
  ErrorHandlerMiddleware(AdminController().register),
  ResponseMiddleware,
);

adminRouter.post(
  "/login",
  authRateLimiter,
  AdminValidator().validateAdminLogin,
  ErrorHandlerMiddleware(AdminController().login),
  ResponseMiddleware,
);

adminRouter.post(
  "/forgotPassword",
  authRateLimiter,
  AdminValidator().validateAdmin,
  ErrorHandlerMiddleware(AdminController().forgotPassword),
  ResponseMiddleware,
);

adminRouter.post(
  "/verifyOtp",
  authRateLimiter,
  AdminValidator().validateAdmin,
  AdminValidator().validateOtp,
  ErrorHandlerMiddleware(AdminController().verifyOtpForForgotPassword),
  ResponseMiddleware,
);

adminRouter.put(
  "/resendOtp",
  authRateLimiter,
  AdminValidator().validateAdmin,
  ErrorHandlerMiddleware(AdminController().resendOtpForEmail),
  ResponseMiddleware,
);

adminRouter.patch(
  "/resetPassword",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateResetPassword,
  ErrorHandlerMiddleware(AdminController().resetPassword),
  ResponseMiddleware,
);

adminRouter.patch(
  "/changePassword",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateChangePassword,
  ErrorHandlerMiddleware(AdminController().changePassword),
  ResponseMiddleware,
);

adminRouter.put(
  "/editProfile",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().editAdmin),
  ResponseMiddleware,
);

adminRouter.get(
  "/getDetails",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getDetails),
  ResponseMiddleware,
);

/**
 * Category
 */

adminRouter.post(
  "/categories",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCategory,
  ErrorHandlerMiddleware(CategoryController().addCategory),
  ResponseMiddleware,
);

adminRouter.get(
  "/categories",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(CategoryController().getAllCategories),
  ResponseMiddleware,
);

adminRouter.get(
  "/categories/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCategoryId,
  ErrorHandlerMiddleware(CategoryController().getCategoryById),
  ResponseMiddleware,
);

adminRouter.put(
  "/categories/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCategoryId,
  ErrorHandlerMiddleware(CategoryController().editCategory),
  ResponseMiddleware,
);

adminRouter.delete(
  "/categories/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCategoryId,
  ErrorHandlerMiddleware(CategoryController().deleteCategory),
  ResponseMiddleware,
);

adminRouter.patch(
  "/categories/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCategoryId,
  ErrorHandlerMiddleware(CategoryController().toggleCategoryStatus),
  ResponseMiddleware,
);

/**
 * Banners
 */

adminRouter.post(
  "/banners",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBanner,
  ErrorHandlerMiddleware(AdminController().addBanner),
  ResponseMiddleware,
);

adminRouter.get(
  "/banners",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getBanner),
  ResponseMiddleware,
);

adminRouter.get(
  "/banners/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBannerId,
  ErrorHandlerMiddleware(AdminController().getBannerDetail),
  ResponseMiddleware,
);

adminRouter.put(
  "/banners/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBannerId,
  AdminValidator().validateBanner,
  ErrorHandlerMiddleware(AdminController().updateBanner),
  ResponseMiddleware,
);

adminRouter.delete(
  "/banners/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBannerId,
  ErrorHandlerMiddleware(AdminController().deleteBanner),
  ResponseMiddleware,
);

/**
 * Home header background (image/video)
 */
adminRouter.get(
  "/home-header-bg",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getHomeHeaderBg),
  ResponseMiddleware,
);

adminRouter.put(
  "/home-header-bg",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateHomeHeaderBg),
  ResponseMiddleware,
);

/**
 * Brands
 */

adminRouter.post(
  "/brands",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBrand,
  ErrorHandlerMiddleware(AdminController().addBrands),
  ResponseMiddleware,
);

adminRouter.get(
  "/brands",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().Brands),
  ResponseMiddleware,
);

adminRouter.get(
  "/brands/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBrandId,
  ErrorHandlerMiddleware(AdminController().brandDetail),
  ResponseMiddleware,
);

adminRouter.put(
  "/brands/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBrandId,
  AdminValidator().validateBrand,
  ErrorHandlerMiddleware(AdminController().addBrands),
  ResponseMiddleware,
);

adminRouter.put(
  "/brands/:id/toggle-status",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBrandId,
  ErrorHandlerMiddleware(AdminController().activateDeactivateBrands),
  ResponseMiddleware,
);

adminRouter.delete(
  "/brands/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateBrandId,
  ErrorHandlerMiddleware(AdminController().deleteBrands),
  ResponseMiddleware,
);

/**
 * Users Management
 */
adminRouter.get(
  "/users",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(UserController().getAllUserList),
  ResponseMiddleware,
);

adminRouter.get(
  "/users/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getUserDetail),
  ResponseMiddleware,
);

adminRouter.put(
  "/users/:id/toggle-status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().toggleUserStatus),
  ResponseMiddleware,
);

/**
 * Delivery Settings
 */
adminRouter.get(
  "/delivery-settings",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getDeliverySettings),
  ResponseMiddleware,
);

adminRouter.put(
  "/delivery-settings",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateDeliverySettings),
  ResponseMiddleware,
);

/**
 * Sellers Management (admin-level)
 */
adminRouter.get(
  "/sellers",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().getAllSellerList),
  ResponseMiddleware,
);

adminRouter.post(
  "/sellers",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().adminCreateSeller),
  ResponseMiddleware,
);

adminRouter.get(
  "/sellers/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().getDetails),
  ResponseMiddleware,
);

adminRouter.put(
  "/sellers/:id/approve",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().approveSeller),
  ResponseMiddleware,
);

adminRouter.put(
  "/sellers/:id/reject",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().rejectSeller),
  ResponseMiddleware,
);

adminRouter.put(
  "/sellers/:id/toggle-status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().activateDeactivateSeller),
  ResponseMiddleware,
);

adminRouter.delete(
  "/sellers/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(SellerController().deleteSeller),
  ResponseMiddleware,
);

/**
 * Products Management (all products across sellers)
 */
adminRouter.get(
  "/products",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getAllProducts),
  ResponseMiddleware,
);

adminRouter.get(
  "/products/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getProductDetail),
  ResponseMiddleware,
);

adminRouter.put(
  "/products/:id/toggle-status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().toggleProductStatus),
  ResponseMiddleware,
);

adminRouter.delete(
  "/products/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().deleteProduct),
  ResponseMiddleware,
);

/**
 * Orders Management (all orders)
 */
adminRouter.get(
  "/orders",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getAllOrders),
  ResponseMiddleware,
);

adminRouter.get(
  "/orders/:id",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getOrderDetail),
  ResponseMiddleware,
);

adminRouter.put(
  "/orders/:id/status",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().updateOrderStatus),
  ResponseMiddleware,
);

/**
 * Dashboard Statistics
 */
adminRouter.get(
  "/dashboard/stats",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getDashboardStats),
  ResponseMiddleware,
);

/**
 * CMS Pages
 */
adminRouter.post(
  "/cms/terms",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addTermAndCondition),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/terms",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getTermAndCondition),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/privacy",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addPrivacyPolicy),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/privacy",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getPrivacyPolicy),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/about",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addAboutUs),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/about",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getAboutUs),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/shipping",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addShippingPolicy),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/shipping",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getShippingPolicy),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/cancellation",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addCancellationPolicy),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/cancellation",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getCancellationPolicy),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/refund",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().addRefundPolicy),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/refund",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getRefundPolicy),
  ResponseMiddleware,
);
adminRouter.post(
  "/cms/contact",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().contactUs),
  ResponseMiddleware,
);
adminRouter.get(
  "/cms/contact",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(AdminController().getContactUs),
  ResponseMiddleware,
);

module.exports = adminRouter;
