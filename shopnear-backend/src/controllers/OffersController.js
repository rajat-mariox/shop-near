module.exports = () => {
  const OffersService = require("../services/OffersService")();
  const fileUploadService = require("../util/s3");

  /**
   * Create Offer (Admin)
   */
  const createOffer = async (req, res, next) => {
    try {
      console.log("OffersController => createOffer");

      const { title, offerType, priceStartsAt, bgColor, startDate, endDate } =
        req.body;

      let image = req.body.image;
      if (req.files && req.files.image) {
        const uploadRes = await fileUploadService.uploadFileToAws(
          req.files.image
        );
        image = uploadRes.images;
      }

      // Parse array fields
      const categories = req.body.categories
        ? JSON.parse(req.body.categories)
        : [];
      const brands = req.body.brands ? JSON.parse(req.body.brands) : [];
      const products = req.body.products ? JSON.parse(req.body.products) : [];

      const offerData = {
        title,
        description: req.body.description || "",
        offerType,
        priceStartsAt,
        discountPercentage: req.body.discountPercentage || null,
        discountAmount: req.body.discountAmount || null,
        image,
        bgColor,
        categories,
        brands,
        products,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive: req.body.isActive !== undefined ? req.body.isActive : true,
        displayOnHome:
          req.body.displayOnHome !== undefined ? req.body.displayOnHome : true,
        priority: req.body.priority || 0,
      };

      let result = await OffersService.createOffer(offerData);

      req.rData = {
        message: "Offer created successfully",
        offer: result,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get All Offers (Admin)
   */
  const getAllOffers = async (req, res, next) => {
    try {
      console.log("OffersController => getAllOffers");

      const { page = 1, limit = 10, search = "", isActive } = req.query;

      let query = {};

      if (search) {
        query.title = { $regex: search, $options: "i" };
      }

      if (isActive !== undefined) {
        query.isActive = isActive === "true";
      }

      const [offers, totalCount] = await Promise.all([
        OffersService.getAllOffers(query, page, limit),
        OffersService.countAllOffers(query),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      req.rData = {
        message: "Offers retrieved successfully",
        offers,
        pagination: {
          totalRecords: totalCount,
          totalPages,
          currentPage: parseInt(page),
          limit: parseInt(limit),
        },
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Offer Detail (Admin)
   */
  const getOfferDetail = async (req, res, next) => {
    try {
      console.log("OffersController => getOfferDetail");

      const { id } = req.params;

      const offer = await OffersService.getOfferById(id);

      if (!offer) {
        req.rData = {
          success: false,
          message: "Offer not found",
        };
        return next();
      }

      const stats = await OffersService.getOfferStats();

      req.rData = {
        message: "Offer retrieved successfully",
        offer,
        stats,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Update Offer (Admin)
   */
  const updateOffer = async (req, res, next) => {
    try {
      console.log("OffersController => updateOffer");

      const { id } = req.params;
      const updateData = { ...req.body };

      if (req.files && req.files.image) {
        const uploadRes = await fileUploadService.uploadFileToAws(
          req.files.image
        );
        updateData.image = uploadRes.images;
      }

      // Parse array fields if present
      if (updateData.categories) {
        updateData.categories =
          typeof updateData.categories === "string"
            ? JSON.parse(updateData.categories)
            : updateData.categories;
      }

      if (updateData.brands) {
        updateData.brands =
          typeof updateData.brands === "string"
            ? JSON.parse(updateData.brands)
            : updateData.brands;
      }

      if (updateData.products) {
        updateData.products =
          typeof updateData.products === "string"
            ? JSON.parse(updateData.products)
            : updateData.products;
      }

      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }

      if (updateData.endDate) {
        updateData.endDate = new Date(updateData.endDate);
      }

      const offer = await OffersService.updateOffer(id, updateData);

      if (!offer) {
        req.rData = {
          success: false,
          message: "Offer not found",
        };
        return next();
      }

      req.rData = {
        message: "Offer updated successfully",
        offer,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Delete Offer (Admin)
   */
  const deleteOffer = async (req, res, next) => {
    try {
      console.log("OffersController => deleteOffer");

      const { id } = req.params;

      const offer = await OffersService.deleteOffer(id);

      if (!offer) {
        req.rData = {
          success: false,
          message: "Offer not found",
        };
        return next();
      }

      req.rData = {
        message: "Offer deleted successfully",
        offer,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Toggle Offer Status (Admin)
   */
  const toggleOfferStatus = async (req, res, next) => {
    try {
      console.log("OffersController => toggleOfferStatus");

      const { id } = req.params;

      const offer = await OffersService.toggleOfferStatus(id);

      req.rData = {
        message: "Offer status updated successfully",
        offer,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Home Page Offers (Customer)
   * Returns active offers for home page display
   */
  const getHomePageOffers = async (req, res, next) => {
    try {
      console.log("OffersController => getHomePageOffers");

      const offers = await OffersService.getHomePageOffers();

      req.rData = {
        message: "Home page offers retrieved successfully",
        offers,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Offers by Category (Customer)
   */
  const getOffersByCategory = async (req, res, next) => {
    try {
      console.log("OffersController => getOffersByCategory");

      const { categoryId } = req.params;

      const offers = await OffersService.getOffersByCategory(categoryId);

      req.rData = {
        message: "Category offers retrieved successfully",
        offers,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Offers by Brand (Customer)
   */
  const getOffersByBrand = async (req, res, next) => {
    try {
      console.log("OffersController => getOffersByBrand");

      const { brandId } = req.params;

      const offers = await OffersService.getOffersByBrand(brandId);

      req.rData = {
        message: "Brand offers retrieved successfully",
        offers,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Offers by Product (Customer)
   */
  const getOffersByProduct = async (req, res, next) => {
    try {
      console.log("OffersController => getOffersByProduct");

      const { productId } = req.params;

      const offers = await OffersService.getOffersByProduct(productId);

      req.rData = {
        message: "Product offers retrieved successfully",
        offers,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Offer Statistics (Admin)
   */
  const getOfferStats = async (req, res, next) => {
    try {
      console.log("OffersController => getOfferStats");

      const stats = await OffersService.getOfferStats();

      req.rData = {
        message: "Offer statistics retrieved successfully",
        stats,
      };

      next();
    } catch (error) {
      throw error;
    }
  };

  return {
    createOffer,
    getAllOffers,
    getOfferDetail,
    updateOffer,
    deleteOffer,
    toggleOfferStatus,
    getHomePageOffers,
    getOffersByCategory,
    getOffersByBrand,
    getOffersByProduct,
    getOfferStats,
  };
};
