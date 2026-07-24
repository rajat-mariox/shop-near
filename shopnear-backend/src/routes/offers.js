const router = require("express").Router();
const OffersController = require("../controllers/OffersController")();
const ErrorHandlerMiddleware = require("../middlewares/ErrorHandlerMiddleware");
const ResponseMiddleware = require("../middlewares/ResponseMiddleware");
const AuthMiddleware = require("../middlewares/AuthMiddleware");
const AdminValidator = require("../validators/AdminValidator");

/**
 * ==================== CUSTOMER OFFERS ROUTES ====================
 */

// Get home page offers (active and displayable)
router.get(
  "/home",
  ErrorHandlerMiddleware(OffersController.getHomePageOffers),
  ResponseMiddleware
);

// Get offers by category
router.get(
  "/category/:categoryId",
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.getOffersByCategory),
  ResponseMiddleware
);

// Get offers by brand
router.get(
  "/brand/:brandId",
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.getOffersByBrand),
  ResponseMiddleware
);

// Get offers by product
router.get(
  "/product/:productId",
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.getOffersByProduct),
  ResponseMiddleware
);

/**
 * ==================== ADMIN OFFERS ROUTES ====================
 */

// Create offer
router.post(
  "/admin/create",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateCreateOffer,
  ErrorHandlerMiddleware(OffersController.createOffer),
  ResponseMiddleware
);

// Get all offers
router.get(
  "/admin/list",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(OffersController.getAllOffers),
  ResponseMiddleware
);

// Get offer detail
router.get(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.getOfferDetail),
  ResponseMiddleware
);

// Update offer
router.put(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateOfferId,
  AdminValidator().validateUpdateOffer,
  ErrorHandlerMiddleware(OffersController.updateOffer),
  ResponseMiddleware
);

// Delete offer
router.delete(
  "/admin/:id",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.deleteOffer),
  ResponseMiddleware
);

// Toggle offer status
router.patch(
  "/admin/:id/toggle",
  AuthMiddleware().verifyAdminToken,
  AdminValidator().validateOfferId,
  ErrorHandlerMiddleware(OffersController.toggleOfferStatus),
  ResponseMiddleware
);

// Get offer statistics
router.get(
  "/admin/stats/overview",
  AuthMiddleware().verifyAdminToken,
  ErrorHandlerMiddleware(OffersController.getOfferStats),
  ResponseMiddleware
);

module.exports = router;
