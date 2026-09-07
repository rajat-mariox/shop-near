const Seller = require("../models/Seller");
const Product = require("../models/Product");
const Category = require("../models/Catagory");
const Rating = require("../models/Rating");

module.exports = () => {
  /**
   * Get all sellers with pagination and filters
   * GET /v1/api/customer/sellers?page=1&limit=10&category=xyz&search=name
   */
  const getAllSellers = async (req, res, next) => {
    console.log("CustomerService => getAllSellers");

    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const categoryId = req.query.category;
      const search = req.query.search;
      const sortBy = req.query.sortBy || "avgRating"; // avgRating, shopName

      const skip = (page - 1) * limit;

      // Build query
      let query = {
        // isVerified: true,
        isActive: true,
        isDeleted: false,
        shopName: { $exists: true, $ne: "" },
      };

      // Filter by category if provided
      if (categoryId) {
        query.categories = categoryId;
      }

      // Search by shop name or business type
      if (search) {
        query.$or = [
          { shopName: { $regex: search, $options: "i" } },
          { businessType: { $regex: search, $options: "i" } },
        ];
      }

      // Count total documents
      const total = await Seller.countDocuments(query);

      // Fetch sellers with pagination
      let orm = Seller.find(query)
        .select(
          "shopName shopLogo shopImages shopDescription businessType categories deliveryTime deliveryCharge address city lat lng offerText gstVerified"
        )
        .populate("categories", "name")
        .skip(skip)
        .limit(limit);

      // Sort
      if (sortBy === "shopName") {
        orm = orm.sort({ shopName: 1 });
      } else {
        orm = orm.sort({ avgRating: -1 });
      }

      const sellers = await orm;

      // Seller document me avgRating/ratingCount stored nahi hai — rating
      // Rating collection se ek hi aggregate query me nikalti hai
      // (home screen ke getNearbyShops jaisa pattern)
      const sellerIds = sellers.map((seller) => seller._id);
      const ratingRows = await Rating.aggregate([
        { $match: { sellerId: { $in: sellerIds }, isActive: true } },
        {
          $group: {
            _id: "$sellerId",
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);
      const ratingBySeller = new Map(
        ratingRows.map((row) => [String(row._id), row])
      );

      // Format response
      const formattedSellers = sellers.map((seller) => {
        const ratingRow = ratingBySeller.get(String(seller._id));
        return {
        _id: seller._id,
        shopName: seller.shopName,
        // Logo na ho to onboarding me upload hui pehli shop image dikhao
        shopLogo: seller.shopLogo || seller.shopImages?.[0]?.url || "",
        shopDescription: seller.shopDescription,
        businessType: seller.businessType,
        rating: ratingRow ? Number(ratingRow.avg.toFixed(1)) : 0,
        totalRatings: ratingRow ? ratingRow.count : 0,
        categories:
          seller.categories?.map((c) => ({
            _id: c._id,
            name: c.name,
          })) || [],
        deliveryTime: seller.deliveryTime || "30 mins",
        deliveryCharge: seller.deliveryCharge || 0,
        address: seller.address,
        city: seller.city,
        lat: seller.lat,
        lng: seller.lng,
        // Shop card ki green offer strip aur verified badge ke liye
        offerText: seller.offerText || "",
        isVerified: seller.gstVerified === true,
        };
      });

      const totalPages = Math.ceil(total / limit);

      req.rData = {
        sellers: formattedSellers,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: total,
          resultsPerPage: limit,
        },
      };

      req.msg = "Sellers fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getAllSellers:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get seller details
   * GET /v1/api/customer/sellers/:sellerId
   */
  const getSellerDetails = async (req, res, next) => {
    console.log("CustomerService => getSellerDetails");

    try {
      const { sellerId } = req.params;

      const seller = await Seller.findById(sellerId)
        .select(
          "shopName shopLogo shopDescription businessType categories deliveryTime deliveryCharge address city lat lng shopImages gstVerified"
        )
        .populate("categories", "name _id");

      if (!seller) {
        req.error = "Seller not found";
        return next();
      }

      // Rating live aggregate hoti hai (Seller me stored fields nahi hain)
      const ratingAgg = await Rating.aggregate([
        { $match: { sellerId: seller._id, isActive: true } },
        {
          $group: {
            _id: null,
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]);
      const ratingRow = ratingAgg[0];

      req.rData = {
        _id: seller._id,
        shopName: seller.shopName,
        // Logo na ho to onboarding wali pehli shop image
        shopLogo: seller.shopLogo || seller.shopImages?.[0]?.url || "",
        shopDescription: seller.shopDescription,
        shopImages: seller.shopImages || [],
        businessType: seller.businessType,
        rating: ratingRow ? Number(ratingRow.avg.toFixed(1)) : 0,
        totalRatings: ratingRow ? ratingRow.count : 0,
        categories: seller.categories || [],
        deliveryTime: seller.deliveryTime || "30 mins",
        deliveryCharge: seller.deliveryCharge || 0,
        address: seller.address,
        city: seller.city,
        verified: seller.gstVerified,
      };

      req.msg = "Seller details fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getSellerDetails:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get seller categories
   * GET /v1/api/customer/sellers/:sellerId/categories
   */
  const getSellerCategories = async (req, res, next) => {
    console.log("CustomerService => getSellerCategories");

    try {
      const { sellerId } = req.params;

      // 1. Verify seller exists
      const seller = await Seller.findById(sellerId).select("_id");
      if (!seller) {
        req.error = "Seller not found";
        return next();
      }

      // 2. Find distinct category IDs from the seller's products
      const categoryIds = await Product.distinct("categoryId", {
        shopId: sellerId,
        isActive: true,
        isDeleted: false,
      });

      // 3. Fetch the category details for those IDs
      const categories = await Category.find({
        _id: { $in: categoryIds },
        isActive: true,
        isDeleted: false,
      }).select("_id categoryName description image");

      req.rData = {
        sellerId: seller._id,
        categories: categories || [],
      };

      req.msg = "Seller categories fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getSellerCategories:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get products by seller and category
   * GET /v1/api/customer/sellers/:sellerId/products?categoryId=xyz&page=1&limit=12&sort=price
   */
  const getSellerProducts = async (req, res, next) => {
    console.log("CustomerService => getSellerProducts");

    try {
      const { sellerId } = req.params;
      const categoryId = req.query.categoryId;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const sortBy = req.query.sort || "featured"; // featured, price, rating, newest

      const skip = (page - 1) * limit;

      // Verify seller exists
      const seller = await Seller.findById(sellerId);
      if (!seller) {
        req.error = "Seller not found";
        return next();
      }

      // Build query
      let query = {
        shopId: sellerId,
        isActive: true,
        isDeleted: false,
      };

      // Filter by category if provided
      if (categoryId) {
        query.categoryId = categoryId;
      }

      // Count total products
      const total = await Product.countDocuments(query);

      // Fetch products
      let orm = Product.find(query)
        .select(
          "productName productImages price discountPrice discountPercent rating totalRatings colors sizes stock"
        )
        .skip(skip)
        .limit(limit);

      // Sort
      switch (sortBy) {
        case "price":
          orm = orm.sort({ price: 1 });
          break;
        case "price_desc":
          orm = orm.sort({ price: -1 });
          break;
        case "rating":
          orm = orm.sort({ rating: -1 });
          break;
        case "newest":
          orm = orm.sort({ createdAt: -1 });
          break;
        case "featured":
        default:
          orm = orm.sort({ isFeatured: -1, createdAt: -1 });
      }

      const products = await orm;

      // Format response
      const formattedProducts = products.map((product) => ({
        _id: product._id,
        productName: product.productName,
        productImage: product.productImages?.[0]?.url || "",
        // App me product card ki images slide hoti hain, isliye saari urls
        productImages: product.productImages?.map((img) => img.url) || [],
        price: product.price,
        discountPrice: product.discountPrice || product.price,
        discountPercent: product.discountPercent || 0,
        rating: product.rating || 0,
        totalRatings: product.totalRatings || 0,
        colors: product.colors || [],
        sizes: product.sizes || [],
        stock: product.stock,
        inStock: product.stock > 0,
      }));

      const totalPages = Math.ceil(total / limit);

      req.rData = {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: total,
          resultsPerPage: limit,
        },
      };

      req.msg = "Products fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getSellerProducts:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Get product details
   * GET /v1/api/customer/products/:productId
   */
  const getProductDetails = async (req, res, next) => {
    console.log("CustomerService => getProductDetails");

    try {
      const { productId } = req.params;

      const product = await Product.findById(productId)
        .populate(
          "shopId",
          "shopName shopLogo shopImages deliveryTime deliveryCharge"
        )
        .populate("categoryId", "categoryName");

      if (!product) {
        req.error = "Product not found";
        return next();
      }

      // Seller ki rating Rating collection se live aggregate hoti hai
      const sellerRatingAgg = product.shopId
        ? await Rating.aggregate([
            { $match: { sellerId: product.shopId._id, isActive: true } },
            {
              $group: {
                _id: null,
                avg: { $avg: "$rating" },
                count: { $sum: 1 },
              },
            },
          ])
        : [];
      const sellerRating = sellerRatingAgg[0];

      req.rData = {
        _id: product._id,
        productName: product.productName,
        brand: product.brand,
        productImages: product.productImages || [],
        price: product.price,
        discountPrice: product.discountPrice || product.price,
        discountPercent: product.discountPercent || 0,
        colors: product.colors || [],
        sizes: product.sizes || [],
        stock: product.stock,
        inStock: product.stock > 0,
        description: product.description,
        descriptionImages: product.descriptionImages || [],
        highlights: product.highlights || [],
        features: product.features,
        attributes: product.attributes || [],
        rating: product.rating || 0,
        totalRatings: product.totalRatings || 0,
        seller: {
          _id: product.shopId?._id,
          shopName: product.shopId?.shopName,
          shopLogo:
            product.shopId?.shopLogo ||
            product.shopId?.shopImages?.[0]?.url ||
            "",
          deliveryTime: product.shopId?.deliveryTime,
          deliveryCharge: product.shopId?.deliveryCharge,
          rating: sellerRating ? Number(sellerRating.avg.toFixed(1)) : 0,
          totalRatings: sellerRating ? sellerRating.count : 0,
        },
        category: {
          _id: product.categoryId?._id,
          name: product.categoryId?.name,
        },
      };

      req.msg = "Product details fetched successfully";
      next();
    } catch (error) {
      console.error("Error in getProductDetails:", error);
      req.error = error.message;
      next();
    }
  };

  /**
   * Search products across all sellers
   * GET /v1/api/customer/products/search?q=shirt&page=1&limit=20
   */
  const searchProducts = async (req, res, next) => {
    console.log("CustomerService => searchProducts");

    try {
      const query = req.query.q;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      if (!query || query.trim().length < 2) {
        req.error = "Search query must be at least 2 characters";
        return next();
      }

      const skip = (page - 1) * limit;

      const searchQuery = {
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
        ],
        isActive: true,
        isDeleted: false,
      };

      const total = await Product.countDocuments(searchQuery);

      const products = await Product.find(searchQuery)
        .select(
          "productName productImages price discountPrice discountPercent rating totalRatings shopId categoryId"
        )
        .populate("shopId", "shopName")
        .skip(skip)
        .limit(limit)
        .sort({ rating: -1 });

      const formattedProducts = products.map((product) => ({
        _id: product._id,
        productName: product.productName,
        productImage: product.productImages?.[0]?.url || "",
        // Search results ke cards me bhi images slide hoti hain
        productImages: product.productImages?.map((img) => img.url) || [],
        price: product.price,
        discountPrice: product.discountPrice || product.price,
        discountPercent: product.discountPercent || 0,
        rating: product.rating || 0,
        totalRatings: product.totalRatings || 0,
        seller: product.shopId?.shopName,
        sellerId: product.shopId?._id,
      }));

      const totalPages = Math.ceil(total / limit);

      req.rData = {
        products: formattedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: total,
          resultsPerPage: limit,
        },
      };

      req.msg = "Products found successfully";
      next();
    } catch (error) {
      console.error("Error in searchProducts:", error);
      req.error = error.message;
      next();
    }
  };

  return {
    getAllSellers,
    getSellerDetails,
    getSellerCategories,
    getSellerProducts,
    getProductDetails,
    searchProducts,
  };
};
