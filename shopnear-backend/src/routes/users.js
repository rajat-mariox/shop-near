const userRouter = require("express").Router();
const UserController = require("../controllers/UserController");
const HomeScreenController = require("../controllers/HomeScreenController");
const CustomerController = require("../controllers/CustomerController")();
const CartController = require("../controllers/CartController")();
const OrderManagementController =
  require("../controllers/OrderManagementController")();
const RatingController = require("../controllers/RatingController")();
const FeedbackController = require("../controllers/FeedbackController")();
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const UsersValidator = require("../validators/UsersValidator");
const AdminValidator = require("../validators/AdminValidator");

userRouter.get(
  "/profile",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(UserController().getDetails),
  ResponseMiddleware
);

/**
 * Edit
 */
userRouter.put(
  "/profile",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(UserController().editUser),
  ResponseMiddleware
);

/**
 * Account deletion (Play Store policy) — 7 day grace period ke saath
 */
userRouter.post(
  "/delete-account",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(UserController().deleteAccount),
  ResponseMiddleware
);

/**
 * Address
 */
userRouter.post(
  "/address",
  AuthMiddleware().verifyUserToken,
  UsersValidator().validateAddress,
  ErrorHandlerMiddleware(UserController().addUserAddress),
  ResponseMiddleware
);

userRouter.get(
  "/address",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(UserController().getUserAddress),
  ResponseMiddleware
);

userRouter.get(
  "/address/:id",
  AuthMiddleware().verifyUserToken,
  UsersValidator().validateAddressId,
  ErrorHandlerMiddleware(UserController().getUserAddressDetail),
  ResponseMiddleware
);

userRouter.delete(
  "/address/:id",
  AuthMiddleware().verifyUserToken,
  UsersValidator().validateAddressId,
  ErrorHandlerMiddleware(UserController().deleteUserAddress),
  ResponseMiddleware
);

userRouter.put(
  "/address/:id",
  AuthMiddleware().verifyUserToken,
  UsersValidator().validateAddressId,
  ErrorHandlerMiddleware(UserController().selectAddress),
  ResponseMiddleware
);

/**
 * Notifications
 */

userRouter.get(
  "/notifications/switch",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(UserController().activateDeactivateNotification),
  ResponseMiddleware
);

// userRouter.get(
//   "/notifications",
//   AuthMiddleware().verifyUserToken,
//   ErrorHandlerMiddleware(UserController().notifications),
//   ResponseMiddleware
// );

/**
 * Home Screen
 */
userRouter.get(
  "/homeScreen",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(HomeScreenController().homeScreen),
  ResponseMiddleware
);

// ==================== SELLERS & PRODUCTS (from customer.js) ====================

// Get all sellers with pagination and filters
userRouter.get(
  "/sellers",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.getSellers),
  ResponseMiddleware
);

// Get seller details
userRouter.get(
  "/sellers/:sellerId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.getSellerDetail),
  ResponseMiddleware
);

// Get seller categories
userRouter.get(
  "/sellers/:sellerId/categories",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.getSellerCategoriesDetail),
  ResponseMiddleware
);

// Get products by seller and category
userRouter.get(
  "/sellers/:sellerId/products",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.getSellerProductsList),
  ResponseMiddleware
);

// Get product details
userRouter.get(
  "/products/:productId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.getProductDetail),
  ResponseMiddleware
);

// Search products
userRouter.get(
  "/search",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CustomerController.searchProductsList),
  ResponseMiddleware
);

// Submit a rating/review for a product from a delivered order
userRouter.post(
  "/products/:productId/ratings",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RatingController.submitRating),
  ResponseMiddleware
);

// Get ratings/reviews for a product
userRouter.get(
  "/products/:productId/ratings",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(RatingController.getProductRatings),
  ResponseMiddleware
);

// Submit general app feedback
userRouter.post(
  "/feedback",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(FeedbackController.submitFeedback),
  ResponseMiddleware
);

// ==================== CART MANAGEMENT (from customer.js) ====================

// Get cart
userRouter.get(
  "/cart",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.getCartData),
  ResponseMiddleware
);

// Add item to cart
userRouter.post(
  "/cart/add",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.addItemToCart),
  ResponseMiddleware
);

// Update cart item quantity
userRouter.put(
  "/cart/items/:itemId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.updateItemQuantity),
  ResponseMiddleware
);

// Remove item from cart
userRouter.delete(
  "/cart/items/:itemId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.removeItemFromCart),
  ResponseMiddleware
);

// Apply coupon
userRouter.post(
  "/cart/apply-coupon",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.applyCouponCode),
  ResponseMiddleware
);

// Remove coupon
userRouter.delete(
  "/cart/coupon",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.removeCouponCode),
  ResponseMiddleware
);

// Save delivery address
userRouter.post(
  "/cart/delivery-address",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.setDeliveryAddress),
  ResponseMiddleware
);

// Clear cart
userRouter.delete(
  "/cart",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(CartController.emptyCart),
  ResponseMiddleware
);

// ==================== ORDER MANAGEMENT (from customer.js) ====================

// Create order from cart
userRouter.post(
  "/orders/create",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.createOrder),
  ResponseMiddleware
);

// Create payment order (Razorpay)
userRouter.post(
  "/orders/payment",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.initiatePayment),
  ResponseMiddleware
);

// Verify payment
userRouter.post(
  "/orders/verify-payment",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.verifyPaymentSignature),
  ResponseMiddleware
);

// Get all orders
userRouter.get(
  "/orders",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.getAllOrders),
  ResponseMiddleware
);

// Get order details
userRouter.get(
  "/orders/:orderId",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.getOrder),
  ResponseMiddleware
);

// Cancel order
userRouter.put(
  "/orders/:orderId/cancel",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderManagementController.cancelUserOrder),
  ResponseMiddleware
);

module.exports = userRouter;
