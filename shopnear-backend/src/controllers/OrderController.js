const UserOrders = require("../models/UserOrders");
const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const OrderService = require("../services/OrderService");
const helpers = require("../util/helpers")();
const Razorpay = require("razorpay");
var ObjectId = require("mongoose").Types.ObjectId;
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = () => {
  // Add to cart
  const addToCart = async (req, res, next) => {
    try {
      const { userId, productId, quantity, size, color } = req.body;
      if (!userId || !productId || !quantity) {
        req.rCode = 0;
        req.msg = "Missing required fields";
        return next();
      }
      let cart = await UserOrders.findOne({ userId, status: "cart" });
      const product = await Product.findById(productId);
      if (!product) {
        req.rCode = 0;
        req.msg = "Product not found";
        return next();
      }
      const cartItem = {
        productId,
        sellerId: product.shopId,
        productName: product.productName,
        productImage: product.productImages?.[0]?.url || "",
        size,
        color,
        quantity,
        unitPrice: product.price,
        totalPrice: product.price * quantity,
        discount: product.discountPrice
          ? product.price - product.discountPrice
          : 0,
      };
      if (!cart) {
        // Create new cart
        cart = new UserOrders({
          userId,
          addressId: null,
          products: [cartItem],
          orderId: `CART-${userId}-${Date.now()}`,
          subtotal: cartItem.totalPrice,
          shippingCost: 0,
          couponDiscount: 0,
          grandTotal: cartItem.totalPrice,
          status: "cart",
        });
      } else {
        // Update cart: add or update product
        const idx = cart.products.findIndex(
          (p) => p.productId.toString() === productId
        );
        if (idx >= 0) {
          cart.products[idx].quantity = quantity;
          cart.products[idx].size = size;
          cart.products[idx].color = color;
          cart.products[idx].totalPrice = product.price * quantity;
        } else {
          cart.products.push(cartItem);
        }
        cart.subtotal = cart.products.reduce((sum, p) => sum + p.totalPrice, 0);
        cart.grandTotal = cart.subtotal;
      }
      await cart.save();
      req.rData = cart;
      req.msg = "Cart updated";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  // List cart
  const listCart = async (req, res, next) => {
    try {
      const { userId } = req.body;
      const cart = await UserOrders.findOne({ userId, status: "cart" });
      req.rData = cart || {};
      req.msg = "Cart fetched";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  // Add to wishlist
  const addToWishlist = async (req, res, next) => {
    try {
      const { userId, productId } = req.body;
      if (!userId || !productId) {
        req.rCode = 0;
        req.msg = "Missing required fields";
        return next();
      }
      const product = await Product.findById(productId);
      if (!product) {
        req.rCode = 0;
        req.msg = "Product not found";
        return next();
      }
      let wish = await Wishlist.findOne({ userId, productId });
      if (!wish) {
        wish = new Wishlist({
          userId,
          productId,
          sellerId: product.shopId,
          productName: product.productName,
          productImage: product.productImages?.[0]?.url || "",
          price: product.price,
          discountPrice: product.discountPrice,
        });
        await wish.save();
      }
      req.rData = wish;
      req.msg = "Added to wishlist";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  // List wishlist
  const listWishlist = async (req, res, next) => {
    try {
      const { userId } = req.body;
      // Product se live rating uthate hain taaki UI me stars backend driven hon
      const wishlist = await Wishlist.find({ userId }).populate(
        "productId",
        "rating totalRatings"
      );
      req.rData = wishlist.map((w) => {
        const obj = w.toObject();
        obj.rating = w.productId?.rating || 0;
        obj.totalRatings = w.productId?.totalRatings || 0;
        obj.productId = w.productId?._id || obj.productId;
        return obj;
      });
      req.msg = "Wishlist fetched";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (req, res, next) => {
    try {
      const { userId, productId } = req.body;
      if (!userId || !productId) {
        req.rCode = 0;
        req.msg = "Missing required fields";
        return next();
      }
      await Wishlist.deleteOne({ userId, productId });
      req.rData = { productId };
      req.msg = "Removed from wishlist";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  const createOrSubmitOrder = async (req, res, next) => {
    try {
      const { userId, addressId, paymentMode, paymentStatus, status, orderId } =
        req.body;
      let order;
      if (orderId) {
        order = await UserOrders.findOne({ userId, orderId });
      } else {
        order = await UserOrders.findOne({ userId, status: "cart" });
      }
      if (!order) {
        req.rCode = 0;
        req.msg = orderId ? "Order not found" : "Cart not found";
        return next();
      }
      if (addressId) order.addressId = addressId;
      if (paymentMode) order.paymentMode = paymentMode;
      if (typeof status !== "undefined") {
        if (status === "cart") order.status = "cart";
        else if (status === "created") order.status = "created";
        else if (status === "completed" || status === "submit")
          order.status = "completed";
        else order.status = status;
      }
      if (typeof paymentStatus !== "undefined")
        order.paymentStatus = paymentStatus;
      await order.save();
      req.rData = order;
      let msg = "Order updated";
      if (!orderId && order.status === "cart") msg = "Cart";
      else if (!orderId && order.status === "created") msg = "Order created";
      else if (order.status === "completed") msg = "Order submitted";
      req.msg = msg;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  // Razorpay create payment order
  const createPaymentOrder = async (req, res, next) => {
    try {
      const { userId, orderId, amount, currency } = req.body;
      if (!userId || !orderId || !amount) {
        req.rCode = 0;
        req.msg = "Missing required fields";
        return next();
      }
      const paymentOrder = await razorpay.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: currency || "INR",
        receipt: orderId,
        payment_capture: 1,
        notes: { userId, orderId },
      });
      req.rData = paymentOrder;
      req.msg = "Payment order created";
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg =
        e.error && e.error.description ? e.error.description : e.message;
      next();
    }
  };

  /**
   * ==================== NEW ORDER FLOW ====================
   */

  /**
   * Place Order (Customer)
   */
  const placeOrder = async (req, res, next) => {
    try {
      console.log("OrderController => placeOrder");
      const { userId } = req.body;
      const { addressId, paymentMode } = req.body;

      if (!userId || !addressId || !paymentMode) {
        req.rCode = 0;
        req.msg = "Missing required fields (userId, addressId, paymentMode)";
        return next();
      }

      // Get cart for user
      let cart = await UserOrders.findOne({ userId, status: "pending" });
      if (!cart) {
        cart = await UserOrders.findOne({ userId }).sort({ createdAt: -1 });
      }

      if (!cart || !cart.products || cart.products.length === 0) {
        req.rCode = 5;
        req.msg = "Cart is empty";
        return next();
      }

      const orderData = {
        addressId: new ObjectId(addressId),
        paymentMode: paymentMode,
        status: "pending",
        paymentStatus: paymentMode === "cod" ? "pending" : "pending",
      };

      let order = await OrderService().createOrder(
        new ObjectId(userId),
        orderData
      );

      req.msg = "order_placed";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Verify Payment (Razorpay)
   */
  const verifyPayment = async (req, res, next) => {
    try {
      console.log("OrderController => verifyPayment");
      const {
        orderId,
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      } = req.body;

      if (
        !orderId ||
        !razorpayOrderId ||
        !razorpayPaymentId ||
        !razorpaySignature
      ) {
        req.rCode = 0;
        req.msg = "Missing payment verification fields";
        return next();
      }

      // Verify signature
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        req.rCode = 0;
        req.msg = "Payment verification failed";
        return next();
      }

      // Update order with payment details (scoped to the requesting user's own order)
      let order = await OrderService().updatePaymentDetails(orderId, userId, {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      if (!order) {
        req.rCode = 0;
        req.msg = "order_not_found";
        return next();
      }

      req.msg = "payment_verified";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Customer Orders (with filters)
   */
  const getCustomerOrders = async (req, res, next) => {
    try {
      console.log("OrderController => getCustomerOrders");
      const { userId } = req.body;
      let { page, limit, status, paymentMode, startDate, endDate } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let query = {};

      if (status) {
        query.status = status;
      }

      if (paymentMode) {
        query.paymentMode = paymentMode;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      let orders = await OrderService().getCustomerOrders(
        new ObjectId(userId),
        query,
        page,
        limit
      );
      let total_orders = await OrderService().countCustomerOrders(
        new ObjectId(userId),
        query
      );

      req.msg = "orders_list";
      req.rData = {
        page,
        limit,
        total_orders,
        orders,
        filters: {
          status,
          paymentMode,
          startDate,
          endDate,
        },
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Order Detail (Customer)
   */
  const getOrderDetail = async (req, res, next) => {
    try {
      console.log("OrderController => getOrderDetail");
      const { userId } = req.body;
      const { id } = req.params;

      let order = await OrderService().getOrderByOrderId(id);

      if (!order || order.userId.toString() !== userId.toString()) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "success";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Cancel Order (Customer)
   */
  const cancelOrder = async (req, res, next) => {
    try {
      console.log("OrderController => cancelOrder");
      const { userId, orderId, cancelReason } = req.body;

      let order = await OrderService().cancelOrder(
        orderId,
        new ObjectId(userId),
        cancelReason
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found_or_cannot_cancel";
        req.rData = {};
        return next();
      }

      req.msg = "order_cancelled";
      req.rData = {};
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Initiate Return (Customer)
   */
  const initiateReturn = async (req, res, next) => {
    try {
      console.log("OrderController => initiateReturn");
      const { userId, orderId, returnReason } = req.body;

      let order = await OrderService().initiateReturn(
        orderId,
        new ObjectId(userId),
        returnReason
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found_or_cannot_return";
        req.rData = {};
        return next();
      }

      req.msg = "return_initiated";
      req.rData = {};
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Track Order (Customer)
   */
  const trackOrder = async (req, res, next) => {
    try {
      console.log("OrderController => trackOrder");
      const { userId } = req.body;
      const { id } = req.params;

      let tracking = await OrderService().getOrderTracking(
        id,
        new ObjectId(userId)
      );

      if (!tracking) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "success";
      req.rData = tracking;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * ==================== SELLER ORDERS ====================
   */

  /**
   * Get Seller Orders (with filters)
   */
  const getSellerOrders = async (req, res, next) => {
    try {
      console.log("OrderController => getSellerOrders");
      const { sellerId } = req.body;
      let { page, limit, status, startDate, endDate } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let query = {};

      if (status) {
        query["sellerOrderStatus.status"] = status;
      }

      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          query.createdAt.$lte = end;
        }
      }

      let orders = await OrderService().getSellerOrders(
        new ObjectId(sellerId),
        query,
        page,
        limit
      );
      let total_orders = await OrderService().countSellerOrders(
        new ObjectId(sellerId),
        query
      );

      req.msg = "seller_orders_list";
      req.rData = {
        page,
        limit,
        total_orders,
        orders,
        filters: {
          status,
          startDate,
          endDate,
        },
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Seller Order Detail
   */
  const getSellerOrderDetail = async (req, res, next) => {
    try {
      console.log("OrderController => getSellerOrderDetail");
      const { sellerId } = req.body;
      const { id } = req.params;

      let order = await OrderService().getOrderByOrderId(id);

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      // Check if seller has products in this order
      const sellerHasProduct = order.products.some(
        (p) => p.sellerId.toString() === sellerId.toString()
      );

      if (!sellerHasProduct) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      // Filter products for this seller
      order.products = order.products.filter(
        (p) => p.sellerId.toString() === sellerId.toString()
      );

      req.msg = "success";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Update Order Status (Seller)
   */
  const updateOrderStatus = async (req, res, next) => {
    try {
      console.log("OrderController => updateOrderStatus");
      const { sellerId, orderId, status } = req.body;

      let order = await OrderService().updateOrderStatus(
        orderId,
        new ObjectId(sellerId),
        status
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "order_status_updated";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Seller Order Statistics
   */
  /**
   * Get Seller Customers (aggregated from this seller's orders)
   */
  const getSellerCustomers = async (req, res, next) => {
    try {
      console.log("OrderController => getSellerCustomers");
      const { sellerId } = req.body;
      let { page, limit, search, minOrders } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      const { customers, total_customers } =
        await OrderService().getSellerCustomers(new ObjectId(sellerId), {
          search,
          minOrders,
          page,
          limit,
        });

      req.msg = "seller_customers_list";
      req.rData = {
        page,
        limit,
        total_customers,
        customers,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Seller verifies delivery OTP (told by customer at delivery) → order delivered
   */
  const sellerVerifyDeliveryOtp = async (req, res, next) => {
    try {
      console.log("OrderController => sellerVerifyDeliveryOtp");
      const { sellerId, orderId, otp } = req.body;

      let order = await OrderService().sellerVerifyDeliveryOtp(
        orderId,
        new ObjectId(sellerId),
        otp
      );

      req.msg = "delivery_verified";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  const getSellerOrderStats = async (req, res, next) => {
    try {
      console.log("OrderController => getSellerOrderStats");
      const { sellerId } = req.body;

      let stats = await OrderService().getSellerOrderStats(
        new ObjectId(sellerId)
      );

      req.msg = "success";
      req.rData = stats;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Update Tracking Information (Seller)
   */
  const updateTracking = async (req, res, next) => {
    try {
      console.log("OrderController => updateTracking");
      const { sellerId, orderId, trackingNumber, estimatedDeliveryDate } =
        req.body;

      let order = await OrderService().updateTracking(
        orderId,
        new ObjectId(sellerId),
        {
          trackingNumber,
          estimatedDeliveryDate,
        }
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "tracking_updated";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Seller Accept Order
   */
  const sellerAcceptOrder = async (req, res, next) => {
    try {
      console.log("OrderController => sellerAcceptOrder");
      const { sellerId, orderId } = req.body;

      let order = await OrderService().sellerAcceptOrder(
        orderId,
        new ObjectId(sellerId)
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "seller_accepted";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Seller Reject Order
   */
  const sellerRejectOrder = async (req, res, next) => {
    try {
      console.log("OrderController => sellerRejectOrder");
      const { sellerId, orderId, reason } = req.body;

      let order = await OrderService().sellerRejectOrder(
        orderId,
        new ObjectId(sellerId),
        reason
      );

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "seller_rejected";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Seller send delivery OTP
   */
  const sellerSendDeliveryOtp = async (req, res, next) => {
    try {
      console.log("OrderController => sellerSendDeliveryOtp");
      const { sellerId, orderId } = req.body;

      let result = await OrderService().sendDeliveryOtp(
        orderId,
        new ObjectId(sellerId)
      );

      req.msg = "otp_sent";
      // For now return OTP in response for testing; in prod, remove otp from response
      req.rData = { order: result.order, otp: result.otp };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Customer verifies delivery OTP
   */
  const verifyDeliveryOtp = async (req, res, next) => {
    try {
      console.log("OrderController => verifyDeliveryOtp");
      const { userId } = req.body;
      const { orderId, sellerId, otp } = req.body;

      if (!userId || !orderId || !sellerId || !otp) {
        req.rCode = 0;
        req.msg = "Missing required fields";
        return next();
      }

      let order = await OrderService().verifyDeliveryOtp(
        orderId,
        new ObjectId(sellerId),
        new ObjectId(userId),
        otp
      );

      req.msg = "otp_verified";
      req.rData = order;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  return {
    addToCart,
    listCart,
    addToWishlist,
    listWishlist,
    removeFromWishlist,
    createOrSubmitOrder,
    createPaymentOrder,
    placeOrder,
    verifyPayment,
    getCustomerOrders,
    getOrderDetail,
    cancelOrder,
    initiateReturn,
    trackOrder,
    getSellerOrders,
    getSellerOrderDetail,
    updateOrderStatus,
    sellerAcceptOrder,
    sellerRejectOrder,
    sellerSendDeliveryOtp,
    sellerVerifyDeliveryOtp,
    verifyDeliveryOtp,
    getSellerOrderStats,
    getSellerCustomers,
    updateTracking,
  };
};
