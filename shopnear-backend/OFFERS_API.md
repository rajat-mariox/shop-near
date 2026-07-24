# Offers Management System - API Documentation

## Overview
Complete offers management system for the Shopnear e-commerce platform. Allows admins to create and manage promotional offers that display on the customer home page and are filtered by category, brand, or product.

---

## Table of Contents
1. [Admin Offers Management](#admin-offers-management)
2. [Customer Offers Display](#customer-offers-display)
3. [Data Model](#data-model)
4. [Offer Types](#offer-types)

---

## Admin Offers Management

### 1. Create Offer
**Endpoint:** `POST /v1/api/offers/admin/create`

**Description:** Create a new promotional offer.

**Request Body:**
```json
{
  "title": "T-shirt Sale",
  "description": "Save up to 50% on T-shirts",
  "offerType": "product",
  "priceStartsAt": 150,
  "discountPercentage": 50,
  "discountAmount": null,
  "image": "https://example.com/tshirt-offer.jpg",
  "bgColor": "#FFE9C6",
  "categories": [],
  "brands": [],
  "products": ["60d5ec49c1234567890abcd1", "60d5ec49c1234567890abcd2"],
  "startDate": "2026-01-03T00:00:00Z",
  "endDate": "2026-02-03T23:59:59Z",
  "isActive": true,
  "displayOnHome": true,
  "priority": 5
}
```

**Field Descriptions:**
- `title` (string, required): Offer title (e.g., "T-shirt Sale")
- `description` (string): Detailed description
- `offerType` (string, required): One of "category", "brand", "product", "general"
- `priceStartsAt` (number, required): Starting price for the offer
- `discountPercentage` (number): Discount percentage (0-100)
- `discountAmount` (number): Fixed discount amount
- `image` (string, required): Offer image URL
- `bgColor` (string): Background color for display (hex color)
- `categories` (array): Category ObjectIds applicable for this offer
- `brands` (array): Brand ObjectIds applicable for this offer
- `products` (array): Product ObjectIds applicable for this offer
- `startDate` (string, required): Offer start date/time
- `endDate` (string, required): Offer expiry date/time
- `isActive` (boolean): Whether offer is active
- `displayOnHome` (boolean): Display on home page
- `priority` (number): Display priority (higher = shows first)

**Response:**
```json
{
  "success": true,
  "message": "Offer created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "title": "T-shirt Sale",
    "priceStartsAt": 150,
    "discountPercentage": 50,
    "image": "https://example.com/tshirt-offer.jpg",
    "bgColor": "#FFE9C6",
    "isActive": true,
    "displayOnHome": true,
    "priority": 5
  }
}
```

---

### 2. Get All Offers
**Endpoint:** `GET /v1/api/offers/admin/list?page=1&limit=10&search=&isActive=true`

**Description:** Retrieve all offers with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page
- `search` (string): Search by offer title
- `isActive` (boolean): Filter by active status

**Response:**
```json
{
  "success": true,
  "message": "Offers retrieved successfully",
  "data": {
    "offers": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "title": "T-shirt Sale",
        "priceStartsAt": 150,
        "discountPercentage": 50,
        "image": "https://example.com/tshirt-offer.jpg",
        "isActive": true,
        "displayOnHome": true,
        "priority": 5
      }
    ],
    "pagination": {
      "totalRecords": 12,
      "totalPages": 2,
      "currentPage": 1,
      "limit": 10
    }
  }
}
```

---

### 3. Get Offer Detail
**Endpoint:** `GET /v1/api/offers/admin/:id`

**Description:** Get detailed information about a specific offer.

**Path Parameters:**
- `id` (string, required): Offer ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Offer retrieved successfully",
  "data": {
    "offer": {
      "_id": "60d5ec49c1234567890abcde",
      "title": "T-shirt Sale",
      "description": "Save up to 50% on T-shirts",
      "offerType": "product",
      "priceStartsAt": 150,
      "discountPercentage": 50,
      "image": "https://example.com/tshirt-offer.jpg",
      "bgColor": "#FFE9C6",
      "categories": [],
      "brands": [],
      "products": [
        {
          "_id": "60d5ec49c1234567890abcd1",
          "productName": "Casual T-shirt"
        }
      ],
      "startDate": "2026-01-03T00:00:00Z",
      "endDate": "2026-02-03T23:59:59Z",
      "isActive": true,
      "displayOnHome": true,
      "priority": 5
    },
    "stats": {
      "totalActive": 8,
      "activeOnHome": 5,
      "expiredOffers": 3
    }
  }
}
```

---

### 4. Update Offer
**Endpoint:** `PUT /v1/api/offers/admin/:id`

**Description:** Update an existing offer (all fields optional).

**Path Parameters:**
- `id` (string, required): Offer ObjectId

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "discountPercentage": 40,
  "priority": 10,
  "endDate": "2026-03-03T23:59:59Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Offer updated successfully",
  "data": {
    "offer": {
      "_id": "60d5ec49c1234567890abcde",
      "title": "Updated Title",
      "discountPercentage": 40,
      "priority": 10,
      "updatedAt": "2026-01-03T10:30:00Z"
    }
  }
}
```

---

### 5. Delete Offer
**Endpoint:** `DELETE /v1/api/offers/admin/:id`

**Description:** Permanently delete an offer.

**Path Parameters:**
- `id` (string, required): Offer ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Offer deleted successfully",
  "data": {
    "offer": {
      "_id": "60d5ec49c1234567890abcde",
      "title": "T-shirt Sale"
    }
  }
}
```

---

### 6. Toggle Offer Status
**Endpoint:** `PATCH /v1/api/offers/admin/:id/toggle`

**Description:** Toggle offer active/inactive status.

**Path Parameters:**
- `id` (string, required): Offer ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Offer status updated successfully",
  "data": {
    "offer": {
      "_id": "60d5ec49c1234567890abcde",
      "title": "T-shirt Sale",
      "isActive": false
    }
  }
}
```

---

### 7. Get Offer Statistics
**Endpoint:** `GET /v1/api/offers/admin/stats/overview`

**Description:** Get statistics about all offers.

**Response:**
```json
{
  "success": true,
  "message": "Offer statistics retrieved successfully",
  "data": {
    "stats": {
      "totalActive": 8,
      "activeOnHome": 5,
      "expiredOffers": 3
    }
  }
}
```

---

## Customer Offers Display

### 1. Get Home Page Offers
**Endpoint:** `GET /v1/api/offers/home`

**Description:** Get active offers to display on customer home page. Returns offers that are:
- Active (`isActive: true`)
- Configured to display on home (`displayOnHome: true`)
- Within valid date range
- Sorted by priority

**Response:**
```json
{
  "success": true,
  "message": "Home page offers retrieved successfully",
  "data": {
    "offers": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "title": "T-shirt",
        "priceStartsAt": 150,
        "image": "https://example.com/tshirt-offer.jpg",
        "bgColor": "#FFE9C6",
        "discountPercentage": 50
      },
      {
        "_id": "60d5ec49c1234567890abcd2",
        "title": "Buy Shirts",
        "priceStartsAt": 160,
        "image": "https://example.com/shirt-offer.jpg",
        "bgColor": "#C7E9FF",
        "discountPercentage": 30
      }
    ]
  }
}
```

**Integration in HomeScreen:**
```javascript
// HomeScreen response includes offers
{
  banners: [...],
  nearShops: [...],
  offers: [...], // Dynamic offers from database
  brands: [...],
  promoCodes: [...]
}
```

---

### 2. Get Category Offers
**Endpoint:** `GET /v1/api/offers/category/:categoryId`

**Description:** Get offers applicable to a specific category.

**Path Parameters:**
- `categoryId` (string, required): Category ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Category offers retrieved successfully",
  "data": {
    "offers": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "title": "T-shirt Sale",
        "priceStartsAt": 150,
        "image": "https://example.com/tshirt-offer.jpg",
        "bgColor": "#FFE9C6",
        "discountPercentage": 50
      }
    ]
  }
}
```

---

### 3. Get Brand Offers
**Endpoint:** `GET /v1/api/offers/brand/:brandId`

**Description:** Get offers applicable to a specific brand.

**Path Parameters:**
- `brandId` (string, required): Brand ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Brand offers retrieved successfully",
  "data": {
    "offers": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "title": "GUCCI Special",
        "priceStartsAt": 5000,
        "image": "https://example.com/gucci-offer.jpg",
        "bgColor": "#FFD700",
        "discountPercentage": 30
      }
    ]
  }
}
```

