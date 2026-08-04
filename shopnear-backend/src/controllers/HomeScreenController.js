module.exports = () => {
  const OffersService = require("../services/OffersService")();
  const HomeScreenService = require("../services/HomeScreenService")();

  const homeScreen = async (req, res, next) => {
    console.log("HomeScreenController => homeScreen");

    try {
      // Get user location from request (if provided)
      const userLat = req.query.lat || null;
      const userLng = req.query.lng || null;

      // Fetch all home screen data from database in parallel
      // AuthMiddleware verify hone par userId req.body me daal deta hai
      const userId = req.body && req.body.userId;

      const homeData = await HomeScreenService.getCompleteHomeScreenData(
        userLat,
        userLng,
        userId
      );
      const offers = await OffersService.getHomePageOffers();

      req.rData = {
        // Wallet balance - user ke record se
        wallet: homeData.wallet,

        // Home header background (admin se set, image/video) - null = app default
        headerBg: homeData.headerBg,

        // Delivery Info - Dynamic from database
        delivery: homeData.delivery,

        // Banners - Dynamic from database
        banners: homeData.banners,

        // Shop Categories - Dynamic from database
        categories: homeData.categories,

        // Nearby Shops/Sellers - Dynamic from database
        nearbyShops: homeData.nearbyShops,

        // Dynamic Offers - From OffersService
        offers: offers,

        // Popular Brands - Dynamic from database
        brands: homeData.brands,

        // Promo Codes - Dynamic from database
        promoCodes: homeData.promoCodes,
      };

      req.msg = "success";
      next();
    } catch (error) {
      console.error("Error in homeScreen:", error);
      req.error = error.message || "Failed to fetch home screen data";
      next();
    }
  };

  return {
    homeScreen,
  };
};
