const Banners = require("../models/Banners");
const Brands = require("../models/Brands");
const Coupon = require("../models/CouponCode");
const ShopCategory = require("../models/Catagory");
const Seller = require("../models/Seller");
const Rating = require("../models/Rating");
const Product = require("../models/Product");
const Category = require("../models/Catagory");
const DeliverySettings = require("../models/DeliverySettings");
const Settings = require("../models/Settings");
const UserAddress = require("../models/UserAddress");
const User = require("../models/User");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports = () => {
  /**
   * Get Active Banners for Home Page
   */
  const getActiveBanners = () => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Banners.find({
        isActive: true,
        // startDate: { $lte: now },
        // expireDate: { $gte: now },
      })
        .select(
          "title subtitle image bgMedia bgMediaType rank redirectType categoryId productId externalUrl"
        )
        .sort({ rank: 1 })
        .limit(5);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Shop Categories
   */
  const getShopCategories = () => {
    return new Promise(function (resolve, reject) {
      let orm = ShopCategory.find({
        isActive: true,
        isDeleted: false,
      })
        // .select("name icon image displayOrder")
        // .sort({ displayOrder: 1 })
        .limit(6);

      orm.then(resolve).catch(reject);
    });
  };

  /**
   * Get Nearby Shops/Sellers
   * Filters verified sellers with ratings
   */
  const toRad = (deg) => (deg * Math.PI) / 180;

  const getDistanceKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getNearbyShops = async (userLat = null, userLng = null, limit = 10) => {
    const query = {
      status: "approved",
      isActive: true,
      isDeleted: false,
      shopName: { $exists: true, $ne: "" },
    };

    const shops = await Seller.find(query)
      .select(
        "shopName shopLogo shopImages shopDescription categories deliveryTime deliveryCharge lat lng address city offerText gstVerified"
      )
      .populate("categories", "categoryName")
      .sort({ createdAt: -1 })
      .limit(limit);

    const shopIds = shops.map((s) => s._id);

    // Rating aur product count alag collections me hain, isliye ek-ek query me
    // sabhi shops ke liye ikattha nikaale jaate hain (per-shop query se bachne ke liye)
    const [ratingRows, itemRows] = await Promise.all([
      Rating.aggregate([
        { $match: { sellerId: { $in: shopIds }, isActive: true } },
        {
          $group: {
            _id: "$sellerId",
            avg: { $avg: "$rating" },
            count: { $sum: 1 },
          },
        },
      ]),
      Product.aggregate([
        {
          $match: { shopId: { $in: shopIds }, isActive: true, isDeleted: false },
        },
        { $group: { _id: "$shopId", count: { $sum: 1 } } },
      ]),
    ]);

    const ratingBySeller = new Map(
      ratingRows.map((r) => [String(r._id), r])
    );
    const itemsBySeller = new Map(
      itemRows.map((r) => [String(r._id), r.count])
    );

    return shops.map((shop) => {
      const ratingRow = ratingBySeller.get(String(shop._id));
      return {
        _id: shop._id,
        name: shop.shopName,
        // Logo na ho to onboarding me upload hui pehli shop image
        image: shop.shopLogo || shop.shopImages?.[0]?.url || "",
        isVerified: shop.gstVerified === true,
        rating: ratingRow ? Number(ratingRow.avg.toFixed(1)) : 0,
        totalRatings: ratingRow ? ratingRow.count : 0,
        itemCount: itemsBySeller.get(String(shop._id)) || 0,
        offerText: shop.offerText || "",
        description: shop.shopDescription,
        categories: shop.categories?.map((c) => c.categoryName) || [],
        deliveryTime: shop.deliveryTime || "30 mins",
        deliveryCharge: shop.deliveryCharge || 0,
        address: shop.address,
        city: shop.city,
        lat: shop.lat,
        lng: shop.lng,
        distance:
          userLat && userLng && shop.lat && shop.lng
            ? `${getDistanceKm(
                Number(userLat),
                Number(userLng),
                shop.lat,
                shop.lng
              ).toFixed(1)} km`
            : null,
      };
    });
  };

  /**
   * Get Active Brands with Offers
   */
  const getActiveBrands = () => {
    return new Promise(function (resolve, reject) {
      let orm = Brands.find({
        isActive: true,
        isDeleted: false,
      })
        .select("brand image offerText themeColor rank")
        .sort({ rank: 1 })
        .limit(10);

      orm
        .then((brands) => {
          // Format response
          const formattedBrands = brands.map((brand) => ({
            _id: brand._id,
            name: brand.brand,
            logo: brand.image,
            offer: brand.offerText || "",
            themeColor: brand.themeColor || "#B11116",
          }));

          resolve(formattedBrands);
        })
        .catch(reject);
    });
  };

  /**
   * Get Active Promo Codes for Home Page
   */
  const getActivePromoCodes = () => {
    return new Promise(function (resolve, reject) {
      const now = new Date();

      let orm = Coupon.find({
        isActive: true,
        isDeleted: { $ne: true },
        applicableFor: "all",
        // null-match zaroori hai: admin panel bina date ke coupon banaye to
        // field null store hoti hai (missing nahi) — $exists: false use match
        // nahi karta tha aur coupon app me kabhi nahi dikhta tha.
        // Mongo me { field: null } missing AUR null dono match karta hai.
        $and: [
          { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
          { $or: [{ endDate: { $gte: now } }, { endDate: null }] },
        ],
      })
        .select(
          "code title description discountType discountValue maxDiscountAmount minOrderValue image startDate endDate"
        )
        .sort({ createdAt: -1 })
        .limit(5);

      orm
        .then((codes) => {
          // Admin panel ke saare coupon fields bheje jaate hain
          const formattedCodes = codes.map((code) => ({
            _id: code._id,
            code: code.code,
            title: code.title,
            description: code.description,
            discountType: code.discountType,
            discountValue: code.discountValue,
            maxDiscountAmount: code.maxDiscountAmount,
            minOrderValue: code.minOrderValue,
            image: code.image,
            startDate: code.startDate,
            endDate: code.endDate,
            validity: code.endDate
              ? `Valid till ${code.endDate.toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}`
              : "Limited time offer",
          }));

          resolve(formattedCodes);
        })
        .catch(reject);
    });
  };

  /**
   * Get Complete Home Screen Data
   * All sections combined
   */
  /**
   * User ka apna delivery address. Selected address pehle, warna sabse naya.
   * Address na ho to null — caller DeliverySettings wali default location use karega.
   */
  const getUserLocationLabel = async (userId) => {
    if (!userId) return null;

    const address =
      (await UserAddress.findOne({ userId, isActive: true, isSelected: true })) ||
      (await UserAddress.findOne({ userId, isActive: true }).sort({ createdAt: -1 }));

    if (!address) return null;

    return [address.addressType, address.address].filter(Boolean).join(" - ");
  };

  /**
   * User ka wallet balance. Logged-in na ho to null (header me chip nahi dikhta).
   */
  const getWallet = async (userId) => {
    if (!userId) return null;
    const user = await User.findById(userId).select("walletBalance");
    if (!user) return null;
    return { balance: user.walletBalance || 0 };
  };

  /**
   * Admin ka set kiya hua header background (image/video); na ho to null —
   * app apna bundled default dikhati hai
   */
  const getHeaderBg = async () => {
    const settings = await Settings.findOne({}).select(
      "homeHeaderBg homeHeaderBgType"
    );
    if (!settings || !settings.homeHeaderBg) return null;
    return { url: settings.homeHeaderBg, type: settings.homeHeaderBgType };
  };

  const getCompleteHomeScreenData = async (
    userLat = null,
    userLng = null,
    userId = null
  ) => {
    try {
      // Fetch all data in parallel
      const [
        banners,
        categories,
        shops,
        brands,
        promoCodes,
        delivery,
        userLocation,
        wallet,
        headerBg,
      ] = await Promise.all([
        getActiveBanners(),
        getShopCategories(),
        getNearbyShops(userLat, userLng),
        getActiveBrands(),
        getActivePromoCodes(),
        getDeliveryInfo(),
        getUserLocationLabel(userId),
        getWallet(userId),
        getHeaderBg(),
      ]);

      return {
        wallet,
        headerBg,
        delivery: { ...delivery, location: userLocation || delivery.location },
        banners,
        categories,
        nearbyShops: shops,
        brands,
        promoCodes,
      };
    } catch (error) {
      throw error;
    }
  };

  /**
   * Get Delivery Info from Database
   */
  const getDeliveryInfo = () => {
    return new Promise(function (resolve, reject) {
      let orm = DeliverySettings.findOne({
        isActive: true,
      }).select(
        "estimatedDeliveryTime deliveryCharge location freeDeliveryAbove maxDeliveryRadius"
      );

      orm
        .then((settings) => {
          if (settings) {
            resolve({
              estimatedDeliveryTime: `${settings.estimatedDeliveryTime} minutes`,
              deliveryCharge: settings.deliveryCharge,
              location: settings.location,
              freeDeliveryAbove: settings.freeDeliveryAbove,
              maxDeliveryRadius: settings.maxDeliveryRadius,
            });
          } else {
            // Default settings if none found
            resolve({
              estimatedDeliveryTime: "20 minutes",
              deliveryCharge: 50,
              location: "Home - Sultan Bhag, Erraga",
              freeDeliveryAbove: 300,
              maxDeliveryRadius: 10,
            });
          }
        })
        .catch(reject);
    });
  };

  return {
    getActiveBanners,
    getShopCategories,
    getNearbyShops,
    getActiveBrands,
    getActivePromoCodes,
    getCompleteHomeScreenData,
    getDeliveryInfo,
    getUserLocationLabel,
  };
};
