/**
 * 🛠️ Admin APIs for Home Screen Management
 * 
 * This guide shows all the endpoints needed to manage home screen data
 * through the admin panel.
 */

// ============================================
// 🎨 BANNERS MANAGEMENT
// ============================================

/**
 * POST /v1/api/admin/banners
 * Create a new banner
 * 
 * Body:
 * {
 *   "title": "Festive Fashion Specials",
 *   "subtitle": "Big Styles, Big Savings!",
 *   "mobileView": "/images/banners/festive1.png",
 *   "ipadView": "/images/banners/festive1_ipad.png",
 *   "desktopView": "/images/banners/festive1_desktop.png",
 *   "rank": 1,
 *   "startDate": "2026-01-01",
 *   "expireDate": "2026-12-31",
 *   "isActive": true
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "msg": "Banner created successfully",
 *   "data": { banner object }
 * }
 */

/**
 * GET /v1/api/admin/banners
 * Get all banners
 */

/**
 * PUT /v1/api/admin/banners/:id
 * Update banner by ID
 */

/**
 * DELETE /v1/api/admin/banners/:id
 * Delete banner by ID
 */

// ============================================
// 🏪 SHOP CATEGORIES MANAGEMENT
// ============================================

/**
 * POST /v1/api/admin/shop-categories
 * Create a new shop category
 * 
 * Body:
 * {
 *   "name": "Clothes Shop",
 *   "description": "Fashion and clothing stores",
 *   "icon": "/icons/clothes.png",
 *   "image": "/images/categories/clothes-shop.png",
 *   "displayOrder": 1,
 *   "isActive": true
 * }
 */

/**
 * GET /v1/api/admin/shop-categories
 * Get all shop categories
 */

/**
 * PUT /v1/api/admin/shop-categories/:id
 * Update shop category
 */

/**
 * DELETE /v1/api/admin/shop-categories/:id
 * Delete shop category (soft delete via isDeleted flag)
 */

// ============================================
// 🎟️ PROMO CODES MANAGEMENT
// ============================================

/**
 * POST /v1/api/admin/promo-codes
 * Create a new promo code
 * 
 * Body:
 * {
 *   "code": "DEAL20",
 *   "title": "Get 20% Instant Discount",
 *   "description": "20% discount on minimum order of ₹100",
 *   "discountType": "percentage",  // 'percentage' or 'fixed'
 *   "discountValue": 20,
 *   "minOrderValue": 100,
 *   "maxUsageLimit": 100,
 *   "validityStartDate": "2026-01-01",
 *   "validityEndDate": "2026-03-31",
 *   "image": "/images/promos/deal20.png",
 *   "displayOnHome": true,
 *   "isActive": true
 * }
 */

/**
 * GET /v1/api/admin/promo-codes
 * Get all promo codes with usage statistics
 * 
 * Response includes:
 * - code
 * - title
 * - discountValue
 * - maxUsageLimit
 * - usageCount
 * - validityStartDate/EndDate
 * - isActive status
 */

/**
 * PUT /v1/api/admin/promo-codes/:id
 * Update promo code
 */

/**
 * DELETE /v1/api/admin/promo-codes/:id
 * Delete promo code
 */

/**
 * GET /v1/api/admin/promo-codes/:code/usage
 * Get usage statistics for a promo code
 * 
 * Response:
 * {
 *   "code": "DEAL20",
 *   "totalUsageLimit": 100,
 *   "currentUsageCount": 45,
 *   "remainingUsage": 55,
 *   "usagePercentage": 45,
 *   "isExhausted": false,
 *   "validTill": "2026-03-31"
 * }
 */

// ============================================
// 🚚 DELIVERY SETTINGS MANAGEMENT
// ============================================

/**
 * GET /v1/api/admin/delivery-settings
 * Get current delivery settings
 * 
 * Response:
 * {
 *   "estimatedDeliveryTime": 20,
 *   "deliveryCharge": 50,
 *   "location": "Home - Sultan Bhag, Erraga",
 *   "freeDeliveryAbove": 300,
 *   "maxDeliveryRadius": 15,
 *   "isActive": true
 * }
 */

/**
 * PUT /v1/api/admin/delivery-settings
 * Update delivery settings
 * 
 * Body (all optional):
 * {
 *   "estimatedDeliveryTime": 25,
 *   "deliveryCharge": 60,
 *   "location": "New Location",
 *   "freeDeliveryAbove": 400,
 *   "maxDeliveryRadius": 20
 * }
 */

// ============================================
// 🏷️ BRANDS MANAGEMENT
// ============================================

/**
 * POST /v1/api/admin/brands
 * Create a new brand
 * 
 * Body:
 * {
 *   "brand": "GUCCI",
 *   "image": "/images/brands/gucci.png",
 *   "isActive": true
 * }
 */

/**
 * GET /v1/api/admin/brands
 * Get all brands
 */

