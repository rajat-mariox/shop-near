const Coupon = require("../models/CouponCode");
const UserOrders = require("../models/UserOrders");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = () => {
  /**
   * Create Coupon (Admin)
   */
  const createCoupon = (couponData) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.create(couponData);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get All Coupons (Admin)
   */
  const getAllCoupons = (query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let orm = Coupon.find(query)
        .populate("products", "productName")
        .populate("categories", "name")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Count All Coupons
   */
  const countAllCoupons = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Coupon by ID
   */
  const getCouponById = (couponId) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.findById(couponId)
        .populate("products", "productName")
        .populate("categories", "name");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Coupon by Code
   */
  const getCouponByCode = (code) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.findOne({ code, isDeleted: { $ne: true } })
        .populate("products", "productName")
        .populate("categories", "name");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Update Coupon (Admin)
   */
  const updateCoupon = (couponId, updateData) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.findByIdAndUpdate(couponId, updateData, { new: true })
        .populate("products", "productName")
        .populate("categories", "name");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Delete Coupon (Soft Delete)
   */
  const deleteCoupon = (couponId) => {
    return new Promise(function (resolve, reject) {
      let orm = Coupon.findByIdAndUpdate(
        couponId,
        { isDeleted: true },
        { new: true }
      );

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Validate Coupon for Customer
   * Checks if coupon is valid for current order
   */
  const validateCoupon = (code, userId, orderData) => {
    return new Promise(async function (resolve, reject) {
      try {
        const coupon = await Coupon.findOne({
          code,
          isDeleted: { $ne: true },
          isActive: true,
        });

        if (!coupon) {
          reject(new Error("Coupon not found or inactive"));
          return;
        }

        // Check if coupon is expired
        const now = new Date();
        if (coupon.startDate && coupon.startDate > now) {
          reject(new Error("Coupon is not yet valid"));
          return;
        }
        if (coupon.endDate && coupon.endDate < now) {
          reject(new Error("Coupon has expired"));
          return;
        }

        // Check minimum order value
        if (orderData.subtotal < coupon.minOrderValue) {
          reject(
            new Error(
              `Minimum order value of ₹${coupon.minOrderValue} required`
            )
          );
          return;
        }

        // Check applicable for
        if (coupon.applicableFor === "newUser") {
          // Check if user is new (no previous completed orders)
          const previousOrders = await UserOrders.countDocuments({
            userId,
            status: "delivered",
          });

          if (previousOrders > 0) {
            reject(new Error("Coupon is only for new users"));
            return;
          }
        } else if (coupon.applicableFor === "specificUser") {
          // Check if user mobile matches
          const user = await require("../models/User").findById(userId);
          if (!user || user.mobileNumber !== coupon.specificUserMobile) {
            reject(new Error("Coupon is not applicable for you"));
            return;
          }
        }

        // Check payment mode
        if (
          coupon.paymentMode !== "both" &&
          coupon.paymentMode !== orderData.paymentMode
        ) {
          reject(
            new Error(
              `Coupon is only applicable for ${coupon.paymentMode} payments`
            )
          );
          return;
        }

        // Check product/category eligibility
        if (coupon.products.length > 0 || coupon.categories.length > 0) {
          const validProducts = orderData.products.filter((product) => {
            return (
              coupon.products.some(
                (p) => p.toString() === product.productId.toString()
              ) ||
              coupon.categories.some(
                (c) => c.toString() === product.categoryId.toString()
              )
            );
          });

          if (validProducts.length === 0) {
            reject(
              new Error("Coupon is not applicable for products in this order")
            );
            return;
          }
        }

        resolve(coupon);
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * Calculate Discount Amount
   */
  const calculateDiscount = (coupon, subtotal, applicableAmount = null) => {
    let discountAmount = 0;

    const amount = applicableAmount || subtotal;

    if (coupon.discountType === "percentage") {
      discountAmount = (coupon.discountValue / 100) * amount;

      // Apply max discount cap if exists
      if (
        coupon.maxDiscountAmount &&
        discountAmount > coupon.maxDiscountAmount
      ) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.discountType === "fixed") {
      discountAmount = coupon.discountValue;
    }

    return Math.min(discountAmount, amount); // Discount can't exceed subtotal
  };

  /**
   * Get Available Coupons for Customer
   */
  const getAvailableCoupons = (userId, page, limit) => {
    return new Promise(async function (resolve, reject) {
      try {
        page = page ? parseInt(page) : 1;
        limit = limit ? parseInt(limit) : 10;

        const now = new Date();

        let query = {
          isActive: true,
          isDeleted: { $ne: true },
          $or: [
            { startDate: { $lte: now } },
            { startDate: { $exists: false } },
          ],
          $or: [{ endDate: { $gte: now } }, { endDate: { $exists: false } }],
        };

        // For new user coupons, check if user has completed orders
        const user = await require("../models/User").findById(userId);
        const previousOrders = await UserOrders.countDocuments({
          userId,
          status: "delivered",
        });

        const isNewUser = previousOrders === 0;

        // Filter based on user eligibility
        query.$or = [
          { applicableFor: "all" },
          {
            applicableFor: "newUser",
            $expr: { $eq: [isNewUser, true] },
          },
          {
            applicableFor: "specificUser",
            specificUserMobile: user?.mobileNumber,
          },
        ];

        let coupons = await Coupon.find(query)
          .populate("products", "productName")
          .populate("categories", "name")
          .select("-__v")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit);

        let total = await Coupon.countDocuments(query);

        resolve({ coupons, total });
      } catch (e) {
        reject(e);
      }
    });
  };

  /**
   * Get Coupon Usage Stats
   */
  const getCouponStats = (couponId) => {
    return new Promise(function (resolve, reject) {
      UserOrders.aggregate([
        {
          $match: {
            couponCodeId: new ObjectId(couponId),
          },
        },
        {
          $facet: {
            usageCount: [
              {
                $count: "count",
              },
            ],
            totalDiscount: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$couponDiscount" },
                },
              },
            ],
            totalRevenue: [
              {
                $group: {
                  _id: null,
                  total: { $sum: "$grandTotal" },
                },
              },
            ],
          },
        },
      ])
        .then((result) => {
          const stats = {
            usageCount: result[0].usageCount[0]?.count || 0,
            totalDiscount: result[0].totalDiscount[0]?.total || 0,
            totalRevenue: result[0].totalRevenue[0]?.total || 0,
          };
          resolve(stats);
        })
        .catch(reject);
    });
  };

  /**
   * Get Seller Coupons (coupons for seller's products)
   */
  const getSellerCoupons = (sellerId, query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      // Find products of seller
      const Product = require("../models/Product");
      Product.find({ shopId: new ObjectId(sellerId) })
        .then((products) => {
          const productIds = products.map((p) => p._id);

          const searchQuery = {
            ...query,
            $or: [
              { products: { $in: productIds } },
              { categories: { $exists: true, $ne: [] } },
            ],
            isDeleted: { $ne: true },
          };

          return Coupon.find(searchQuery)
            .populate("products", "productName")
            .populate("categories", "name")
            .select("-__v")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Count Seller Coupons
   */
  const countSellerCoupons = (sellerId, query) => {
    return new Promise(function (resolve, reject) {
      const Product = require("../models/Product");
      Product.find({ shopId: new ObjectId(sellerId) })
        .then((products) => {
          const productIds = products.map((p) => p._id);

          const searchQuery = {
            ...query,
            $or: [
              { products: { $in: productIds } },
              { categories: { $exists: true, $ne: [] } },
            ],
            isDeleted: { $ne: true },
          };

          return Coupon.countDocuments(searchQuery);
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Check Coupon Usage Limit
   */
  const checkCouponUsageLimit = (couponId, maxUsageLimit) => {
    return new Promise(function (resolve, reject) {
      UserOrders.countDocuments({
        couponCodeId: new ObjectId(couponId),
        paymentStatus: "completed",
      })
        .then((count) => {
          if (maxUsageLimit && count >= maxUsageLimit) {
            reject(new Error("Coupon usage limit exceeded"));
          } else {
            resolve(count);
          }
        })
        .catch(reject);
    });
  };

  return {
    createCoupon,
    getAllCoupons,
    countAllCoupons,
    getCouponById,
    getCouponByCode,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    calculateDiscount,
    getAvailableCoupons,
    getCouponStats,
    getSellerCoupons,
    countSellerCoupons,
    checkCouponUsageLimit,
  };
};
