module.exports = () => {
  const OrderManagementService =
    require("../services/OrderManagementService")();

  /**
   * POST /v1/api/customer/orders/create
   * Create order from cart
   */
  const createOrder = async (req, res, next) => {
    console.log("OrderManagementController => createOrder");
    await OrderManagementService.createOrderFromCart(req, res, next);
  };

  /**
   * POST /v1/api/customer/orders/payment
   * Create Razorpay payment order
   */
  const initiatePayment = async (req, res, next) => {
    console.log("OrderManagementController => initiatePayment");
    await OrderManagementService.createPaymentOrder(req, res, next);
  };

  /**
   * POST /v1/api/customer/orders/verify-payment
   * Verify payment
   */
  const verifyPaymentSignature = async (req, res, next) => {
    console.log("OrderManagementController => verifyPaymentSignature");
    await OrderManagementService.verifyPayment(req, res, next);
  };

  /**
   * GET /v1/api/customer/orders/:orderId
   * Get order details
   */
  const getOrder = async (req, res, next) => {
    console.log("OrderManagementController => getOrder");
    await OrderManagementService.getOrderDetails(req, res, next);
  };

  /**
   * GET /v1/api/customer/orders
   * Get all orders
   */
  const getAllOrders = async (req, res, next) => {
    console.log("OrderManagementController => getAllOrders");
    await OrderManagementService.getUserOrders(req, res, next);
  };

  /**
   * PUT /v1/api/customer/orders/:orderId/cancel
   * Cancel order
   */
  const cancelUserOrder = async (req, res, next) => {
    console.log("OrderManagementController => cancelUserOrder");
    await OrderManagementService.cancelOrder(req, res, next);
  };

  return {
    createOrder,
    initiatePayment,
    verifyPaymentSignature,
    getOrder,
    getAllOrders,
    cancelUserOrder,
  };
};
