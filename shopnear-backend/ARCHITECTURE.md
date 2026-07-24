# 🏗️ ARCHITECTURE DIAGRAM - Dynamic Home Screen

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      CUSTOMER APPLICATION                        │
│                                                                   │
│                  GET /v1/api/home?lat=28.5&lng=77.2             │
│                                                                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS BACKEND                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         HomeScreenController.homeScreen()                  │ │
│  │  - Receives request with optional lat/lng                  │ │
│  │  - Calls HomeScreenService                                 │ │
│  │  - Calls OffersService                                     │ │
│  │  - Returns complete response                               │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                         │
│         ┌───────────────┴───────────────┐                         │
│         │                               │                         │
│         ▼                               ▼                         │
│  ┌──────────────────┐         ┌──────────────────┐               │
│  │ HomeScreen       │         │ OffersService    │               │
│  │ Service          │         │.getHomePageOffers│               │
│  │                  │         │                  │               │
│  └──────────┬───────┘         └────────┬─────────┘               │
│             │                         │                          │
└─────────────┼─────────────────────────┼──────────────────────────┘
              │                         │
              │                         │
    ┌─────────┴──────────┐             │
    │ Parallel Fetch     │             │
    │ (Promise.all)      │             │
    │                    │             │
    ▼                    ▼             ▼
 ┌──────────────────────────────────────────┐
 │         MONGODB DATABASE                 │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ DeliverySettings Collection         │ │
 │  │ - estimatedDeliveryTime: 20 mins    │ │
 │  │ - deliveryCharge: ₹50               │ │
 │  │ - location: Sultan Bhag, Erraga     │ │
 │  │ - freeDeliveryAbove: ₹300           │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ Banners Collection                  │ │
 │  │ Filter: isActive=true               │ │
 │  │ Filter: startDate ≤ now ≤ expireDate│ │
 │  │ Sort: rank                          │ │
 │  │ Limit: 5                            │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ ShopCategory Collection             │ │
 │  │ Filter: isActive=true, isDeleted=false
 │  │ Sort: displayOrder                  │ │
 │  │ Limit: 6                            │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ Seller Collection                   │ │
 │  │ Filter: isVerified=true             │ │
 │  │ Filter: isActive=true               │ │
 │  │ Sort: avgRating DESC                │ │
 │  │ Limit: 10                           │ │
 │  │ Populate: categories                │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ Offers Collection                   │ │
 │  │ Filter: isActive=true               │ │
 │  │ Filter: startDate ≤ now ≤ endDate   │ │
 │  │ Limit: 5                            │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ Brands Collection                   │ │
 │  │ Filter: isActive=true, isDeleted=false
 │  │ Limit: 10                           │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 │  ┌─────────────────────────────────────┐ │
 │  │ PromoCode Collection                │ │
 │  │ Filter: isActive=true               │ │
 │  │ Filter: displayOnHome=true          │ │
 │  │ Filter: validStart ≤ now ≤ validEnd │ │
 │  │ Sort: validityEndDate               │ │
 │  │ Limit: 5                            │ │
 │  └─────────────────────────────────────┘ │
 │                                          │
 └──────────────────────────────────────────┘
```

---

## Data Flow Sequence

```
Customer Request
       │
       ▼
GET /v1/api/home
       │
       ▼
HomeScreenController.homeScreen()
       │
       ├─────────────────────────────────────────────────┐
       │                                                 │
       ▼                                                 ▼
HomeScreenService                          OffersService
getCompleteHomeScreenData()                getHomePageOffers()
       │                                                 │
       ├─ Promise.all() ─────────────────┐              │
       │                                 │              │
       ▼  ▼  ▼  ▼  ▼  ▼                 │              │
    (6 parallel queries)                 │              │
       │  │  │  │  │  │                 │              │
    1. getActiveBanners()     ────┐     │              │
    2. getShopCategories()    ─┐  │     │              │
    3. getNearbyShops()      ─┤  │ ────│─────────┐    │
    4. getActiveBrands()     ─┤  │     │         │    │
    5. getActivePromoCodes() ─┤  │     │         │    │
    6. getDeliveryInfo()     ─┤  │     │         │    │
                               │  │     │         │    │
                               └──┼─────┼─────────┼────┤
                                  │     │         │    │
                                  ▼     ▼         ▼    ▼
                            Format & Combine
                                  │
                                  ▼
                     Complete Home Screen Object
                                  │
                                  ▼
                    HTTP Response (JSON)
                                  │
                                  ▼
                        Customer App Receives
                                  │
                                  ▼
                            UI Renders
