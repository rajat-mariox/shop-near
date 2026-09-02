const SellerService = require("../services/SellerService");
const ProductService = require("../services/ProductService");
const Products = require("../models/Product");
const fileUploadService = require("../util/s3");
var ObjectId = require("mongoose").Types.ObjectId;

// simple regex escape (similar to used in UserController)
const RegexEscape = (s) =>
  s ? s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") : s;

module.exports = () => {
  /**
   * List of Sellers (Admin)
   */
  const getAllSellerList = async (req, res, next) => {
    console.log("SellerController => getAllSellerList");
    let { search, page, limit, status, isActive } = req.query;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    let query = { isDeleted: { $ne: true } };

    if (status) {
      query.status = status; // pending_profile / pending_approval / approved / rejected
    }

    if (typeof isActive !== "undefined") {
      query.isActive =
        isActive === "true" || isActive === 1 || isActive === "1";
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: RegexEscape(search), $options: "i" } },
        { mobile: { $regex: RegexEscape(search), $options: "i" } },
        { shopName: { $regex: RegexEscape(search), $options: "i" } },
      ];
    }

    let sellers = await SellerService().getSellers(query, page, limit);
    let total_seller = await SellerService().countSellers(query);

    req.msg = "sellers_list";
    req.rData = {
      search,
      status,
      isActive,
      page,
      limit,
      total_seller,
      sellers,
    };

    next();
  };

  /**
   * Seller Details (for Seller App or Admin)
   */
  const getDetails = async (req, res, next) => {
    console.log("SellerController => getDetails");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let seller = await SellerService().fetch(finalId);

    if (seller) {
      req.msg = "success";
      req.rData = seller;
    } else {
      req.rCode = 5;
      req.msg = "seller_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * Edit Seller Profile (Owner + Shop + Location + Images)
   * Used from Seller App
   */
  const editSellerProfile = async (req, res, next) => {
    console.log("SellerController => editSellerProfile");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let updateData = { ...req.body };

    // ----- OWNER IMAGE -----
    if (req.files && req.files.ownerImage) {
      const file = req.files.ownerImage;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      updateData.ownerImage = uploadRes.images;
    }

    // ----- SHOP LOGO -----
    if (req.files && req.files.shopLogo) {
      const file = req.files.shopLogo;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      updateData.shopLogo = uploadRes.images;
    }

    // ----- MULTIPLE SHOP IMAGES -----
    if (req.files && req.files.shopImages) {
      // can be single or array
      const files = Array.isArray(req.files.shopImages)
        ? req.files.shopImages
        : [req.files.shopImages];

      let imagesArr = [];

      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        // assuming uploadRes.images is url or array
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => imagesArr.push({ url }));
        } else {
          imagesArr.push({ url: uploadRes.images });
        }
      }

      updateData.shopImages = imagesArr;
    }

    // ----- LOCATION (lat, lng) -----
    if (updateData.lat) updateData.lat = parseFloat(updateData.lat);
    if (updateData.lng) updateData.lng = parseFloat(updateData.lng);

    await SellerService().updateSeller(finalId, updateData);

    req.rData = {};
    req.msg = "success";
    next();
  };

  /**
   * Update KYC (GST / Aadhaar / PAN + Images)
   */
  const updateKyc = async (req, res, next) => {
    console.log("SellerController => updateKyc");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let updateData = {};

    let {
      gstNumber,
      aadhaarNumber,
      panNumber,
      gstVerified, // optional boolean
    } = req.body;

    if (gstNumber) updateData.gstNumber = gstNumber;
    if (aadhaarNumber) updateData.aadhaarNumber = aadhaarNumber;
    if (panNumber) updateData.panNumber = panNumber;

    if (typeof gstVerified !== "undefined") {
      updateData.gstVerified =
        gstVerified === true ||
        gstVerified === "true" ||
        gstVerified === 1 ||
        gstVerified === "1";
    }

    // GST certificate image
    if (req.files && req.files.gstCertificate) {
      const file = req.files.gstCertificate;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      updateData.gstCertificate = uploadRes.images;
    }

    // Aadhaar image
    if (req.files && req.files.aadhaarImage) {
      const file = req.files.aadhaarImage;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      updateData.aadhaarImage = uploadRes.images;
    }

    // PAN image
    if (req.files && req.files.panImage) {
      const file = req.files.panImage;
      const uploadRes = await fileUploadService.uploadFileToAws(file);
      updateData.panImage = uploadRes.images;
    }

    await SellerService().updateSeller(finalId, updateData);

    req.rData = {};
    req.msg = "success";
    next();
  };

  /**
   * Update Bank Details
   */
  const updateBankDetails = async (req, res, next) => {
    console.log("SellerController => updateBankDetails");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let { accountHolder, accountNumber, ifsc, bankName, upi, upiVerified } =
      req.body;

    let bankDetails = {};

    if (accountHolder) bankDetails.accountHolder = accountHolder;
    if (accountNumber) bankDetails.accountNumber = accountNumber;
    if (ifsc) bankDetails.ifsc = ifsc;
    if (bankName) bankDetails.bankName = bankName;
    if (upi) bankDetails.upi = upi;
    if (typeof upiVerified !== "undefined") {
      bankDetails.upiVerified =
        upiVerified === true ||
        upiVerified === "true" ||
        upiVerified === 1 ||
        upiVerified === "1";
    }

    await SellerService().updateSeller(finalId, { bankDetails });

    req.rData = {};
    req.msg = "success";
    next();
  };

  /**
   * Update Shop Timing
   */
  const updateShopTiming = async (req, res, next) => {
    console.log("SellerController => updateShopTiming");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let { openingTime, closingTime, weeklyOff } = req.body;

    let updateData = {};
    if (openingTime) updateData.openingTime = openingTime;
    if (closingTime) updateData.closingTime = closingTime;
    if (weeklyOff) updateData.weeklyOff = weeklyOff;

    await SellerService().updateSeller(finalId, updateData);

    req.rData = {};
    req.msg = "success";
    next();
  };

  /**
   * Activate / Deactivate Seller
   * (Admin)
   */
  const activateDeactivateSeller = async (req, res, next) => {
    console.log("SellerController => activateDeactivateSeller");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let seller = await SellerService().fetch(finalId);

    if (!seller) {
      req.rCode = 5;
      req.msg = "seller_not_found";
      req.rData = {};
      return next();
    }

    let isActive = !seller.isActive;
    await SellerService().updateSeller(finalId, { isActive });

    req.msg = "status_changed";
    req.rData = { isActive };
    next();
  };

  /**
   * Permanent Delete Seller (Admin)
   * Seller record DB se hamesha ke liye delete — number dobara fresh
   * register ho sakta hai. Products soft-delete hote hain taaki purani
   * orders ka data na toote, par app me dikhna band ho jayen.
   */
  const deleteSeller = async (req, res, next) => {
    console.log("SellerController => deleteSeller");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    await Products.updateMany(
      { sellerId: new ObjectId(finalId) },
      { isDeleted: true, isActive: false }
    );

    await SellerService().deleteSeller(finalId);

    req.msg = "success";
    req.rData = {};
    next();
  };

  /**
   * Approve Seller (Admin)
   */
  const approveSeller = async (req, res, next) => {
    console.log("SellerController => approveSeller");
    let { sellerId } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let seller = await SellerService().updateSeller(finalId, {
      status: "approved",
      approvedAt: new Date(),
      rejectedAt: null,
      rejectedReason: "",
    });

    req.msg = "seller_approved";
    req.rData = seller;
    next();
  };

  /**
   * ==================== SELLER PRODUCTS ====================
   */

  /**
   * List Seller Products with filters
   * Filters: category, dateRange, priceRange, status, stock, rating
   */
  const listSellerProducts = async (req, res, next) => {
    console.log("SellerController => listSellerProducts");
    let { page, limit, categoryId, startDate, endDate, minPrice, maxPrice, isActive, search } = req.query;
    let { sellerId } = req.body;

    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const finalSellerId = sellerId || req.user?._id;

    let query = { shopId: new ObjectId(finalSellerId), isDeleted: { $ne: true } };

    // Filter by category
    if (categoryId) {
      query.categoryId = new ObjectId(categoryId);
    }

    // Filter by date range
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

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) {
        query.price.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        query.price.$lte = parseFloat(maxPrice);
      }
    }

    // Filter by stock
    if (req.query.stock) {
      const stockFilter = parseInt(req.query.stock);
      if (stockFilter === 0) {
        query.stock = 0; // Out of stock
      } else if (stockFilter === 1) {
        query.stock = { $gt: 0 }; // In stock
      }
    }

    // Filter by status
    if (typeof isActive !== "undefined") {
      query.isActive = isActive === "true" || isActive === 1 || isActive === "1";
    }

    // Filter by rating
    if (req.query.rating) {
      const rating = parseFloat(req.query.rating);
      query.rating = { $gte: rating };
    }

    // Search by product name or description
    if (search) {
      query.$or = [
        { productName: { $regex: RegexEscape(search), $options: "i" } },
        { description: { $regex: RegexEscape(search), $options: "i" } },
      ];
    }

    let products = await ProductService().getSellerProducts(query, page, limit);
    let total_products = await ProductService().countSellerProducts(query);

    req.msg = "products_list";
    req.rData = {
      page,
      limit,
      total_products,
      products,
      filters: {
        categoryId,
        startDate,
        endDate,
        minPrice,
        maxPrice,
        isActive,
        search,
      },
    };

    next();
  };

  /**
   * Get Seller Product Detail
   */
  const getSellerProductDetail = async (req, res, next) => {
    console.log("SellerController => getSellerProductDetail");
    let { id } = req.params;
    let { sellerId } = req.body;

    const finalSellerId = sellerId || req.user?._id;

    let product = await ProductService().getSellerProductDetail(
      new ObjectId(id),
      new ObjectId(finalSellerId)
    );

    if (product) {
      req.msg = "success";
      req.rData = product;
    } else {
      req.rCode = 5;
      req.msg = "product_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * Create Seller Product
   */
  const createSellerProduct = async (req, res, next) => {
    console.log("SellerController => createSellerProduct");
    let { sellerId } = req.body;
    const finalSellerId = sellerId || req.user?._id;

    const seller = await SellerService().fetch(finalSellerId);
    if (!seller || seller.status !== "approved") {
      req.rCode = 0;
      req.msg = "seller_not_approved";
      return next();
    }

    let productData = { ...req.body };
    productData.shopId = new ObjectId(finalSellerId);

    // Handle product images
    if (req.files && req.files.productImages) {
      const files = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      let imagesArr = [];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => imagesArr.push({ url }));
        } else {
          imagesArr.push({ url: uploadRes.images });
        }
      }
      productData.productImages = imagesArr;
    }

    // Handle description images
    if (req.files && req.files.descriptionImages) {
      const files = Array.isArray(req.files.descriptionImages)
        ? req.files.descriptionImages
        : [req.files.descriptionImages];

      let imagesArr = [];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => imagesArr.push({ image: url }));
        } else {
          imagesArr.push({ image: uploadRes.images });
        }
      }
      productData.descriptionImages = imagesArr;
    }

    // Parse numeric fields
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.discountPrice)
      productData.discountPrice = parseFloat(productData.discountPrice);
    if (productData.discountPercent)
      productData.discountPercent = parseFloat(productData.discountPercent);
    if (productData.stock) productData.stock = parseInt(productData.stock);

    // Parse colors and sizes if they come as JSON strings
    if (typeof productData.colors === "string") {
      productData.colors = JSON.parse(productData.colors);
    }
    if (typeof productData.sizes === "string") {
      productData.sizes = JSON.parse(productData.sizes);
    }
    if (typeof productData.highlights === "string") {
      productData.highlights = JSON.parse(productData.highlights);
    }

    let product = await ProductService().createSellerProduct(productData);

    req.msg = "product_created";
    req.rData = product;
    next();
  };

  /**
   * Edit Seller Product
   */
  const editSellerProduct = async (req, res, next) => {
    console.log("SellerController => editSellerProduct");
    let { id } = req.params;
    let { sellerId } = req.body;

    const finalSellerId = sellerId || req.user?._id;

    let updateData = { ...req.body };
    delete updateData.sellerId;

    // Handle product images
    if (req.files && req.files.productImages) {
      const files = Array.isArray(req.files.productImages)
        ? req.files.productImages
        : [req.files.productImages];

      let imagesArr = [];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => imagesArr.push({ url }));
        } else {
          imagesArr.push({ url: uploadRes.images });
        }
      }
      updateData.productImages = imagesArr;
    }

    // Handle description images
    if (req.files && req.files.descriptionImages) {
      const files = Array.isArray(req.files.descriptionImages)
        ? req.files.descriptionImages
        : [req.files.descriptionImages];

      let imagesArr = [];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => imagesArr.push({ image: url }));
        } else {
          imagesArr.push({ image: uploadRes.images });
        }
      }
      updateData.descriptionImages = imagesArr;
    }

    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.discountPrice)
      updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.discountPercent)
      updateData.discountPercent = parseFloat(updateData.discountPercent);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);

    // Parse colors and sizes if they come as JSON strings
    if (typeof updateData.colors === "string") {
      updateData.colors = JSON.parse(updateData.colors);
    }
    if (typeof updateData.sizes === "string") {
      updateData.sizes = JSON.parse(updateData.sizes);
    }
    if (typeof updateData.highlights === "string") {
      updateData.highlights = JSON.parse(updateData.highlights);
    }

    let product = await ProductService().updateSellerProduct(
      new ObjectId(id),
      new ObjectId(finalSellerId),
      updateData
    );

    if (product) {
      req.msg = "product_updated";
      req.rData = product;
    } else {
      req.rCode = 5;
      req.msg = "product_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * Delete Seller Product (soft delete)
   */
  const deleteSellerProduct = async (req, res, next) => {
    console.log("SellerController => deleteSellerProduct");
    let { id } = req.params;
    let { sellerId } = req.body;

    const finalSellerId = sellerId || req.user?._id;

    let product = await ProductService().deleteSellerProduct(
      new ObjectId(id),
      new ObjectId(finalSellerId)
    );

    if (product) {
      req.msg = "product_deleted";
      req.rData = {};
    } else {
      req.rCode = 5;
      req.msg = "product_not_found";
      req.rData = {};
    }

    next();
  };

  /**
   * Admin Create Seller (with full details, auto-approved)
   */
  const adminCreateSeller = async (req, res, next) => {
    console.log("SellerController => adminCreateSeller");

    const {
      fullName, email, mobile, shopName, shopDescription,
      businessType, categories, address, street, city, pincode,
      gstNumber, openingTime, closingTime, weeklyOff,
    } = req.body;

    if (!mobile) {
      req.rCode = 0;
      req.msg = "mobile_required";
      req.rData = {};
      return next();
    }

    const existing = await SellerService().fetchByMobile(mobile);
    if (existing) {
      req.rCode = 0;
      req.msg = "seller_already_exists";
      req.rData = {};
      return next();
    }

    const sellerData = {
      fullName: fullName || "",
      email: email || "",
      mobile,
      shopName: shopName || "",
      shopDescription: shopDescription || "",
      businessType: businessType || "",
      categories: categories || [],
      address: address || "",
      street: street || "",
      city: city || "",
      pincode: pincode || "",
      gstNumber: gstNumber || "",
      openingTime: openingTime || "",
      closingTime: closingTime || "",
      weeklyOff: weeklyOff || "",
      isMobileVerified: true,
      status: "approved",
      isActive: true,
      approvedAt: new Date(),
    };

    const seller = await SellerService().createSeller(sellerData);

    req.msg = "seller_created";
    req.rData = seller;
    next();
  };

  /**
   * Reject Seller (Admin)
   */
  const rejectSeller = async (req, res, next) => {
    console.log("SellerController => rejectSeller");
    let { sellerId, reason } = req.body;
    let { id } = req.params;

    const finalId = sellerId || id;

    let seller = await SellerService().updateSeller(finalId, {
      status: "rejected",
      rejectedAt: new Date(),
      approvedAt: null,
      rejectedReason: reason || "",
    });

    req.msg = "seller_rejected";
    req.rData = seller;
    next();
  };

  return {
    /**
     * List / details
     */
    getAllSellerList,
    getDetails,

    /**
     * Seller self profile / shop
     */
    editSellerProfile,
    updateKyc,
    updateBankDetails,
    updateShopTiming,

    /**
     * Admin actions
     */
    activateDeactivateSeller,
    deleteSeller,
    approveSeller,
    rejectSeller,
    adminCreateSeller,

    /**
     * Seller Products
     */
    listSellerProducts,
    getSellerProductDetail,
    createSellerProduct,
    editSellerProduct,
    deleteSellerProduct,
  };
};
