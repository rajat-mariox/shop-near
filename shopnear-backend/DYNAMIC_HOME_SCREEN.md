# 🏠 Dynamic Home Screen Implementation

Complete guide for the dynamic home screen system that fetches all data from the database.

## 📋 Overview

The home screen now fetches **all data dynamically from the database** with NO hardcoded fallback data. Every section is 100% database-driven:

- ✅ Delivery Info
- ✅ Banners
- ✅ Shop Categories
- ✅ Nearby Shops/Sellers
- ✅ Offers
- ✅ Brands
- ✅ Promo Codes

## 🗂️ Database Schemas

### 1. **DeliverySettings** (NEW)
Location: `src/models/DeliverySettings.js`

Stores delivery configuration dynamically:
```javascript
{
  estimatedDeliveryTime: Number,    // in minutes
  deliveryCharge: Number,           // in ₹
  location: String,
  freeDeliveryAbove: Number,        // Order amount for free delivery
  maxDeliveryRadius: Number,        // in km
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **PromoCode** (EXISTING)
Location: `src/models/PromoCode.js`

Promo codes with validity dates:
```javascript
{
  code: String (unique),
  title: String,
  description: String,
  discountType: String,             // 'percentage' or 'fixed'
  discountValue: Number,
  minOrderValue: Number,
  maxUsageLimit: Number,
  usageCount: Number,
  validityStartDate: Date,
  validityEndDate: Date,
  image: String,
  displayOnHome: Boolean,
  isActive: Boolean
}
```

### 3. **ShopCategory** (EXISTING)
Location: `src/models/ShopCategory.js`

Categories for organizing shops:
```javascript
{
  name: String,
  description: String,
  icon: String,
  image: String,
  displayOrder: Number,
  isActive: Boolean,
  isDeleted: Boolean
}
```

### 4. **Banners** (EXISTING)
Location: `src/models/Banners.js`

Promotional banners with date-based visibility:
```javascript
{
  title: String,
  subtitle: String,
  mobileView: String,
  ipadView: String,
  desktopView: String,
  rank: Number,
  startDate: Date,
  expireDate: Date,
  isActive: Boolean
}
```

### 5. **Brands** (EXISTING)
Location: `src/models/Brands.js`

Popular brands with offers.

### 6. **Offers** (EXISTING)
Location: `src/models/Offers.js`

Dynamic offers fetched by OffersService.

### 7. **Seller** (EXISTING)
Location: `src/models/Seller.js`

Shop information for nearby shops.

---

## 🔧 Service Layer

### HomeScreenService
Location: `src/services/HomeScreenService.js`

**Methods:**

1. **getActiveBanners()**
   - Filters: `isActive=true`, `startDate <= now <= expireDate`
   - Returns: Array of banners, limit 5, sorted by rank

2. **getShopCategories()**
   - Filters: `isActive=true`, `isDeleted=false`
   - Returns: Array of categories, limit 6, sorted by displayOrder

3. **getNearbyShops(userLat, userLng, limit)**
   - Filters: Verified, active sellers with ratings
   - Returns: Array of shops with formatted response
   - Optional: Sort by distance if lat/lng provided

4. **getActiveBrands()**
   - Filters: `isActive=true`, `isDeleted=false`
   - Returns: Array of brands with offer percentages, limit 10

5. **getActivePromoCodes()**
   - Filters: `isActive=true`, `displayOnHome=true`, valid dates
   - Returns: Array of promo codes, limit 5, sorted by expiry

6. **getDeliveryInfo()**
   - Fetches from DeliverySettings collection
   - Returns: Delivery time, charge, location, free delivery threshold

7. **getCompleteHomeScreenData(userLat, userLng)**
   - Parallel fetch of all 6 sections using Promise.all()
   - Returns: Complete home screen object

---

## 🎮 Controller

### HomeScreenController
Location: `src/controllers/HomeScreenController.js`

**Endpoint:** `GET /v1/api/home`

**Query Parameters:**
- `lat` (optional): User latitude for distance calculation
- `lng` (optional): User longitude for distance calculation

**Response Structure:**
```javascript
{
  delivery: {
    estimatedDeliveryTime: "20 minutes",
    deliveryCharge: 50,
    location: "Home - Sultan Bhag, Erraga",
    freeDeliveryAbove: 300,
    maxDeliveryRadius: 15
  },
  banners: [...],
  categories: [...],
  nearbyShops: [...],
  offers: [...],
  brands: [...],
  promoCodes: [...]
}
```

**No Fallback Data:**
- All sections are required to come from database
- If data is empty, returns empty array (not dummy data)
- Error handling passes error to next middleware

---

## 🌱 Setup & Seeding

### Step 1: Ensure Models Are Loaded
Add DeliverySettings to `src/models/index.js`:
```javascript
module.exports.DeliverySettings = require("./DeliverySettings");
```

### Step 2: Run Seed Script
```bash
node scripts/seedHomeScreenData.js
```

This creates:
- 3 Sample Banners
- 6 Shop Categories
- 4 Promo Codes
- 1 Delivery Settings record

### Step 3: Create Additional Data
Manually add to database:
- **Brands**: Use admin panel or database directly
- **Offers**: Use admin panel offers management
- **Sellers**: Register and verify sellers

---

## 📝 MongoDB Queries

### Insert Delivery Settings
```javascript
db.deliverysettings.insertOne({
  estimatedDeliveryTime: 20,
  deliveryCharge: 50,
  location: "Home - Sultan Bhag, Erraga",
  freeDeliveryAbove: 300,
  maxDeliveryRadius: 15,
  isActive: true
})
```

### Insert Banner
```javascript
db.banners.insertOne({
  title: "Festive Fashion Specials",
  subtitle: "Big Styles, Big Savings!",
  mobileView: "/images/banners/festive1.png",
  ipadView: "/images/banners/festive1_ipad.png",
  desktopView: "/images/banners/festive1_desktop.png",
  rank: 1,
  startDate: new Date("2026-01-01"),
  expireDate: new Date("2026-12-31"),
  isActive: true
})
```

### Insert Shop Category
```javascript
db.shopcategories.insertOne({
  name: "Clothes Shop",
  description: "Fashion and clothing stores",
  icon: "/icons/clothes.png",
  image: "/images/categories/clothes-shop.png",
  displayOrder: 1,
  isActive: true,
  isDeleted: false
})
```

### Insert Promo Code
```javascript
db.promocodes.insertOne({
  code: "DEAL20",
  title: "Get 20% Instant Discount",
  description: "20% discount on minimum order of ₹100",
  discountType: "percentage",
  discountValue: 20,
  minOrderValue: 100,
  maxUsageLimit: 100,
  usageCount: 0,
  validityStartDate: new Date("2026-01-01"),
  validityEndDate: new Date("2026-03-31"),
  image: "/images/promos/deal20.png",
  displayOnHome: true,
  isActive: true
})
```

---

## 🔗 Data Flow

```
Request: GET /v1/api/home?lat=28.5&lng=77.2
    ↓