```

---

## Request-Response Example

### REQUEST
```http
GET /v1/api/home?lat=28.5&lng=77.2 HTTP/1.1
Host: api.shopnear.com
Authorization: Bearer <user-token>
Content-Type: application/json
```

### RESPONSE
```json
{
  "success": true,
  "msg": "success",
  "data": {
    "delivery": {
      "estimatedDeliveryTime": "20 minutes",
      "deliveryCharge": 50,
      "location": "Home - Sultan Bhag, Erraga",
      "freeDeliveryAbove": 300,
      "maxDeliveryRadius": 15
    },
    "banners": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "title": "Festive Fashion Specials",
        "subtitle": "Big Styles, Big Savings!",
        "mobileView": "/images/banners/festive1.png",
        "ipadView": "/images/banners/festive1_ipad.png",
        "desktopView": "/images/banners/festive1_desktop.png",
        "rank": 1
      }
    ],
    "categories": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "Clothes Shop",
        "description": "Fashion and clothing stores",
        "icon": "/icons/clothes.png",
        "image": "/images/categories/clothes-shop.png",
        "displayOrder": 1
      }
    ],
    "nearbyShops": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "name": "Gupta Garments",
        "image": "/images/shops/gupta.png",
        "rating": 4.5,
        "totalRatings": 200,
        "description": "Quality garments for all ages",
        "categories": ["Men", "Women", "Kids"],
        "deliveryTime": "14 mins",
        "deliveryCharge": 40
      }
    ],
    "offers": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "title": "T-shirt",
        "priceStartsAt": 150,
        "image": "/images/discounts/tshirt.png",
        "bgColor": "#FFE9C6"
      }
    ],
    "brands": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "name": "GUCCI",
        "logo": "/images/brands/gucci.png",
        "offer": "30% OFF"
      }
    ],
    "promoCodes": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "code": "DEAL20",
        "title": "Get 20% Instant Discount",
        "description": "20% discount on minimum order of ₹100",
        "discountType": "percentage",
        "discountValue": 20,
        "image": "/images/promos/deal20.png",
        "validity": "Valid till 3/31/2026"
      }
    ]
  }
}
```

---

## Service Layer Architecture

```
┌─────────────────────────────────────────────────────────┐
│           HomeScreenService Module                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Public Methods (Exported)                        │  │
│  │ ────────────────────────────────────────────────│  │
│  │ • getActiveBanners()                             │  │
│  │ • getShopCategories()                            │  │
│  │ • getNearbyShops(lat, lng, limit)                │  │
│  │ • getActiveBrands()                              │  │
│  │ • getActivePromoCodes()                          │  │
│  │ • getDeliveryInfo()                              │  │
│  │ • getCompleteHomeScreenData(lat, lng)            │  │
│  └────────────┬─────────────────────────────────────┘  │
│               │                                         │
│               ▼                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Internal: Database Models                        │  │
│  │ ────────────────────────────────────────────────│  │
│  │ require("../models/Banners")                     │  │
│  │ require("../models/ShopCategory")                │  │
│  │ require("../models/Seller")                      │  │
│  │ require("../models/Brands")                      │  │
│  │ require("../models/PromoCode")                   │  │
│  │ require("../models/DeliverySettings")            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Data Transformation Pipeline

```
Raw Database Document
       │
       ▼
┌──────────────────────────┐
│ Method Processing        │
│ - Select fields          │
│ - Populate relations     │
│ - Sort results           │
│ - Limit results          │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Format Response          │
│ - Rename fields          │
│ - Add calculated fields  │
│ - Structure for UI       │
└──────────┬───────────────┘
           │
           ▼
Formatted API Response
       │
       ▼
Customer UI Renders
```

---

## Promise.all() Parallel Execution

```
Timeline:
0ms  ├─ getActiveBanners() ────────┐
     ├─ getShopCategories() ───────┐
     ├─ getNearbyShops() ──────────┐ All run in parallel
     ├─ getActiveBrands() ────────┐
     ├─ getActivePromoCodes() ────┐
     └─ getDeliveryInfo() ────────┐
                                  │
50ms └──────────────────────────────┤ Wait for all to complete
                                    │
100ms ▼
     Combine Results
     │
     ▼
     Return Complete Object
```