---

### 4. Get Product Offers
**Endpoint:** `GET /v1/api/offers/product/:productId`

**Description:** Get offers applicable to a specific product.

**Path Parameters:**
- `productId` (string, required): Product ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Product offers retrieved successfully",
  "data": {
    "offers": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "title": "Blue Jeans Special",
        "priceStartsAt": 450,
        "image": "https://example.com/jeans-offer.jpg",
        "bgColor": "#E4FFD3",
        "discountPercentage": 20
      }
    ]
  }
}
```

---

## Data Model

### Offers Schema
```javascript
{
  _id: ObjectId,
  
  // Basic Info
  title: String (required),
  description: String,
  offerType: String (category|brand|product|general),
  
  // Pricing
  priceStartsAt: Number (required),
  discountPercentage: Number,
  discountAmount: Number,
  
  // Display
  image: String (required),
  bgColor: String (default: "#FFE9C6"),
  priority: Number (default: 0),
  
  // Applicability
  categories: [ObjectId],
  brands: [ObjectId],
  products: [ObjectId],
  
  // Dates
  startDate: Date (required),
  endDate: Date (required),
  
  // Status
  isActive: Boolean (default: true),
  displayOnHome: Boolean (default: true),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `isActive` + `displayOnHome` + `endDate` (for home page queries)

---

## Offer Types

### 1. Category Offer
Applied to specific product categories
```json
{
  "offerType": "category",
  "categories": ["60d5ec49c1234567890abcd1"],
  "brands": [],
  "products": []
}
```

### 2. Brand Offer
Applied to specific brands
```json
{
  "offerType": "brand",
  "categories": [],
  "brands": ["60d5ec49c1234567890abcd2"],
  "products": []
}
```

### 3. Product Offer
Applied to specific products
```json
{
  "offerType": "product",
  "categories": [],
  "brands": [],
  "products": ["60d5ec49c1234567890abcd3"]
}
```

### 4. General Offer
Applied to all products
```json
{
  "offerType": "general",
  "categories": [],
  "brands": [],
  "products": []
}
```

---

## Discount Calculation

### Percentage Discount
```
discount = (priceStartsAt * discountPercentage) / 100
```

Example:
```
Price: ₹500
Discount: 50%
Final Price: ₹250
```

### Fixed Amount Discount
```
finalPrice = priceStartsAt - discountAmount
```

Example:
```
Price: ₹500
Discount: ₹100
Final Price: ₹400
```

---

## Display on Home Page

### Conditions
An offer displays on the home page if ALL of these are true:
- ✅ `isActive` = `true`
- ✅ `displayOnHome` = `true`
- ✅ Current date >= `startDate`
- ✅ Current date <= `endDate`

### Sorting
Offers are sorted by:
1. `priority` (descending) - Higher priority shows first
2. `createdAt` (descending) - Newer offers show first

### Maximum Display
Home page shows maximum 10 active offers

---

## Example Usage

### Admin Creates Offer
```bash
curl -X POST http://localhost:9110/v1/api/offers/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Save up to 50% + Extra Discount",
    "offerType": "category",
    "priceStartsAt": 150,
    "discountPercentage": 50,
    "image": "https://example.com/offer.jpg",
    "bgColor": "#FFE9C6",
    "categories": ["category-id-1"],
    "startDate": "2026-01-03T00:00:00Z",
    "endDate": "2026-02-03T23:59:59Z",
    "displayOnHome": true,
    "priority": 5
  }'
```

### Customer Views Home Page
```bash
curl -X GET http://localhost:9110/v1/api/home
```

Response includes:
```json
{
  "offers": [
    {
      "title": "Save up to 50% + Extra Discount",
      "priceStartsAt": 150,
      "image": "https://example.com/offer.jpg",
      "bgColor": "#FFE9C6",
      "discountPercentage": 50
    }
  ]
}
```

---

## File Structure

```
src/
├── models/
│   └── Offers.js           (Schema)
├── services/
│   └── OffersService.js    (Business Logic)
├── controllers/
│   └── OffersController.js (API Handlers)
├── routes/
│   └── offers.js           (Endpoints)
├── validators/
│   └── AdminValidator.js   (Updated with Offers validators)
└── controllers/
    └── HomeScreenController.js (Updated to fetch offers)
```

---

## Best Practices

1. **Dates**: Always use ISO 8601 format for start/end dates
2. **Priority**: Use 0-10 for priority values
3. **Images**: Use URLs (support for S3 uploads coming soon)
4. **BgColor**: Use hex colors (#RRGGBB format)
5. **Monitoring**: Monitor offer expiry dates and update automatically
6. **Performance**: Offers are cached with indexes for fast retrieval

---

## Future Enhancements

- [ ] Image upload to S3
- [ ] Offer expiry notifications
- [ ] A/B testing for offers
- [ ] Coupon+Offer combination support
- [ ] Analytics dashboard for offer performance
- [ ] Automatic offer creation from sales patterns
