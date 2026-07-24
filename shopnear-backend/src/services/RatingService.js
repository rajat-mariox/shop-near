const Rating = require("../models/Rating");
const UserOrders = require("../models/UserOrders");
const Product = require("../models/Product");

module.exports = () => {
  const findOrderForRating = (orderId, userId, productId) => {
    return new Promise(function (resolve, reject) {
      UserOrders.findOne({
        _id: orderId,
        userId,
        status: "delivered",
        "products.productId": productId,
      })
        .then(resolve)
        .catch(reject);
    });
  };

  const hasUserRatedOrder = (orderId, userId, productId) => {
    return new Promise(function (resolve, reject) {
      Rating.findOne({ orderId, userId, productId })
        .then(resolve)
        .catch(reject);
    });
  };

  const addRating = async (data) => {
    const created = await Rating.create(data);

    // Product document ke aggregate fields sync karo — product list/detail
    // inhi static fields (rating, totalRatings) se dikhate hain
    const agg = await Rating.aggregate([
      { $match: { productId: created.productId, isActive: true } },
      { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
    ]);
    const { avg = 0, total = 0 } = agg[0] || {};
    await Product.findByIdAndUpdate(created.productId, {
      rating: Math.round(avg * 10) / 10,
      totalRatings: total,
    });

    return created;
  };

  const getProductRatings = (productId, page, limit) => {
    return new Promise(function (resolve, reject) {
      Rating.find({ productId, isActive: true })
        .populate("userId", "fullName")
        .select("-__v")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .then(resolve)
        .catch(reject);
    });
  };

  const countProductRatings = (productId) => {
    return new Promise(function (resolve, reject) {
      Rating.countDocuments({ productId, isActive: true })
        .then(resolve)
        .catch(reject);
    });
  };

  // Har star (1-5) ke kitne ratings hain — app me review bars ke liye
  const getProductRatingDistribution = (productId) => {
    return new Promise(function (resolve, reject) {
      Rating.aggregate([
        { $match: { productId, isActive: true } },
        { $group: { _id: "$rating", count: { $sum: 1 } } },
      ])
        .then((rows) => {
          const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          rows.forEach((row) => {
            distribution[row._id] = row.count;
          });
          resolve(distribution);
        })
        .catch(reject);
    });
  };

  const getProductRatingAverage = (productId) => {
    return new Promise(function (resolve, reject) {
      Rating.aggregate([
        { $match: { productId, isActive: true } },
        { $group: { _id: null, avg: { $avg: "$rating" }, total: { $sum: 1 } } },
      ])
        .then((result) =>
          resolve(result[0] || { avg: 0, total: 0 })
        )
        .catch(reject);
    });
  };

  return {
    findOrderForRating,
    hasUserRatedOrder,
    addRating,
    getProductRatings,
    countProductRatings,
    getProductRatingAverage,
    getProductRatingDistribution,
  };
};