**Benefits**:
- Faster than sequential (6 queries at same time)
- All queries complete in ~100ms instead of 600ms
- 6x performance improvement!

---

## Database Query Optimization

```
BEFORE (Sequential)
┌──────────────────────────────────────────┐
│ Query 1: 100ms ────────┐                 │
│                        ▼                 │
│ Query 2: 100ms ────────┐                 │
│                        ▼                 │
│ Query 3: 100ms ────────┐                 │
│                        ▼                 │
│ Query 4: 100ms ────────┐                 │
│                        ▼                 │
│ Query 5: 100ms ────────┐                 │
│                        ▼                 │
│ Query 6: 100ms ────────┐                 │
│                        ▼                 │
│ Total: 600ms          Response           │
└──────────────────────────────────────────┘

AFTER (Parallel)
┌──────────────────────────────────────────┐
│ Query 1: 100ms │                         │
│ Query 2: 100ms │                         │
│ Query 3: 100ms │ All at same time       │
│ Query 4: 100ms │                         │
│ Query 5: 100ms │                         │
│ Query 6: 100ms │                         │
│ Total: 100ms  ▼ Response                 │
└──────────────────────────────────────────┘

Improvement: 6x faster! 🚀
```

---

## Admin Panel Management Flow

```
┌─────────────────────────────────────────┐
│        ADMIN DASHBOARD                  │
│                                         │
│  ┌─────────────────────────────────┐  │
│  │ Banners Management              │  │
│  │ + Create  ✏️ Edit  🗑️ Delete     │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
│  ┌──────────────▼──────────────────┐  │
│  │ Categories Management           │  │
│  │ + Create  ✏️ Edit  🗑️ Delete     │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
│  ┌──────────────▼──────────────────┐  │
│  │ Promo Codes Management          │  │
│  │ + Create  ✏️ Edit  🗑️ Delete     │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
│  ┌──────────────▼──────────────────┐  │
│  │ Delivery Settings               │  │
│  │ ✏️ Edit (single record)          │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
│  ┌──────────────▼──────────────────┐  │
│  │ Brands Management               │  │
│  │ + Create  ✏️ Edit  🗑️ Delete     │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
│  ┌──────────────▼──────────────────┐  │
│  │ Offers Management               │  │
│  │ + Create  ✏️ Edit  🗑️ Delete     │  │
│  └──────────────┬──────────────────┘  │
│                 │                      │
└─────────────────┼──────────────────────┘
                  │
                  ▼
          POST/PUT/DELETE
          /admin/[resource]
                  │
                  ▼
         Update MongoDB
                  │
                  ▼
    Changes appear immediately
    on customer home screen
           (next refresh)
```

---

## Error Handling Flow

```
┌──────────────────────────────────────────┐
│        HomeScreenController               │
└──────────────────┬───────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ Call HomeScreenService │
        └──────────┬────────────┘
                   │
        ┌──────────▼──────────┐
        │ Database Query      │
        └──────────┬──────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
         ▼                    ▼
       ✅ Success          ❌ Error
         │                    │
         ▼                    ▼
    Return Data      Log Error
         │           Return Error
         │           Message
         │                    │
         └─────────┬──────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ HTTP Response        │
        │ (200 or 500)         │
        └──────────────────────┘
```

---

## Home Screen Content Update Timeline

```
Admin Action                  Customer App
    │                             │
    ▼                             ▼
Change in Admin Panel         Customer Opens App
    │                             │
    │                             ├─ GET /v1/api/home
    │                             │
    ├─ POST/PUT/DELETE       ▼    │
    │ /admin/banners      Database │
    │                        │      │
    ▼                        │      │
 Update DB                   │      ▼
    │                        │   Query DB
    │                    ✅ Data │
    │                        │ Updated
    │                        │      │
    │                        ▼      │
    │                   Returns     │
    │                   New Data    │
    │                        │      │
    │                        ▼      ▼
    └────────────────── Customer App
                        Receives New Data
                              │
                              ▼
                           UI Updates
                              │
                              ▼
                        Customer Sees
                        New Banners! 🎉
```

---

**Architecture Design**: January 3, 2026
**Status**: ✅ COMPLETE & DOCUMENTED
