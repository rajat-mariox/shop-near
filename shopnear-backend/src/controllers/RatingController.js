const RatingService = require("../services/RatingService");
const PanelNotificationService = require("../services/PanelNotificationService");
const fileUploadService = require("../util/s3");
var ObjectId = require("mongoose").Types.ObjectId;

module.exports = () => {
  const submitRating = async (req, res, next) => {
    console.log("RatingController => submitRating");

    let { productId } = req.params;
    let { userId, orderId, rating, reviewText } = req.body;

    if (!orderId || !rating) {
      req.rCode = 0;
      req.msg = "orderId_and_rating_required";
      return next();
    }

    const order = await RatingService().findOrderForRating(
      orderId,
      userId,
      productId
    );
    if (!order) {
      req.rCode = 0;
      req.msg = "order_not_eligible_for_rating";
      return next();
    }

    const alreadyRated = await RatingService().hasUserRatedOrder(
      orderId,
      userId,
      productId
    );
    if (alreadyRated) {
      req.rCode = 0;
      req.msg = "already_rated";
      return next();
    }

    const sellerId = order.products.find(
      (p) => p.productId.toString() === productId
    )?.sellerId;

    // Review photos (multipart field "images", app ke FeedbackScreen se) -> S3
    const reviewImages = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        const urls = Array.isArray(uploadRes.images)
          ? uploadRes.images
          : [uploadRes.images];
        urls.forEach((url) => reviewImages.push({ url }));
      }
    }

    const newRating = await RatingService().addRating({
      userId,
      productId,
      orderId,
      sellerId,
      rating,
      reviewText,
      reviewImages,
    });

    // Seller panel bell: naya review
    PanelNotificationService().newReview(newRating, productId);

    req.rData = newRating;
    req.msg = "rating_submitted";
    next();
  };

  const getProductRatings = async (req, res, next) => {
    console.log("RatingController => getProductRatings");

    let { productId } = req.params;
    let { page, limit } = req.query;
    page = page ? parseInt(page) : 1;
    limit = limit ? parseInt(limit) : 10;

    const productObjectId = new ObjectId(productId);

    const ratings = await RatingService().getProductRatings(
      productObjectId,
      page,
      limit
    );
    const total = await RatingService().countProductRatings(productObjectId);
    const summary = await RatingService().getProductRatingAverage(
      productObjectId
    );
    const distribution = await RatingService().getProductRatingDistribution(
      productObjectId
    );

    req.rData = {
      page,
      limit,
      total,
      averageRating: summary.avg || 0,
      totalRatings: summary.total || 0,
      // {5: n, 4: n, ...} — app ke review bars ke liye
      distribution,
      ratings,
    };
    req.msg = "success";
    next();
  };

  return {
    submitRating,
    getProductRatings,
  };
};