/**
 * PUT /v1/api/admin/brands/:id
 * Update brand
 */

/**
 * DELETE /v1/api/admin/brands/:id
 * Delete brand
 */

// ============================================
// 💰 OFFERS MANAGEMENT
// ============================================

/**
 * POST /v1/api/admin/offers
 * Create a new offer
 * 
 * Body:
 * {
 *   "title": "T-shirt",
 *   "priceStartsAt": 150,
 *   "image": "/images/discounts/tshirt.png",
 *   "bgColor": "#FFE9C6",
 *   "description": "Best quality t-shirts",
 *   "startDate": "2026-01-01",
 *   "endDate": "2026-12-31",
 *   "isActive": true
 * }
 */

/**
 * GET /v1/api/admin/offers
 * Get all offers
 */

/**
 * PUT /v1/api/admin/offers/:id
 * Update offer
 */

/**
 * DELETE /v1/api/admin/offers/:id
 * Delete offer
 */

// ============================================
// 🏠 HOME SCREEN STATISTICS
// ============================================

/**
 * GET /v1/api/admin/home-screen/stats
 * Get home screen data statistics
 * 
 * Response:
 * {
 *   "banners": {
 *     "total": 5,
 *     "active": 5,
 *     "upcoming": 0,
 *     "expired": 0
 *   },
 *   "categories": {
 *     "total": 6,
 *     "active": 6
 *   },
 *   "promoCodes": {
 *     "total": 4,
 *     "active": 4,
 *     "expired": 0,
 *     "totalUsage": 150,
 *     "totalCapacity": 400
 *   },
 *   "brands": {
 *     "total": 12,
 *     "active": 12
 *   },
 *   "offers": {
 *     "total": 8,
 *     "active": 8
 *   },
 *   "sellers": {
 *     "verified": 25,
 *     "active": 24
 *   }
 * }
 */

/**
 * GET /v1/api/admin/home-screen/preview
 * Get complete home screen preview as it appears to customers
 * 
 * Response: Same as /v1/api/home endpoint
 */

// ============================================
// 📋 REQUIRED MODEL INDEXES
// ============================================

/**
 * Add these indexes to MongoDB for optimal performance:
 * 
 * Banners:
 * db.banners.createIndex({ isActive: 1 })
 * db.banners.createIndex({ startDate: 1, expireDate: 1 })
 * db.banners.createIndex({ rank: 1 })
 * 
 * ShopCategory:
 * db.shopcategories.createIndex({ isActive: 1, isDeleted: 1 })
 * db.shopcategories.createIndex({ displayOrder: 1 })
 * 
 * PromoCode:
 * db.promocodes.createIndex({ isActive: 1, displayOnHome: 1 })
 * db.promocodes.createIndex({ validityStartDate: 1, validityEndDate: 1 })
 * db.promocodes.createIndex({ code: 1 }, { unique: true })
 * 
 * Brands:
 * db.brands.createIndex({ isActive: 1 })
 * 
 * Offers:
 * db.offers.createIndex({ isActive: 1 })
 * db.offers.createIndex({ startDate: 1, endDate: 1 })
 * 
 * DeliverySettings:
 * db.deliverysettings.createIndex({ isActive: 1 })
 * 
 * Seller:
 * db.sellers.createIndex({ isVerified: 1, isActive: 1 })
 * db.sellers.createIndex({ avgRating: -1 })
 */

// ============================================
// 🔐 REQUIRED ADMIN ROLES & PERMISSIONS
// ============================================

/**
 * ADMIN ROLE: home_screen_manager
 * 
 * Permissions:
 * - manage_banners (create, read, update, delete)
 * - manage_categories (create, read, update, delete)
 * - manage_promo_codes (create, read, update, delete)
 * - manage_delivery_settings (read, update)
 * - manage_brands (create, read, update, delete)
 * - manage_offers (create, read, update, delete)
 * - view_home_screen_stats (read)
 * - preview_home_screen (read)
 */

// ============================================
// 📱 CUSTOMER API (READ-ONLY)
// ============================================

/**
 * GET /v1/api/home
 * Fetch complete home screen data
 * 
 * Query Parameters:
 * - lat (optional): User latitude
 * - lng (optional): User longitude
 * 
 * Response: Complete home screen object with all sections
 */

/**
 * GET /v1/api/home/banners
 * Fetch only banners
 */

/**
 * GET /v1/api/home/categories
 * Fetch only shop categories
 */

/**
 * GET /v1/api/home/offers
 * Fetch only offers
 */

/**
 * GET /v1/api/home/brands
 * Fetch only brands
 */

/**
 * GET /v1/api/home/promo-codes
 * Fetch only promo codes
 */

/**
 * GET /v1/api/home/delivery-info
 * Fetch only delivery information
 */

module.exports = {
  // This file is for documentation purposes only
  // All API endpoints should be implemented in respective controllers
};
