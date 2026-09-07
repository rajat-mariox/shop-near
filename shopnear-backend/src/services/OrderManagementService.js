const UserOrders = require("../models/UserOrders");
const PanelNotificationService = require("./PanelNotificationService");
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const UserAddress = require("../models/UserAddress");
const Seller = require("../models/Seller");
const { isValidCoords, distanceKm, formatDistance } = require("../util/geo");
// Admin-set delivery radius (lazy require - HomeScreenService circular import se bachne ke liye)
const getDeliveryRadiusKm = () =>
  require("./HomeScreenService")().getDeliveryRadiusKm();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = () => {
  /**
   * Create order from cart
   * POST /v1/api/customer/orders/create
   */
  const createOrderFromCart = async (req, res, next) => {
    console.log("OrderManagementService => createOrderFromCart");

    try {
      const userId = req.body.userId;
      const { addressId, paymentMethod } = req.body;

      if (!addressId || !paymentMethod) {
        req.error = "Address ID and Payment Method are required";
        return next();
      }

      // Get cart
      const cart = await Cart.findOne({
        userId,
        isActive: true,
        isDeleted: false,
      });

      if (!cart || cart.items.length === 0) {
        req.error = "Cart is empty";
        return next();
      }

      // Fetch the selected address, scoped to the requesting user
      const deliveryAddress = await UserAddress.findOne({
        _id: addressId,
        userId,
      });
      if (!deliveryAddress) {
        req.error = "Delivery address not found";
        return next();
      }

      // Selected address har shop ke admin-set delivery radius ke andar hona
      // chahiye - home par live location se shop dikhi, par order door ke
      // address par na chala jaaye. Purane address me coords na ho to skip.
      if (isValidCoords(deliveryAddress.lat, deliveryAddress.lng)) {
        const radiusKm = await getDeliveryRadiusKm();
        const sellerIds = [
          ...new Set(cart.items.map((i) => String(i.sellerId))),
        ];
        const sellers = await Seller.find({ _id: { $in: sellerIds } }).select(
          "shopName lat lng"
        );
        for (const seller of sellers) {
          if (!isValidCoords(seller.lat, seller.lng)) continue;
          const km = distanceKm(
            deliveryAddress.lat,
            deliveryAddress.lng,
            seller.lat,
            seller.lng
          );
          if (km > radiusKm) {
            req.error = `"${seller.shopName}" does not deliver to the selected address (${formatDistance(
              km
            )} away, max ${radiusKm} km). Please choose a nearer address.`;
            return next();
          }
        }
      }

      // Stock order banate hi atomically reserve hota hai (COD + online dono) —
      // $gte condition ke saath findOneAndUpdate race condition bhi rokta hai
      // (pehle sirf validation thi, COD me stock kabhi kat-ta hi nahi tha)
      const reserved = [];
      for (const item of cart.items) {
        const product = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            isActive: true,
            isDeleted: { $ne: true },
            stock: { $gte: item.quantity },
          },
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!product) {
          // Fail hua to ab tak reserve kiya stock wapas karo
          for (const done of reserved) {
            await Product.findByIdAndUpdate(done.productId, {
              $inc: { stock: done.quantity },
            });
          }
          req.error = `"${item.productName}" is out of stock or doesn't have enough stock left`;
          return next();
        }
        reserved.push({ productId: item.productId, quantity: item.quantity });
      }

      const products = cart.items.map((item) => ({
        productId: item.productId,
        sellerId: item.sellerId,
        productName: item.productName,
        productImage: item.productImage,
        color: item.selectedColor?.name || "",
        size: item.selectedSize || "",
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.discountPrice * item.quantity,
        discount: (item.price - item.discountPrice) * item.quantity,
      }));

      const uniqueSellers = [
        ...new Map(
          products.map((p) => [p.sellerId.toString(), p.sellerId])
        ).values(),
      ];

      // Create order
      const order = new UserOrders({
        userId,
        products,
        orderId: `ORD-${Date.now()}-${userId.toString().slice(-6)}`,
        addressId,
        subtotal: cart.subtotal,
        shippingCost: cart.deliveryCharge,
        taxAmount: cart.taxAmount,
        couponDiscount: cart.discountAmount,
        grandTotal: cart.total,
        paymentMode: paymentMethod === "online" ? "online" : "cod",
        status: "pending",
        paymentStatus: "pending",
        sellerOrderStatus: uniqueSellers.map((sellerId) => ({
          sellerId,
          status: "pending",
          updatedAt: new Date(),
        })),
      });

      await order.save();

      // COD me cart yahin clear hota hai; online me payment verify hone par
      // clear hota hai — fail/cancel par user ka cart wapas mil jaata hai
      if (paymentMethod !== "online") {
        cart.isActive = false;
        await cart.save();
        // Seller/admin panel bell: naya COD order
        PanelNotificationService().orderPlaced(order);
      }

      req.rData = {
        _id: order._id,
        orderId: order.orderId,
        amount: order.grandTotal,
        paymentMethod,
        status: order.status,
      };

      req.msg = "Order created successfully";
      next();
    } catch (error) {
      console.error("Error in createOrderFromCart:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Create Razorpay payment order
   * POST /v1/api/customer/orders/payment
   */
  const createPaymentOrder = async (req, res, next) => {
    console.log("OrderManagementService => createPaymentOrder");

    try {
      const userId = req.body.userId;
      const { orderId } = req.body;

      if (!orderId) {
        req.error = "Order ID is required";
        return next();
      }

      const order = await UserOrders.findById(orderId);
      if (!order) {
        req.error = "Order not found";
        return next();
      }

      if (String(order.userId) !== String(userId)) {
        req.error = "Unauthorized";
        return next();
      }

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: Math.round(order.grandTotal * 100), // Convert to paise
        currency: "INR",
        receipt: order._id.toString(),
        notes: {
          orderId: order._id.toString(),
          userId: order.userId.toString(),
        },
      });

      // Save payment order ID
      order.razorpayOrderId = razorpayOrder.id;
      await order.save();

      req.rData = {
        orderId: order._id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      };

      req.msg = "Payment order created successfully";
      next();
    } catch (error) {
      console.error("Error in createPaymentOrder:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Verify payment
   * POST /v1/api/customer/orders/verify-payment
   */
  const verifyPayment = async (req, res, next) => {
    console.log("OrderManagementService => verifyPayment");

    try {
      const userId = req.body.userId;
      const { orderId, razorpayPaymentId, razorpaySignature } = req.body;

      if (!orderId || !razorpayPaymentId || !razorpaySignature) {
        req.error = "Missing payment verification details";
        return next();
      }

      const order = await UserOrders.findById(orderId);
      if (!order) {
        req.error = "Order not found";
        return next();
      }

      // Verify signature — Razorpay apne razorpay_order_id + payment_id ko
      // sign karta hai (hamare Mongo orderId ko nahi), DB me stored id se match
      const body = order.razorpayOrderId + "|" + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

      if (expectedSignature !== razorpaySignature) {
        req.error = "Payment verification failed";
        return next();
      }

      // Update order
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.paymentStatus = "completed";
      order.status = "confirmed";

      await order.save();

      // Seller/admin panel bell: paid order aaya
      PanelNotificationService().orderPlaced(order);

      // Stock yahan nahi kat-ta — order create hote waqt hi atomically
      // reserve ho chuka hota hai (createOrderFromCart)

      // Online payment verify hua — ab cart clear karo (create ke waqt
      // jaan-boojh kar active chhoda tha)
      await Cart.updateOne(
        { userId: order.userId, isActive: true, isDeleted: false },
        { $set: { isActive: false } }
      );

      req.rData = {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
      };

      req.msg = "Payment verified successfully";
      next();
    } catch (error) {
      console.error("Error in verifyPayment:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get order details
   * GET /v1/api/customer/orders/:orderId
   */
  const getOrderDetails = async (req, res, next) => {
    console.log("OrderManagementService => getOrderDetails");

    try {
      const userId = req.body.userId;
      const { orderId } = req.params;

      // Mongo _id (app ka normal flow) aur "ORD-..." orderId (push notification
      // data) dono chalte hain
      const lookup = mongoose.isValidObjectId(orderId)
        ? { _id: orderId }
        : { orderId: orderId };
      // Model ke asli field naam: products, addressId, grandTotal, shippingCost
      const order = await UserOrders.findOne(lookup)
        .populate("userId", "fullName email mobileNumber")
        .populate("products.sellerId", "shopName shopLogo mobile")
        .populate("addressId");

      if (!order) {
        req.error = "Order not found";
        return next();
      }

      // userId ek ObjectId hota hai, isliye dono taraf String() zaroori hai
      if (String(order.userId._id) !== String(userId)) {
        req.error = "Unauthorized";
        return next();
      }

      const address = order.addressId;

      req.rData = {
        _id: order._id,
        orderId: order.orderId,
        customer: {
          name: order.userId.fullName,
          email: order.userId.email,
          phone: order.userId.mobileNumber,
        },
        products: (order.products || []).map((item) => ({
          _id: item._id,
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          seller: {
            _id: item.sellerId?._id,
            shopName: item.sellerId?.shopName,
            shopLogo: item.sellerId?.shopLogo,
            mobile: item.sellerId?.mobile,
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          discount: item.discount,
          color: item.color,
          size: item.size,
        })),
        deliveryAddress: address
          ? {
              _id: address._id,
              fullName: address.fullName,
              address: address.address,
              city: address.city,
              state: address.state,
              pinCode: address.pinCode,
              addressType: address.addressType,
              mobile: address.mobile,
            }
          : null,
        subtotal: order.subtotal,
        shippingCost: order.shippingCost,
        // Purane orders me taxAmount save nahi tha — grandTotal se derive karo
        taxAmount:
          order.taxAmount != null
            ? order.taxAmount
            : Math.max(
                0,
                +(
                  order.grandTotal -
                  order.subtotal -
                  (order.shippingCost || 0) +
                  (order.couponDiscount || 0)
                ).toFixed(2)
              ),
        couponDiscount: order.couponDiscount,
        grandTotal: order.grandTotal,
        status: order.status,
        sellerOrderStatus: order.sellerOrderStatus,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        // Assigned shop delivery agent — tracking screen par customer isse call karta hai
        deliveryAgent: order.deliveryAgent?.agentId
          ? {
              name: order.deliveryAgent.name,
              mobile: order.deliveryAgent.mobile,
              assignedAt: order.deliveryAgent.assignedAt,
            }
          : null,
        trackingNumber: order.trackingNumber,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        actualDeliveryDate: order.actualDeliveryDate,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      req.msg = "Order details fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getOrderDetails:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get all orders of user
   * GET /v1/api/customer/orders?page=1&limit=10&status=pending
   */
  const getUserOrders = async (req, res, next) => {
    console.log("OrderManagementService => getUserOrders");

    try {
      const userId = req.body.userId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;

      const skip = (page - 1) * limit;

      // Model ke field naam: orderId, products, grandTotal
      // ("cart" status enum me hai hi nahi, isliye woh filter hata diya)
      let query = { userId };

      // status comma-separated bhi ho sakta hai, jaise "pending,confirmed,processing"
      if (status) {
        const statusList = String(status)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (statusList.length > 1) {
          query.status = { $in: statusList };
        } else if (statusList.length === 1) {
          query.status = statusList[0];
        }
      }

      const total = await UserOrders.countDocuments(query);

      const orders = await UserOrders.find(query)
        .select(
          "orderId grandTotal status paymentStatus paymentMode createdAt products"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order) => ({
        _id: order._id,
        orderId: order.orderId,
        itemCount: order.products ? order.products.length : 0,
        products: order.products,
        grandTotal: order.grandTotal,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentMode: order.paymentMode,
        createdAt: order.createdAt,
      }));

      const totalPages = Math.ceil(total / limit);

      req.rData = {
        orders: formattedOrders,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: total,
          resultsPerPage: limit,
        },
      };

      req.msg = "Orders fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getUserOrders:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Cancel order
   * PUT /v1/api/customer/orders/:orderId/cancel
   */
  const cancelOrder = async (req, res, next) => {
    console.log("OrderManagementService => cancelOrder");

    try {
      const userId = req.body.userId;
      const { orderId } = req.params;
      const { reason } = req.body;

      const order = await UserOrders.findById(orderId);
      if (!order) {
        req.error = "Order not found";
        return next();
      }

      if (String(order.userId) !== String(userId)) {
        req.error = "Unauthorized";
        return next();
      }

      if (
        order.status === "cancelled" ||
        order.status === "delivered" ||
        order.status === "shipped"
      ) {
        req.error = "Cannot cancel order in current status";
        return next();
      }

      // If payment is completed, initiate refund
      const wasPaid = order.paymentStatus === "completed";
      if (wasPaid) {
        // TODO: Initiate refund through Razorpay
        order.paymentStatus = "refunded";
      }

      order.status = "cancelled";
      order.cancelledAt = new Date();
      order.cancelReason = reason;

      // Order create hote waqt stock reserve hota hai, isliye cancel par
      // hamesha wapas hota hai (field ka naam `products` hai, `items` nahi)
      for (const item of order.products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }

      await order.save();
      // Seller/admin panel bell: customer ne order cancel kiya
      PanelNotificationService().orderCancelled(order, "customer");

      req.rData = {
        orderId: order._id,
        status: order.status,
        cancelledAt: order.cancelledAt,
      };

      req.msg = "Order cancelled successfully";
      next();
    } catch (error) {
      console.error("Error in cancelOrder:", error);
      req.error = error.message;
      next();
    }
  };

  return {
    createOrderFromCart,
    createPaymentOrder,
    verifyPayment,
    getOrderDetails,
    getUserOrders,
    cancelOrder,
  };
};
