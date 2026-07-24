const AppFeedback = require("../models/AppFeedback");
const fileUploadService = require("../util/s3");

module.exports = () => {
  const submitFeedback = async (req, res, next) => {
    console.log("FeedbackController => submitFeedback");
    let { userId, rating, message } = req.body;

    if (!rating) {
      req.rCode = 0;
      req.msg = "rating_required";
      return next();
    }

    // Optional photos — multipart me `images` single file ya array ho sakta hai
    const images = [];
    if (req.files && req.files.images) {
      const files = Array.isArray(req.files.images)
        ? req.files.images
        : [req.files.images];
      for (const file of files) {
        const uploadRes = await fileUploadService.uploadFileToAws(file);
        if (Array.isArray(uploadRes.images)) {
          uploadRes.images.forEach((url) => images.push(url));
        } else if (uploadRes.images) {
          images.push(uploadRes.images);
        }
      }
    }

    const feedback = await AppFeedback.create({ userId, rating, message, images });

    req.rData = feedback;
    req.msg = "feedback_submitted";
    next();
  };

  return {
    submitFeedback,
  };
};
