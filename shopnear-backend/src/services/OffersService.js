const Offers = require("../models/Offers");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = () => {
  /**
   * Create Offer (Admin)
   */
  const createOffer = (offerData) => {
    return new Promise(function (resolve, reject) {
      let orm = Offers.create(offerData);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get All Offers (Admin)
   */
  const getAllOffers = (query, page, limit) => {
    return new Promise(function (resolve, reject) {
      page = page ? parseInt(page) : 1;
      limit = limit ? parseInt(limit) : 10;

      let orm = Offers.find(query)
        .populate("categories", "name")
        .populate("brands", "brand")
        .populate("products", "productName")
        .select("-__v")
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Count All Offers
   */
  const countAllOffers = (query) => {
    return new Promise(function (resolve, reject) {
      let orm = Offers.countDocuments(query);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Offer by ID
   */
  const getOfferById = (offerId) => {
    return new Promise(function (resolve, reject) {
      let orm = Offers.findById(offerId)
        .populate("categories", "name")
        .populate("brands", "brand")
        .populate("products", "productName");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Update Offer
   */
  const updateOffer = (offerId, updateData) => {
    return new Promise(function (resolve, reject) {
      let orm = Offers.findByIdAndUpdate(offerId, updateData, { new: true })
        .populate("categories", "name")
        .populate("brands", "brand")
        .populate("products", "productName");

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Delete Offer
   */
  const deleteOffer = (offerId) => {
    return new Promise(function (resolve, reject) {
      let orm = Offers.findByIdAndDelete(offerId);
      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Active Offers for Home Page
   * Only returns offers that:
   * - Are active
   * - Should display on home
   * - Are within date range
   * Sorted by priority (descending)
   */
  const getHomePageOffers = () => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Offers.find({
        isActive: true,
        displayOnHome: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .populate("categories", "name")
        .populate("brands", "brand")
        .populate("products", "productName")
        .select(
          "title description offerType priceStartsAt image bgColor bgColorEnd discountPercentage discountAmount startDate endDate"
        )
        .sort({ priority: -1, createdAt: -1 })
        .limit(10);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Offers by Category
   */
  const getOffersByCategory = (categoryId) => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Offers.find({
        categories: categoryId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .select(
          "title description priceStartsAt image bgColor discountPercentage discountAmount"
        )
        .sort({ priority: -1 });

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Offers by Brand
   */
  const getOffersByBrand = (brandId) => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Offers.find({
        brands: brandId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .select(
          "title description priceStartsAt image bgColor discountPercentage discountAmount"
        )
        .sort({ priority: -1 });

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Offers by Product
   */
  const getOffersByProduct = (productId) => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Offers.find({
        products: productId,
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
        .select(
          "title description priceStartsAt image bgColor discountPercentage discountAmount"
        )
        .sort({ priority: -1 });

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Toggle Offer Status
   */
  const toggleOfferStatus = (offerId) => {
    return new Promise(function (resolve, reject) {
      Offers.findById(offerId)
        .then((offer) => {
          if (!offer) {
            return reject(new Error("Offer not found"));
          }

          offer.isActive = !offer.isActive;
          return offer.save();
        })
        .then(resolve)
        .catch(reject);
    });
  };

  /**
   * Get Offer Statistics
   */
  const getOfferStats = () => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      Promise.all([
        Offers.countDocuments({ isActive: true }),
        Offers.countDocuments({
          isActive: true,
          displayOnHome: true,
          startDate: { $lte: now },
          endDate: { $gte: now },
        }),
        Offers.countDocuments({
          endDate: { $lt: now },
        }),
      ])
        .then(([activeCount, activeHomeCount, expiredCount]) => {
          resolve({
            totalActive: activeCount,
            activeOnHome: activeHomeCount,
            expiredOffers: expiredCount,
          });
        })
        .catch(reject);
    });
  };

  return {
    createOffer,
    getAllOffers,
    countAllOffers,
    getOfferById,
    updateOffer,
    deleteOffer,
    getHomePageOffers,
    getOffersByCategory,
    getOffersByBrand,
    getOffersByProduct,
    toggleOfferStatus,
    getOfferStats,
  };
};
