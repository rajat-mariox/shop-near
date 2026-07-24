const router = require("express").Router();
const OrderController = require("../controllers/OrderController")();
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdminValidator = require("../validators/AdminValidator");

// Cart APIs
router.post(
  "/cart/add",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.addToCart),
  ResponseMiddleware
);
router.get(
  "/cart/list",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.listCart),
  ResponseMiddleware
);

// Wishlist APIs
router.post(
  "/wishlist/add",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.addToWishlist),
  ResponseMiddleware
);
router.get(
  "/wishlist/list",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.listWishlist),
  ResponseMiddleware
);
router.post(
  "/wishlist/remove",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.removeFromWishlist),
  ResponseMiddleware
);

// Order APIs (create/submit) - Old
router.post(
  "/order/submit",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.createOrSubmitOrder),
  ResponseMiddleware
);

// Payment APIs - Old
router.post(
  "/payment/create-order",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.createPaymentOrder),
  ResponseMiddleware
);

/**
 * ==================== CUSTOMER ORDER FLOW ====================
 */

// Place Order
router.post(
  "/place-order",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validatePlaceOrder,
  ErrorHandlerMiddleware(OrderController.placeOrder),
  ResponseMiddleware
);

// Verify Payment (Razorpay)
router.post(
  "/verify-payment",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validatePaymentVerify,
  ErrorHandlerMiddleware(OrderController.verifyPayment),
  ResponseMiddleware
);

// Customer verify delivery OTP
router.post(
  "/verify-delivery-otp",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validateVerifyDeliveryOtp,
  ErrorHandlerMiddleware(OrderController.verifyDeliveryOtp),
  ResponseMiddleware
);

// Get Customer Orders
router.get(
  "/my-orders",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.getCustomerOrders),
  ResponseMiddleware
);

// Get Order Detail
router.get(
  "/orders/:id",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validateOrderId,
  ErrorHandlerMiddleware(OrderController.getOrderDetail),
  ResponseMiddleware
);

// Cancel Order
router.post(
  "/cancel-order",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validateCancelOrder,
  ErrorHandlerMiddleware(OrderController.cancelOrder),
  ResponseMiddleware
);

// Initiate Return
router.post(
  "/initiate-return",
  AuthMiddleware().verifyUserToken,
  AdminValidator().validateReturnOrder,
  ErrorHandlerMiddleware(OrderController.initiateReturn),
  ResponseMiddleware
);

// Track Order
router.get(
  "/track/:id",
  AuthMiddleware().verifyUserToken,
  ErrorHandlerMiddleware(OrderController.trackOrder),
  ResponseMiddleware
);

/**
 * ==================== SELLER ORDER FLOW ====================
 */

// Get Seller Customers (aggregated from orders)
router.get(
  "/seller/customers",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(OrderController.getSellerCustomers),
  ResponseMiddleware
);

// Get Seller Orders
router.get(
  "/seller/orders",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(OrderController.getSellerOrders),
  ResponseMiddleware
);

// Get Seller Order Detail
router.get(
  "/seller/orders/:id",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateOrderId,
  ErrorHandlerMiddleware(OrderController.getSellerOrderDetail),
  ResponseMiddleware
);

// Update Order Status
router.put(
  "/seller/update-status",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateUpdateOrderStatus,
  ErrorHandlerMiddleware(OrderController.updateOrderStatus),
  ResponseMiddleware
);

// Seller accept order
router.post(
  "/seller/accept",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerAction,
  ErrorHandlerMiddleware(OrderController.sellerAcceptOrder),
  ResponseMiddleware
);

// Seller reject order
router.post(
  "/seller/reject",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerAction,
  ErrorHandlerMiddleware(OrderController.sellerRejectOrder),
  ResponseMiddleware
);

// Seller verify delivery OTP (customer batata hai, seller enter karta hai) → delivered
router.post(
  "/seller/verify-delivery-otp",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSellerVerifyDeliveryOtp,
  ErrorHandlerMiddleware(OrderController.sellerVerifyDeliveryOtp),
  ResponseMiddleware
);

// Seller send delivery OTP
router.post(
  "/seller/send-delivery-otp",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateSendDeliveryOtp,
  ErrorHandlerMiddleware(OrderController.sellerSendDeliveryOtp),
  ResponseMiddleware
);

// Update Tracking Information
router.put(
  "/seller/update-tracking",
  AuthMiddleware().verifySellerToken,
  AdminValidator().validateUpdateTracking,
  ErrorHandlerMiddleware(OrderController.updateTracking),
  ResponseMiddleware
);

// Get Seller Order Statistics
router.get(
  "/seller/stats",
  AuthMiddleware().verifySellerToken,
  ErrorHandlerMiddleware(OrderController.getSellerOrderStats),
  ResponseMiddleware
);

module.exports = router;
