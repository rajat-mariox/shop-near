const { Validator } = require("node-input-validator");
const { validate, validations } = require("./index");

module.exports = () => {
  const validateAdminLogin = async (req, res, next) => {
    const v = new Validator(req.body, {
      email: validations.admin.existsEmail,
      password: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateAdmin = async (req, res, next) => {
    const v = new Validator(req.body, {
      email: validations.admin.existsEmail,
    });

    validate(v, res, next, req);
  };

  const validateUpdateStatus = async (req, res, next) => {
    const v = new Validator(req.body, {
      user_id: validations.general.requiredString,
      status: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateGetUserType = async (req, res, next) => {
    const v = new Validator(req.query, {
      user_id: validations.general.requiredString,
      user_type: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateUser = async (req, res, next) => {
    const v = new Validator(req.query, {
      userId: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateOtp = async (req, res, next) => {
    const v = new Validator(req.body, {
      otp: validations.general.requiredNumeric,
    });

    validate(v, res, next, req);
  };

  const validateResetPassword = async (req, res, next) => {
    const v = new Validator(req.body, {
      newPassword: validations.general.requiredString,
      confirmPassword: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateChangePassword = async (req, res, next) => {
    const v = new Validator(req.body, {
      newPassword: validations.general.requiredString,
      currentPassword: validations.general.requiredString,
      confirmPassword: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateCategoryId = async (req, res, next) => {
    let { id } = req.params;

    const v = new Validator(req.params, {
      id: validations.category.id,
    });

    validate(v, res, next, req);
  };

  const validateCategory = async (req, res, next) => {
    let { categoryId } = req.body;

    if (categoryId) {
      const v = new Validator(req.body, {
        categoryId: validations.category.id,
        categoryName: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        categoryName: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateSubCategory = async (req, res, next) => {
    let { subCategoryId } = req.body;

    if (subCategoryId) {
      const v = new Validator(req.body, {
        categoryId: validations.category.id,
        subCategoryId: validations.category.subcategoryId,
        subCategoryName: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        categoryId: validations.category.id,
        subCategoryName: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateSubCategoryId = async (req, res, next) => {
    let { id } = req.params;
    if (id) {
      req.body.subCategoryId = id;
    }

    const v = new Validator(req.params, {
      id: validations.category.subcategoryId,
    });

    validate(v, res, next, req);
  };

  const validateBannerId = async (req, res, next) => {
    let { id } = req.params;

    const v = new Validator(req.params, {
      id: validations.banner.id,
    });

    validate(v, res, next, req);
  };

  const validateBanner = async (req, res, next) => {
    let { bannerId } = req.body;

    if (bannerId) {
      const v = new Validator(req.body, {
        bannerId: validations.banner.id,
        title: validations.general.requiredString,
        // image: validations.general.requiredString,
        // rank: validations.general.requiredInt,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        title: validations.general.requiredString,
        // image: validations.general.requiredString,
        // rank: validations.general.requiredInt,
      });

      validate(v, res, next, req);
    }
  };

  const validateUserId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.userId = id;
    }

    const v = new Validator(req.params, {
      id: validations.user.id,
    });

    validate(v, res, next, req);
  };

  const validateProductsId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.productId = id;
    }

    const v = new Validator(req.params, {
      id: validations.product.id,
    });

    validate(v, res, next, req);
  };

  const validateProductRatingId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.productRatingId = id;
    }

    const v = new Validator(req.params, {
      id: validations.product.productRatingId,
    });

    validate(v, res, next, req);
  };

  const validateProductRating = async (req, res, next) => {
    let { id } = req.params;
    let { productRatingId } = req.body;

    if (id) {
      req.body.productId = id;
    }

    if (productRatingId) {
      const v = new Validator(req.body, {
        productRatingId: validations.product.productRatingId,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        productId: validations.product.id,
        review: validations.general.requiredString,
        rating: validations.general.requiredInt,
      });

      validate(v, res, next, req);
    }
  };

  const validateProducts = async (req, res, next) => {
    let { productId } = req.body;

    if (productId) {
      const v = new Validator(req.body, {
        productId: validations.product.id,
        // productName: validations.general.requiredString,
        // rank: validations.general.requiredInt,
        // "subCategories.*.subCategoryId": validations.category.subcategoryId,
        // "categories.*.categoryId": validations.category.id,
        // "productImage.*.image": validations.general.requiredString,
        // // skuId: validations.product.skuId,
        // rank: validations.general.requiredInt,
        // units: validations.general.requiredInt,
        // price: validations.general.requiredNumeric,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        productName: validations.general.requiredString,
        rank: validations.general.requiredInt,
        "subCategories.*.subCategoryId": validations.category.subcategoryId,
        "categories.*.categoryId": validations.category.id,
        "productImage.*.image": validations.general.requiredString,
        skuId: validations.product.skuId,
        rank: validations.general.requiredInt,
        units: validations.general.requiredInt,
        price: validations.general.requiredNumeric,
      });

      validate(v, res, next, req);
    }
  };

  const validateCityId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.cityId = id;
    }

    const v = new Validator(req.params, {
      id: validations.city.id,
    });

    validate(v, res, next, req);
  };

  const validateCity = async (req, res, next) => {
    let { cityId } = req.body;

    if (cityId) {
      const v = new Validator(req.body, {
        cityId: validations.city.id,
        city: validations.general.requiredString,
        state: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        city: validations.general.requiredString,
        state: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateSuppliersId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.supplierId = id;
    }

    const v = new Validator(req.params, {
      id: validations.supplier.id,
    });

    validate(v, res, next, req);
  };

  const validateSuppliers = async (req, res, next) => {
    let { supplierId } = req.body;

    if (supplierId) {
      const v = new Validator(req.body, {
        supplierId: validations.supplier.id,
        email: validations.general.requiredString,
        mobileNumber: validations.general.requiredString,
        // countryCode: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        email: validations.general.requiredString,
        mobileNumber: validations.general.requiredString,
        // countryCode: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateSupplierOrders = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.order.id,
      supplierId: validations.supplier.id,
      "products.*.productId": validations.product.id,
      "products.*.noOfUnits": validations.general.requiredNumeric,
    });

    validate(v, res, next, req);
  };

  const validateFAQId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.faqId = id;
    }

    const v = new Validator(req.params, {
      id: validations.faqs.id,
    });

    validate(v, res, next, req);
  };

  const validateFAQ = async (req, res, next) => {
    let { faqId } = req.body;

    if (faqId) {
      const v = new Validator(req.body, {
        faqId: validations.faqs.id,
        question: validations.general.requiredString,
        answer: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        question: validations.general.requiredString,
        answer: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateCouponCodeId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.couponCodeId = id;
    }

    const v = new Validator(req.params, {
      id: validations.couponCode.id,
    });

    validate(v, res, next, req);
  };

  const validateCouponCode = async (req, res, next) => {
    let { couponCodeId } = req.body;

    if (couponCodeId) {
      const v = new Validator(req.body, {
        couponCodeId: validations.couponCode.id,
        name: validations.general.requiredString,
        description: validations.general.requiredString,
        couponCode: validations.general.requiredString,
        // paymentMode: validations.general.requiredInt,
        offerType: validations.general.requiredInt,
        // discount: validations.general.requiredInt,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        name: validations.general.requiredString,
        description: validations.general.requiredString,
        couponCode: validations.general.requiredString,
        offerType: validations.general.requiredInt,
        // discount: validations.general.requiredInt,
        // paymentMode: validations.general.requiredInt,
      });

      validate(v, res, next, req);
    }
  };

  const validateSaleReport = async (req, res, next) => {
    const v = new Validator(req.query, {
      filterBy: validations.general.required,
    });

    validate(v, res, next, req);
  };

  const validateUsers = async (req, res, next) => {
    let { userId } = req.body;

    if (userId) {
      const v = new Validator(req.body, {
        userId: validations.user.id,
        fullName: validations.general.requiredString,
        email: validations.general.requiredString,
        mobileNumber: validations.general.requiredString,
        // countryCode: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        fullName: validations.general.requiredString,
        email: validations.general.requiredString,
        mobileNumber: validations.general.requiredString,
        // countryCode: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  const validateOderId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.orderId = id;
    }

    const v = new Validator(req.params, {
      id: validations.order.id,
    });

    validate(v, res, next, req);
  };

  const validateSupplierOderId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.supplierOrderId = id;
    }

    const v = new Validator(req.params, {
      id: validations.supplierOrder.id,
    });

    validate(v, res, next, req);
  };

  const validateOrderStatus = async (req, res, next) => {
    const v = new Validator(req.body, {
      status: validations.general.requiredNumeric,
      // address: validations.general.requiredString,
      // event: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateBrandId = async (req, res, next) => {
    let { id } = req.params;

    if (id) {
      req.body.brandId = id;
    }

    const v = new Validator(req.params, {
      id: validations.brand.id,
    });

    validate(v, res, next, req);
  };

  const validateBrand = async (req, res, next) => {
    let { brandId } = req.body;

    if (brandId) {
      const v = new Validator(req.body, {
        brandId: validations.brand.id,
        brand: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    } else {
      const v = new Validator(req.body, {
        brand: validations.general.requiredString,
        // image: validations.general.requiredString,
      });

      validate(v, res, next, req);
    }
  };

  /**
   * Seller Products Validators
   */

  const validateSellerProductId = async (req, res, next) => {
    let { id } = req.params;

    const v = new Validator(req.params, {
      id: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateSellerProductCreate = async (req, res, next) => {
    const v = new Validator(req.body, {
      productName: validations.general.requiredString,
      categoryId: validations.general.requiredString,
      price: "required|numeric|min:0",
      stock: "required|numeric|min:0",
      description: "required|string",
    });

    validate(v, res, next, req);
  };

  const validateSellerProductUpdate = async (req, res, next) => {
    const v = new Validator(req.body, {
      productName: "string|maxLength:255",
      price: "numeric|min:0",
      stock: "numeric|min:0",
      description: "string",
      isActive: "boolean",
    });

    validate(v, res, next, req);
  };

  const validateSellerProductList = async (req, res, next) => {
    // Optional validation - all params are optional for filtering
    next();
  };

  /**
   * Order Validators
   */

  const validateCreateOrder = async (req, res, next) => {
    const v = new Validator(req.body, {
      addressId: validations.general.requiredString,
      paymentMode: "required|string|in:cod,online",
    });

    validate(v, res, next, req);
  };

  const validatePlaceOrder = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      addressId: validations.general.requiredString,
      paymentMode: "required|string|in:cod,online",
    });

    validate(v, res, next, req);
  };

  const validatePaymentOrder = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      amount: "required|numeric",
    });

    validate(v, res, next, req);
  };

  const validatePaymentVerify = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      razorpayPaymentId: validations.general.requiredString,
      razorpayOrderId: validations.general.requiredString,
      razorpaySignature: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateOrderId = async (req, res, next) => {
    const v = new Validator(req.params, {
      id: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateCancelOrder = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      cancelReason: "string|maxLength:500",
    });

    validate(v, res, next, req);
  };

  const validateReturnOrder = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      returnReason: "string|maxLength:500",
    });

    validate(v, res, next, req);
  };

  const validateUpdateOrderStatus = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      status:
        "required|string|in:pending,confirmed,processing,shipped,delivered,cancelled",
    });

    validate(v, res, next, req);
  };

  const validateUpdateTracking = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      trackingNumber: validations.general.requiredString,
      estimatedDeliveryDate: "date",
    });

    validate(v, res, next, req);
  };

  const validateCreateAgent = async (req, res, next) => {
    const v = new Validator(req.body, {
      name: validations.general.requiredString,
      mobile: "required|string|minLength:10|maxLength:15",
      vehicleNumber: "string|maxLength:20",
      notes: "string|maxLength:200",
    });

    validate(v, res, next, req);
  };

  const validateUpdateAgent = async (req, res, next) => {
    const v = new Validator(req.body, {
      name: "string|minLength:1",
      mobile: "string|minLength:10|maxLength:15",
      vehicleNumber: "string|maxLength:20",
      notes: "string|maxLength:200",
      isActive: "boolean",
    });

    validate(v, res, next, req);
  };

  const validateAssignAgent = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      agentId: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateSellerAction = async (req, res, next) => {
    // sellerId is injected by verifySellerToken as an ObjectId — do not validate it here
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      reason: "string|maxLength:500",
    });

    validate(v, res, next, req);
  };

  const validateSendDeliveryOtp = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateSellerVerifyDeliveryOtp = async (req, res, next) => {
    // sellerId middleware se ObjectId ke roop me aata hai — yahan validate nahi karna
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      otp: "required|string",
    });

    validate(v, res, next, req);
  };

  const validateVerifyDeliveryOtp = async (req, res, next) => {
    const v = new Validator(req.body, {
      orderId: validations.general.requiredString,
      sellerId: validations.general.requiredString,
      otp: "required|string",
    });

    validate(v, res, next, req);
  };

  /**
   * Coupon Validators
   */

  const validateCreateCoupon = async (req, res, next) => {
    const v = new Validator(req.body, {
      code: validations.general.requiredString,
      title: validations.general.requiredString,
      discountType: "required|string|in:percentage,fixed",
      discountValue:
        req.body.discountType === "percentage"
          ? "required|numeric|min:0|max:100"
          : "required|numeric|min:0",
      startDate: "date",
      endDate: "date",
      applicableFor: "string|in:all,newUser,specificUser",
      paymentMode: "string|in:online,cod,both",
    });

    validate(v, res, next, req);
  };

  const validateUpdateCoupon = async (req, res, next) => {
    const v = new Validator(req.body, {
      code: "string|maxLength:50",
      title: "string|maxLength:255",
      discountType: "string|in:percentage,fixed",
      discountValue:
        req.body.discountType === "percentage"
          ? "numeric|min:0|max:100"
          : "numeric|min:0",
      startDate: "date",
      endDate: "date",
      minOrderValue: "numeric|min:0",
      maxDiscountAmount: "numeric|min:0",
      applicableFor: "string|in:all,newUser,specificUser",
      paymentMode: "string|in:online,cod,both",
      isActive: "boolean",
    });

    validate(v, res, next, req);
  };

  const validateCouponId = async (req, res, next) => {
    const v = new Validator(req.params, {
      id: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateApplyCoupon = async (req, res, next) => {
    const v = new Validator(req.body, {
      code: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };
  /**
   * Offer Validators
   */
  const validateCreateOffer = async (req, res, next) => {
    const v = new Validator(req.body, {
      title: validations.general.requiredString,
      offerType: validations.general.requiredString,
      priceStartsAt: validations.general.requiredNumeric,
      // image: validations.general.requiredString, // comes via req.files, not req.body
      startDate: validations.general.requiredString,
      endDate: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };

  const validateUpdateOffer = async (req, res, next) => {
    // All fields are optional for updates
    const v = new Validator(req.body, {
      title: "string",
      offerType: "string",
      priceStartsAt: "numeric",
      // image: "string", // comes via req.files, not req.body
      startDate: "string",
      endDate: "string",
    });

    validate(v, res, next, req);
  };

  const validateOfferId = async (req, res, next) => {
    const v = new Validator(req.params, {
      id: validations.general.requiredString,
    });

    validate(v, res, next, req);
  };
  return {
    validateSaleReport,
    validateAdminLogin,
    validateUpdateStatus,
    validateGetUserType,
    validateUser,
    validateAdmin,
    validateOtp,
    validateResetPassword,
    validateChangePassword,
    validateCategoryId,
    validateCategory,
    validateSubCategory,
    validateSubCategoryId,
    validateBanner,
    validateBannerId,
    validateProducts,
    validateProductsId,
    validateCity,
    validateCityId,
    validateSuppliers,
    validateSuppliersId,
    validateProductRating,
    validateProductRatingId,
    validateFAQ,
    validateFAQId,
    validateCouponCode,
    validateCouponCodeId,
    validateUsers,
    validateUserId,
    validateOderId,
    validateBrand,
    validateBrandId,
    validateOrderStatus,
    validateSupplierOrders,
    validateSupplierOderId,
    validateSellerProductId,
    validateSellerProductCreate,
    validateSellerProductUpdate,
    validateSellerProductList,
    validateCreateOrder,
    validatePlaceOrder,
    validatePaymentOrder,
    validatePaymentVerify,
    validateOrderId,
    validateCancelOrder,
    validateReturnOrder,
    validateUpdateOrderStatus,
    validateSellerAction,
    validateSendDeliveryOtp,
    validateSellerVerifyDeliveryOtp,
    validateVerifyDeliveryOtp,
    validateUpdateTracking,
    validateCreateAgent,
    validateUpdateAgent,
    validateAssignAgent,
    validateCreateCoupon,
    validateUpdateCoupon,
    validateCouponId,
    validateApplyCoupon,
    validateCreateOffer,
    validateUpdateOffer,
    validateOfferId,
  };
};
