const UserOrders = require("../models/UserOrders");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = () => {
  /**
   * Create Order (from cart)
   */
  const createOrder = (userId, orderData) => {
    return new Promise(function (resolve, reject) {
      orderData.userId = userId;
      orderData.status = "pending";
      orderData.paymentStatus =
        orderData.paymentMode === "cod" ? "pending" : "pending";

      // Generate unique order ID
      if (!orderData.orderId) {
        orderData.orderId = `ORD-${Date.now()}-${userId.toString().slice(-6)}`;
      }

      // Initialize seller-wise order status
      if (orderData.products && orderData.products.length > 0) {
        const uniqueSellers = [
          ...new Map(
            orderData.products.map((p) => [p.sellerId.toString(), p.sellerId])
          ).values(),
        ];
        orderData.sellerOrderStatus = uniqueSellers.map((sellerId) => ({
          sellerId,
          status: "pending",
          updatedAt: new Date(),
        }));
      }

      let orm = UserOrders.create(orderData);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Order by Order ID
   */
  const getOrderById = (orderId) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findById(orderId)
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId")
        .populate("products.productId", "productName productImages")
        .populate("products.sellerId", "shopName")
        .populate("couponCodeId")
        .select("-__v");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Order by Order ID String
   */
  const getOrderByOrderId = (orderId) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOne({ orderId })
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId")
        .populate("products.productId", "productName productImages")
        .populate("products.sellerId", "shopName")
        .populate("couponCodeId")
        .select("-__v");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Customer Orders with filters
   */
  const getCustomerOrders = (userId, query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      const searchQuery = { userId: new ObjectId(userId), ...query };

      let orm = UserOrders.find(searchQuery)
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId", "fullName address city state pinCode")
        .populate("products.productId", "productName productImages")
        .populate("products.sellerId", "shopName")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Count Customer Orders
   */
  const countCustomerOrders = (userId, query) => {
    return new Promise(function (resolve, reject) {
      const searchQuery = { userId: new ObjectId(userId), ...query };
      let orm = UserOrders.countDocuments(searchQuery);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Seller Orders with filters
   */
  const getSellerOrders = (sellerId, query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      const searchQuery = {
        "products.sellerId": new ObjectId(sellerId),
        ...query,
      };

      let orm = UserOrders.find(searchQuery)
        .populate("userId", "fullName email mobileNumber")
        .populate(
          "addressId",
          "fullName address city state pinCode phoneNumber"
        )
        .populate("products.productId", "productName productImages")
        .populate("products.sellerId", "shopName")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Count Seller Orders
   */
  const countSellerOrders = (sellerId, query) => {
    return new Promise(function (resolve, reject) {
      const searchQuery = {
        "products.sellerId": new ObjectId(sellerId),
        ...query,
      };
      let orm = UserOrders.countDocuments(searchQuery);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Update Order Status (for seller)
   */
  const updateOrderStatus = (orderId, sellerId, newStatus) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOne({ orderId, "products.sellerId": sellerId });

      orm
        .then((order) => {
          if (!order) {
            reject(new Error("Order not found"));
            return;
          }

          // Update seller-specific order status
          const sellerStatusIndex = order.sellerOrderStatus.findIndex(
            (s) => s.sellerId.toString() === sellerId.toString()
          );

          if (sellerStatusIndex >= 0) {
            order.sellerOrderStatus[sellerStatusIndex].status = newStatus;
            order.sellerOrderStatus[sellerStatusIndex].updatedAt = new Date();

            // Shipped hote hi delivery OTP generate karo — customer ko tracking
            // screen par dikhta hai, seller delivery par enter karke complete karta hai
            if (
              newStatus === "shipped" &&
              !order.sellerOrderStatus[sellerStatusIndex].otpVerified &&
              !order.sellerOrderStatus[sellerStatusIndex].otp
            ) {
              const helpers = require("../util/helpers")();
              order.sellerOrderStatus[sellerStatusIndex].otp =
                helpers.generateOTP();
              order.sellerOrderStatus[sellerStatusIndex].otpExpires = null;
              order.sellerOrderStatus[sellerStatusIndex].otpVerified = false;
            }
          }

          // Update main status if all sellers have same status or if specific conditions are met
          if (newStatus === "delivered") {
            order.actualDeliveryDate = new Date();
            // Check if all sellers have delivered
            const allDelivered = order.sellerOrderStatus.every(
              (s) => s.status === "delivered" || s.status === "cancelled"
            );
            if (allDelivered) {
              order.status = "delivered";
              order.paymentStatus = "completed";
            }
          } else if (newStatus === "shipped") {
            order.status = "shipped";
          } else if (newStatus === "processing") {
            order.status = "processing";
          } else if (newStatus === "confirmed") {
            order.status = "confirmed";
          }

          return UserOrders.findByIdAndUpdate(order._id, order, { new: true })
            .populate("userId", "fullName email mobileNumber")
            .populate("addressId")
            .populate("products.productId", "productName")
            .populate("products.sellerId", "shopName");
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Seller accepts an order (sets seller status to confirmed)
   */
  const sellerAcceptOrder = (orderId, sellerId) => {
    return new Promise(function (resolve, reject) {
      UserOrders.findOne({ orderId, "products.sellerId": sellerId })
        .then((order) => {
          if (!order) throw new Error("Order not found");

          const idx = order.sellerOrderStatus.findIndex(
            (s) => s.sellerId.toString() === sellerId.toString()
          );
          if (idx < 0) throw new Error("Seller not part of order");

          order.sellerOrderStatus[idx].status = "confirmed";
          order.sellerOrderStatus[idx].updatedAt = new Date();

          // If any seller confirmed, set main order status to confirmed
          order.status = "confirmed";

          return UserOrders.findByIdAndUpdate(order._id, order, { new: true });
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Seller rejects an order (sets seller status to cancelled). If all sellers cancel, cancel the order.
   */
  const sellerRejectOrder = (orderId, sellerId, reason) => {
    return new Promise(function (resolve, reject) {
      UserOrders.findOne({ orderId, "products.sellerId": sellerId })
        .then((order) => {
          if (!order) throw new Error("Order not found");

          const idx = order.sellerOrderStatus.findIndex(
            (s) => s.sellerId.toString() === sellerId.toString()
          );
          if (idx < 0) throw new Error("Seller not part of order");

          order.sellerOrderStatus[idx].status = "cancelled";
          order.sellerOrderStatus[idx].updatedAt = new Date();

          // If all sellers cancelled the order, cancel whole order
          const allCancelled = order.sellerOrderStatus.every(
            (s) => s.status === "cancelled"
          );
          if (allCancelled) {
            order.status = "cancelled";
            order.cancelledAt = new Date();
            order.cancelReason = reason || "Seller cancelled the order";
          }

          return UserOrders.findByIdAndUpdate(order._id, order, { new: true });
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Send delivery OTP for a seller's portion of an order
   */
  const sendDeliveryOtp = async (orderId, sellerId) => {
    try {
      const helpers = require("../util/helpers")();
      const otp = helpers.generateOTP();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const order = await UserOrders.findOne({
        orderId,
        "products.sellerId": sellerId,
      });
      if (!order) throw new Error("Order not found");

      const idx = order.sellerOrderStatus.findIndex(
        (s) => s.sellerId.toString() === sellerId.toString()
      );
      if (idx < 0) throw new Error("Seller not part of order");

      order.sellerOrderStatus[idx].otp = otp;
      order.sellerOrderStatus[idx].otpExpires = otpExpires;
      order.sellerOrderStatus[idx].otpVerified = false;
      order.sellerOrderStatus[idx].status = "shipped";
      order.sellerOrderStatus[idx].updatedAt = new Date();

      const updated = await UserOrders.findByIdAndUpdate(order._id, order, {
        new: true,
      })
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId")
        .populate("products.productId", "productName")
        .populate("products.sellerId", "shopName");

      // In production you'd send OTP via SMS/Email. For now return OTP for testing.
      return { order: updated, otp };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Verify delivery OTP (customer confirms delivery for a seller's portion)
   */
  const verifyDeliveryOtp = async (orderId, sellerId, userId, otp) => {
    try {
      const order = await UserOrders.findOne({ orderId, userId });
      if (!order) throw new Error("Order not found for user");

      const idx = order.sellerOrderStatus.findIndex(
        (s) => s.sellerId.toString() === sellerId.toString()
      );
      if (idx < 0) throw new Error("Seller not part of order");

      const sellerStatus = order.sellerOrderStatus[idx];
      if (!sellerStatus.otp || sellerStatus.otp !== otp)
        throw new Error("Invalid OTP");
      if (sellerStatus.otpExpires && new Date() > sellerStatus.otpExpires)
        throw new Error("OTP expired");

      order.sellerOrderStatus[idx].otpVerified = true;
      order.sellerOrderStatus[idx].status = "delivered";
      order.sellerOrderStatus[idx].updatedAt = new Date();

      // If all sellers delivered or cancelled, mark order delivered
      const allDelivered = order.sellerOrderStatus.every(
        (s) => s.status === "delivered" || s.status === "cancelled"
      );
      if (allDelivered) {
        order.status = "delivered";
        order.paymentStatus = "completed";
        order.actualDeliveryDate = new Date();
      }

      const updated = await UserOrders.findByIdAndUpdate(order._id, order, {
        new: true,
      })
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId")
        .populate("products.productId", "productName")
        .populate("products.sellerId", "shopName");

      return updated;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Seller verifies delivery OTP (customer batata hai, seller panel me enter hota hai)
   */
  const sellerVerifyDeliveryOtp = async (orderId, sellerId, otp) => {
    const order = await UserOrders.findOne({
      orderId,
      "products.sellerId": sellerId,
    });
    if (!order) throw new Error("Order not found");

    const idx = order.sellerOrderStatus.findIndex(
      (s) => s.sellerId.toString() === sellerId.toString()
    );
    if (idx < 0) throw new Error("Seller not part of order");

    const sellerStatus = order.sellerOrderStatus[idx];
    if (!sellerStatus.otp) throw new Error("No delivery OTP for this order");
    if (sellerStatus.otp !== String(otp).trim()) throw new Error("Invalid OTP");
    if (sellerStatus.otpExpires && new Date() > sellerStatus.otpExpires)
      throw new Error("OTP expired");

    order.sellerOrderStatus[idx].otpVerified = true;
    order.sellerOrderStatus[idx].status = "delivered";
    order.sellerOrderStatus[idx].updatedAt = new Date();

    const allDelivered = order.sellerOrderStatus.every(
      (s) => s.status === "delivered" || s.status === "cancelled"
    );
    if (allDelivered) {
      order.status = "delivered";
      order.paymentStatus = "completed";
      order.actualDeliveryDate = new Date();
    }

    return UserOrders.findByIdAndUpdate(order._id, order, { new: true })
      .populate("userId", "fullName email mobileNumber")
      .populate("addressId")
      .populate("products.productId", "productName")
      .populate("products.sellerId", "shopName");
  };

  /**
   * Update Payment Details (Razorpay)
   */
  const updatePaymentDetails = (orderId, userId, paymentDetails) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOneAndUpdate(
        { orderId, userId },
        {
          razorpayOrderId: paymentDetails.razorpayOrderId,
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
          paymentStatus: "completed",
        },
        { new: true }
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Cancel Order
   */
  const cancelOrder = (orderId, userId, cancelReason) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOneAndUpdate(
        { orderId, userId },
        {
          status: "cancelled",
          cancelledAt: new Date(),
          cancelReason: cancelReason || "Customer requested cancellation",
        },
        { new: true }
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Return Order (initiate return)
   */
  const initiateReturn = (orderId, userId, returnReason) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOneAndUpdate(
        { orderId, userId, status: "delivered" },
        {
          status: "returned",
          cancelledAt: new Date(),
          cancelReason: returnReason || "Return initiated",
        },
        { new: true }
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Order Tracking Details
   */
  const getOrderTracking = (orderId, userId) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOne({ orderId, userId }).select(
        "orderId status sellerOrderStatus trackingNumber estimatedDeliveryDate actualDeliveryDate createdAt updatedAt"
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Order Statistics for Seller
   */
  const getSellerOrderStats = (sellerId) => {
    return new Promise(function (resolve, reject) {
      UserOrders.aggregate([
        {
          $match: {
            "products.sellerId": new ObjectId(sellerId),
          },
        },
        {
          $facet: {
            totalOrders: [
              {
                $count: "count",
              },
            ],
            pendingOrders: [
              {
                $match: {
                  "sellerOrderStatus.sellerId": new ObjectId(sellerId),
                  "sellerOrderStatus.status": "pending",
                },
              },
              {
                $count: "count",
              },
            ],
            completedOrders: [
              {
                $match: {
                  "sellerOrderStatus.sellerId": new ObjectId(sellerId),
                  "sellerOrderStatus.status": "delivered",
                },
              },
              {
                $count: "count",
              },
            ],
            totalRevenue: [
              {
                $unwind: "$products",
              },
              {
                $match: {
                  "products.sellerId": new ObjectId(sellerId),
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$products.totalPrice" },
                },
              },
            ],
          },
        },
      ])
        .then((result) => {
          const stats = {
            totalOrders: result[0].totalOrders[0]?.count || 0,
            pendingOrders: result[0].pendingOrders[0]?.count || 0,
            completedOrders: result[0].completedOrders[0]?.count || 0,
            totalRevenue: result[0].totalRevenue[0]?.total || 0,
          };
          resolve(stats);
        })
        .catch(reject);
    });
  };

  /**
   * Update Tracking Information
   */
  const updateTracking = (orderId, sellerId, trackingData) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.findOneAndUpdate(
        { orderId, "products.sellerId": sellerId },
        {
          trackingNumber: trackingData.trackingNumber,
          estimatedDeliveryDate: trackingData.estimatedDeliveryDate,
        },
        { new: true }
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get all orders (admin)
   */
  const getAllOrders = (query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let orm = UserOrders.find(query)
        .populate("userId", "fullName email mobileNumber")
        .populate("addressId")
        .populate("products.productId", "productName")
        .populate("products.sellerId", "shopName")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Count all orders
   */
  const countAllOrders = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = UserOrders.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  const applyOrUpdateCoupon = async (orderId, couponId, discountAmount) => {
    try {
      const order = await UserOrders.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      const updatedOrder = await UserOrders.findByIdAndUpdate(
        orderId,
        {
          "pricing.couponDiscount": discountAmount,
          couponCodeId: couponId,
          "pricing.grandTotal":
            order.pricing.subtotal +
            order.pricing.shippingCharge -
            discountAmount,
        },
        { new: true }
      );

      return updatedOrder;
    } catch (error) {
      throw error;
    }
  };

  const removeCoupon = async (orderId) => {
    try {
      const order = await UserOrders.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      const updatedOrder = await UserOrders.findByIdAndUpdate(
        orderId,
        {
          $unset: {
            couponCodeId: 1,
          },
          "pricing.couponDiscount": 0,
          "pricing.grandTotal":
            order.pricing.subtotal + order.pricing.shippingCharge,
        },
        { new: true }
      );

      return updatedOrder;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Seller Customers (aggregated from orders, server-side search + pagination)
   */
  const getSellerCustomers = (sellerId, { search, minOrders, page, limit }) => {
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const pipeline = [
      { $match: { "products.sellerId": new ObjectId(sellerId) } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$userId",
          totalPurchases: { $sum: "$grandTotal" },
          orderCount: { $sum: 1 },
          lastOrderAt: { $max: "$createdAt" },
          addressId: { $last: "$addressId" },
        },
      },
    ];

    if (minOrders) {
      pipeline.push({ $match: { orderCount: { $gte: parseInt(minOrders) } } });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "useraddresses",
          localField: "addressId",
          foreignField: "_id",
          as: "address",
        },
      },
      { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
    );

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { "user.fullName": { $regex: search, $options: "i" } },
            { "user.email": { $regex: search, $options: "i" } },
            { "user.mobileNumber": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { lastOrderAt: -1 } },
      {
        $facet: {
          customers: [
            { $skip: (page - 1) * limit },
            { $limit: limit },
            {
              $project: {
                _id: 1,
                fullName: "$user.fullName",
                email: "$user.email",
                mobileNumber: "$user.mobileNumber",
                totalPurchases: 1,
                orderCount: 1,
                lastOrderAt: 1,
                address: {
                  address: "$address.address",
                  city: "$address.city",
                  state: "$address.state",
                  pinCode: "$address.pinCode",
                },
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    );

    return UserOrders.aggregate(pipeline).then((result) => ({
      customers: result[0]?.customers || [],
      total_customers: result[0]?.total?.[0]?.count || 0,
    }));
  };

  return {
    createOrder,
    getOrderById,
    getOrderByOrderId,
    getCustomerOrders,
    countCustomerOrders,
    getSellerOrders,
    countSellerOrders,
    getSellerCustomers,
    sellerAcceptOrder,
    sellerRejectOrder,
    sendDeliveryOtp,
    verifyDeliveryOtp,
    sellerVerifyDeliveryOtp,
    updateOrderStatus,
    updatePaymentDetails,
    cancelOrder,
    initiateReturn,
    getOrderTracking,
    getSellerOrderStats,
    updateTracking,
    getAllOrders,
    countAllOrders,
    applyOrUpdateCoupon,
    removeCoupon,
  };
};