HomeScreenController.homeScreen()
    ↓
HomeScreenService.getCompleteHomeScreenData()
    ↓ (Parallel)
├─ getActiveBanners() → Banners collection
├─ getShopCategories() → ShopCategory collection
├─ getNearbyShops() → Seller collection
├─ getActiveBrands() → Brands collection
├─ getActivePromoCodes() → PromoCode collection
└─ getDeliveryInfo() → DeliverySettings collection
    ↓
OffersService.getHomePageOffers() → Offers collection
    ↓
Response: Complete home screen object
```

---

## ✅ Checklist for Implementation

- [x] Created DeliverySettings model
- [x] Updated HomeScreenService with database fetch for delivery info
- [x] Updated HomeScreenController to remove all fallback data
- [x] Created seed script for initial data
- [x] All methods use Promise.all() for parallel fetching
- [x] Proper error handling and logging
- [x] Date-based filtering for banners and promo codes
- [x] Status-based filtering (isActive, isDeleted)

---

## 🧪 Testing

### Test Endpoint
```bash
curl http://localhost:3000/v1/api/home

# With location
curl http://localhost:3000/v1/api/home?lat=28.5&lng=77.2
```

### Expected Response
```json
{
  "success": true,
  "msg": "success",
  "data": {
    "delivery": {...},
    "banners": [...],
    "categories": [...],
    "nearbyShops": [...],
    "offers": [...],
    "brands": [...],
    "promoCodes": [...]
  }
}
```

---

## 📊 Data Volume Expectations

- **Banners**: 5 max (limit in query)
- **Categories**: 6 max (limit in query)
- **Nearby Shops**: 10 max (limit in query)
- **Brands**: 10 max (limit in query)
- **Promo Codes**: 5 max (limit in query)
- **Offers**: Configurable via OffersService

---

## 🚀 Future Enhancements

1. **Caching**: Add Redis caching for home screen data
2. **Location-based Filtering**: Improve shop sorting by distance
3. **A/B Testing**: Banner rotation and testing
4. **Analytics**: Track banner clicks and promo code usage
5. **Personalization**: Show personalized offers based on user history
6. **Inventory Integration**: Show stock status for products

---

## 🐛 Troubleshooting

### Empty Response
- Check if collections have data with `isActive: true`
- Verify date ranges for banners and promo codes
- Check seller verification status

### Delivery Info Not Showing
- Ensure DeliverySettings record exists with `isActive: true`
- Check if model is properly imported

### Slow Response
- Add database indexes on `isActive`, `startDate`, `expireDate` fields
- Consider implementing caching

### Type Errors
- Ensure all models are properly required in HomeScreenService
- Check mongoose connection status

---

Generated: January 3, 2026
