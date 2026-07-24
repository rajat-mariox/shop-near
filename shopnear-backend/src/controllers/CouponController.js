const CouponService = require("../services/CouponService");
const OrderService = require("../services/OrderService");
const fileUploadService = require("../util/s3");
var ObjectId = require("mongoose").Types.ObjectId;

// simple regex escape
const RegexEscape = (s) =>
  s ? s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") : s;

module.exports = () => {
  /**
   * ==================== ADMIN COUPON MANAGEMENT ====================
   */

  /**
   * Create Coupon (Admin)
   */
  const createCoupon = async (req, res, next) => {
    try {
      console.log("CouponController => createCoupon");
      const couponData = { ...req.body };

      // Promo card ki image (multipart file) S3 par upload hoti hai
      if (req.files && req.files.image) {
        const uploadRes = await fileUploadService.uploadFileToAws(
          req.files.image
        );
        couponData.image = uploadRes.images;
      }

      // Parse arrays if they come as JSON strings
      if (typeof couponData.products === "string") {
        couponData.products = JSON.parse(couponData.products);
      }
      if (typeof couponData.categories === "string") {
        couponData.categories = JSON.parse(couponData.categories);
      }
      if (typeof couponData.subCategories === "string") {
        couponData.subCategories = JSON.parse(couponData.subCategories);
      }

      // Convert string IDs to ObjectIds
      if (couponData.products && Array.isArray(couponData.products)) {
        couponData.products = couponData.products.map((id) => new ObjectId(id));
      }
      if (couponData.categories && Array.isArray(couponData.categories)) {
        couponData.categories = couponData.categories.map(
          (id) => new ObjectId(id)
        );
      }

      let coupon = await CouponService().createCoupon(couponData);

      req.msg = "coupon_created";
      req.rData = coupon;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get All Coupons (Admin)
   */
  const getAllCoupons = async (req, res, next) => {
    try {
      console.log("CouponController => getAllCoupons");
      let { page, limit, search, isActive, status } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let query = { isDeleted: { $ne: true } };

      if (typeof isActive !== "undefined") {
        query.isActive =
          isActive === "true" || isActive === 1 || isActive === "1";
      }

      if (search) {
        query.$or = [
          { code: { $regex: RegexEscape(search), $options: "i" } },
          { title: { $regex: RegexEscape(search), $options: "i" } },
          { description: { $regex: RegexEscape(search), $options: "i" } },
        ];
      }

      let coupons = await CouponService().getAllCoupons(query, page, limit);
      let total = await CouponService().countAllCoupons(query);

      req.msg = "coupons_list";
      req.rData = {
        page,
        limit,
        total,
        coupons,
        filters: { search, isActive, status },
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Coupon Detail (Admin)
   */
  const getCouponDetail = async (req, res, next) => {
    try {
      console.log("CouponController => getCouponDetail");
      const { id } = req.params;

      let coupon = await CouponService().getCouponById(id);

      if (!coupon) {
        req.rCode = 5;
        req.msg = "coupon_not_found";
        req.rData = {};
        return next();
      }

      // Get coupon stats
      let stats = await CouponService().getCouponStats(id);

      req.msg = "success";
      req.rData = {
        coupon,
        stats,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Update Coupon (Admin)
   */
  const updateCoupon = async (req, res, next) => {
    try {
      console.log("CouponController => updateCoupon");
      const { id } = req.params;
      const updateData = { ...req.body };

      // Nayi file chuni ho tabhi image badalti hai, warna purani bani rehti hai
      if (req.files && req.files.image) {
        const uploadRes = await fileUploadService.uploadFileToAws(
          req.files.image
        );
        updateData.image = uploadRes.images;
      }

      // Parse arrays if they come as JSON strings
      if (typeof updateData.products === "string") {
        updateData.products = JSON.parse(updateData.products);
      }
      if (typeof updateData.categories === "string") {
        updateData.categories = JSON.parse(updateData.categories);
      }

      // Convert string IDs to ObjectIds
      if (updateData.products && Array.isArray(updateData.products)) {
        updateData.products = updateData.products.map((id) => new ObjectId(id));
      }
      if (updateData.categories && Array.isArray(updateData.categories)) {
        updateData.categories = updateData.categories.map(
          (id) => new ObjectId(id)
        );
      }

      let coupon = await CouponService().updateCoupon(id, updateData);

      if (!coupon) {
        req.rCode = 5;
        req.msg = "coupon_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "coupon_updated";
      req.rData = coupon;
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Delete Coupon (Admin)
   */
  const deleteCoupon = async (req, res, next) => {
    try {
      console.log("CouponController => deleteCoupon");
      const { id } = req.params;

      let coupon = await CouponService().deleteCoupon(id);

      if (!coupon) {
        req.rCode = 5;
        req.msg = "coupon_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "coupon_deleted";
      req.rData = {};
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * ==================== CUSTOMER COUPON USAGE ====================
   */

  /**
   * Get Available Coupons (Customer)
   */
  const getAvailableCoupons = async (req, res, next) => {
    try {
      console.log("CouponController => getAvailableCoupons");
      const { userId } = req.body;
      let { page, limit } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let { coupons, total } = await CouponService().getAvailableCoupons(
        new ObjectId(userId),
        page,
        limit
      );

      req.msg = "available_coupons";
      req.rData = {
        page,
        limit,
        total,
        coupons,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Validate and Apply Coupon (Customer)
   */
  const applyCoupon = async (req, res, next) => {
    try {
      console.log("CouponController => applyCoupon");
      const { userId, code, orderId } = req.body;

      // Get the order to apply coupon
      let order = await OrderService().getOrderByOrderId(orderId);

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      // Prepare order data for validation
      const orderData = {
        subtotal: order.subtotal,
        paymentMode: order.paymentMode,
        products: order.products,
      };

      // Validate coupon
      let coupon = await CouponService().validateCoupon(
        code,
        new ObjectId(userId),
        orderData
      );

      // Calculate discount
      let discountAmount = CouponService().calculateDiscount(
        coupon,
        order.subtotal
      );

      // Update order with coupon
      order = await OrderService().applyOrUpdateCoupon(
        orderId,
        coupon._id,
        discountAmount
      );

      req.msg = "coupon_applied";
      req.rData = {
        coupon,
        discountAmount,
        newGrandTotal: order.grandTotal,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Remove Coupon (Customer)
   */
  const removeCoupon = async (req, res, next) => {
    try {
      console.log("CouponController => removeCoupon");
      const { orderId } = req.body;

      let order = await OrderService().removeCoupon(orderId);

      if (!order) {
        req.rCode = 5;
        req.msg = "order_not_found";
        req.rData = {};
        return next();
      }

      req.msg = "coupon_removed";
      req.rData = {
        newGrandTotal: order.grandTotal,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * ==================== SELLER COUPON VIEW ====================
   */

  /**
   * Get Seller Coupons (Coupons applicable to seller's products)
   */
  const getSellerCoupons = async (req, res, next) => {
    try {
      console.log("CouponController => getSellerCoupons");
      const { sellerId } = req.body;
      let { page, limit, isActive, search } = req.query;

      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let query = { isActive: true, isDeleted: { $ne: true } };

      if (typeof isActive !== "undefined") {
        query.isActive =
          isActive === "true" || isActive === 1 || isActive === "1";
      }

      if (search) {
        query.$or = [
          { code: { $regex: RegexEscape(search), $options: "i" } },
          { title: { $regex: RegexEscape(search), $options: "i" } },
        ];
      }

      let coupons = await CouponService().getSellerCoupons(
        new ObjectId(sellerId),
        query,
        page,
        limit
      );
      let total = await CouponService().countSellerCoupons(
        new ObjectId(sellerId),
        query
      );

      req.msg = "seller_coupons_list";
      req.rData = {
        page,
        limit,
        total,
        coupons,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  /**
   * Get Coupon Detail (Seller - Read Only)
   */
  const getSellerCouponDetail = async (req, res, next) => {
    try {
      console.log("CouponController => getSellerCouponDetail");
      const { id } = req.params;

      let coupon = await CouponService().getCouponById(id);

      if (!coupon) {
        req.rCode = 5;
        req.msg = "coupon_not_found";
        req.rData = {};
        return next();
      }

      // Get coupon stats
      let stats = await CouponService().getCouponStats(id);

      req.msg = "success";
      req.rData = {
        coupon,
        stats,
      };
      next();
    } catch (e) {
      req.rCode = 0;
      req.msg = e.message;
      next();
    }
  };

  return {
    // Admin
    createCoupon,
    getAllCoupons,
    getCouponDetail,
    updateCoupon,
    deleteCoupon,
    // Customer
    getAvailableCoupons,
    applyCoupon,
    removeCoupon,
    // Seller
    getSellerCoupons,
    getSellerCouponDetail,
  };
};
