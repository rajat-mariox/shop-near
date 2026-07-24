# Seller Products API Documentation

## Overview
This document describes the seller products flow API endpoints. These endpoints allow sellers to manage their products with comprehensive filtering, creation, editing, and deletion capabilities.

---

## Base URL
```
/seller
```

All endpoints require seller authentication via `AuthMiddleware().verifySellerToken`

---

## 1. List Seller Products

**Endpoint:** `GET /seller/products`

**Authentication:** Required (Seller Token)

**Description:** Get a paginated list of seller's products with advanced filtering options.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `categoryId` | string | No | Filter by category ID |
| `startDate` | string | No | Filter products created from this date (ISO format) |
| `endDate` | string | No | Filter products created until this date (ISO format) |
| `minPrice` | number | No | Filter by minimum price |
| `maxPrice` | number | No | Filter by maximum price |
| `stock` | number | No | Filter by stock status (0 = out of stock, 1 = in stock) |
| `isActive` | boolean | No | Filter by product status (active/inactive) |
| `rating` | number | No | Filter products with minimum rating |
| `search` | string | No | Search by product name or description |

### Request Example
```bash
GET /seller/products?page=1&limit=10&categoryId=123&minPrice=100&maxPrice=1000&isActive=true
```

### Response Example
```json
{
  "success": true,
  "message": "products_list",
  "data": {
    "page": 1,
    "limit": 10,
    "total_products": 45,
    "products": [
      {
        "_id": "product_id_1",
        "productName": "Blue T-Shirt",
        "categoryId": {
          "_id": "category_id",
          "name": "Clothing"
        },
        "shopId": {
          "_id": "shop_id",
          "shopName": "My Store"
        },
        "price": 499,
        "discountPrice": 399,
        "stock": 50,
        "rating": 4.5,
        "isActive": true,
        "createdAt": "2025-01-03T10:30:00Z"
      }
    ],
    "filters": {
      "categoryId": "123",
      "startDate": null,
      "endDate": null,
      "minPrice": "100",
      "maxPrice": "1000",
      "isActive": "true",
      "search": null
    }
  }
}
```

---

## 2. Get Product Detail

**Endpoint:** `GET /seller/products/:id`

**Authentication:** Required (Seller Token)

**Description:** Get detailed information about a specific product.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

### Request Example
```bash
GET /seller/products/64a1b2c3d4e5f6g7h8i9j0k1
```

### Response Example
```json
{
  "success": true,
  "message": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "productName": "Blue T-Shirt",
    "brand": "MyBrand",
    "categoryId": {
      "_id": "category_id",
      "name": "Clothing"
    },
    "shopId": {
      "_id": "shop_id",
      "shopName": "My Store"
    },
    "productImages": [
      { "url": "https://s3.url/image1.jpg" },
      { "url": "https://s3.url/image2.jpg" }
    ],
    "price": 499,
    "discountPrice": 399,
    "discountPercent": 20,
    "stock": 50,
    "rating": 4.5,
    "totalRatings": 120,
    "description": "High quality cotton t-shirt",
    "colors": [
      { "name": "Blue", "code": "#0000FF" },
      { "name": "Red", "code": "#FF0000" }
    ],
    "sizes": [
      { "label": "S", "inStock": true },
      { "label": "M", "inStock": true },
      { "label": "L", "inStock": true }
    ],
    "isActive": true,
    "isFeatured": false,
    "showOnDashboard": false,
    "createdAt": "2025-01-03T10:30:00Z",
    "updatedAt": "2025-01-03T10:30:00Z"
  }
}
```

---

## 3. Create Product

**Endpoint:** `POST /seller/products`

**Authentication:** Required (Seller Token)

**Description:** Create a new product for the seller.

### Request Body (Multipart Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productName` | string | Yes | Product name |
| `categoryId` | string | Yes | Category ID |
| `price` | number | Yes | Product price |
| `stock` | number | Yes | Stock quantity |
| `description` | string | Yes | Product description |
| `brand` | string | No | Brand name |
| `discountPrice` | number | No | Discounted price |
| `discountPercent` | number | No | Discount percentage |
| `currency` | string | No | Currency (default: ₹) |
| `colors` | JSON string | No | Array of color objects: `[{"name":"Blue","code":"#0000FF"}]` |
| `sizes` | JSON string | No | Array of size objects: `[{"label":"S","inStock":true}]` |
| `highlights` | JSON string | No | Array of highlight objects: `[{"text":"highlight text"}]` |
| `features` | string | No | Feature description |
| `isFeatured` | boolean | No | Mark as featured product |
| `showOnDashboard` | boolean | No | Show on dashboard |
| `isActive` | boolean | No | Product status (default: true) |
| `productImages` | file[] | No | Product images (multiple files) |
| `descriptionImages` | file[] | No | Description images (multiple files) |

### Request Example (cURL)
```bash
curl -X POST http://localhost:5000/seller/products \
  -H "Authorization: Bearer your_seller_token" \
  -F "productName=Blue T-Shirt" \
  -F "categoryId=category_id" \
  -F "price=499" \
  -F "stock=50" \
  -F "description=High quality cotton t-shirt" \
  -F "brand=MyBrand" \
  -F "discountPrice=399" \
  -F "discountPercent=20" \
  -F "colors=[{\"name\":\"Blue\",\"code\":\"#0000FF\"}]" \
  -F "sizes=[{\"label\":\"S\",\"inStock\":true}]" \
  -F "productImages=@image1.jpg" \
  -F "productImages=@image2.jpg"
```

### Response Example
```json
{
  "success": true,
  "message": "product_created",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "productName": "Blue T-Shirt",
    "categoryId": "category_id",
    "shopId": "shop_id",
    "price": 499,
    "discountPrice": 399,
    "stock": 50,
    "isActive": true,
    "createdAt": "2025-01-03T10:30:00Z"
  }
}
```

---

## 4. Edit Product

**Endpoint:** `PUT /seller/products/:id`

**Authentication:** Required (Seller Token)

**Description:** Update an existing product.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

### Request Body (Multipart Form Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `productName` | string | No | Product name |
| `price` | number | No | Product price |
| `stock` | number | No | Stock quantity |
| `description` | string | No | Product description |
| `brand` | string | No | Brand name |
| `discountPrice` | number | No | Discounted price |
| `discountPercent` | number | No | Discount percentage |
| `colors` | JSON string | No | Array of color objects |
| `sizes` | JSON string | No | Array of size objects |
| `highlights` | JSON string | No | Array of highlight objects |
| `features` | string | No | Feature description |
| `isFeatured` | boolean | No | Mark as featured product |
| `showOnDashboard` | boolean | No | Show on dashboard |
| `isActive` | boolean | No | Product status |
| `productImages` | file[] | No | Product images (replaces existing) |
| `descriptionImages` | file[] | No | Description images (replaces existing) |

### Request Example (cURL)
```bash
curl -X PUT http://localhost:5000/seller/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer your_seller_token" \
  -F "price=449" \
  -F "stock=75" \
  -F "discountPrice=349"
```

### Response Example
```json
{
  "success": true,
  "message": "product_updated",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "productName": "Blue T-Shirt",
    "categoryId": "category_id",
    "shopId": "shop_id",
    "price": 449,
    "discountPrice": 349,
    "stock": 75,
    "updatedAt": "2025-01-03T11:30:00Z"
  }
}
```

---

## 5. Delete Product

**Endpoint:** `DELETE /seller/products/:id`

**Authentication:** Required (Seller Token)

**Description:** Delete (soft delete) a seller's product.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Product ID |

### Request Example
```bash
curl -X DELETE http://localhost:5000/seller/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer your_seller_token"
```

### Response Example
```json
{
  "success": true,
  "message": "product_deleted",
  "data": {}
}
```

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "rCode": 0,
  "message": "The productName field must not be empty."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "rCode": 2,
  "message": "Unauthorized"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "rCode": 5,
  "message": "product_not_found",
  "data": {}
}
```

### 500 - Server Error
```json
{
  "success": false,
  "rCode": 1,
  "message": "Internal server error"
}
```

---

## Filter Examples

### Example 1: Products in a specific category
```bash
GET /seller/products?categoryId=64a1b2c3d4e5f6g7h8i9j0k1
```

### Example 2: Products within a price range
```bash
GET /seller/products?minPrice=100&maxPrice=1000
```

### Example 3: Products created in a date range
```bash
GET /seller/products?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
```

### Example 4: Out of stock products
```bash
GET /seller/products?stock=0
```

### Example 5: In stock products with rating >= 4.0
```bash
GET /seller/products?stock=1&rating=4.0
```

### Example 6: Products matching a search term
```bash
GET /seller/products?search=t-shirt
```

### Example 7: Inactive products
```bash
GET /seller/products?isActive=false
```

### Example 8: Combined filters
```bash
GET /seller/products?categoryId=64a1b2c3d4e5f6g7h8i9j0k1&minPrice=100&maxPrice=1000&stock=1&isActive=true&page=1&limit=20
```

---

## Notes

1. **Seller Identification**: The seller is identified from the JWT token in the request. All products are automatically associated with the authenticated seller.

2. **Soft Delete**: Deleted products are marked with `isDeleted: true` and will not appear in list queries.

3. **Date Format**: Use ISO 8601 format for dates: `YYYY-MM-DDTHH:mm:ssZ`

4. **Image Upload**: Images are uploaded to AWS S3 and stored as URLs. Use multipart/form-data for file uploads.

5. **JSON Strings**: Colors, sizes, and highlights must be sent as JSON strings when using form data.

6. **Pagination**: Default page size is 10. Use `limit` parameter to change.

7. **Search**: Search works on product name and description fields (case-insensitive).

8. **Stock Filter**: 
   - `stock=0` returns out of stock products
   - `stock=1` returns in stock products
   - Omit for all products

---

## Implementation Notes

### File Structure
- **Service**: `src/services/ProductService.js` - Database operations
- **Controller**: `src/controllers/SellerController.js` - Business logic
- **Validator**: `src/validators/AdminValidator.js` - Input validation
- **Routes**: `src/routes/seller.js` - API endpoints

### Key Methods Added
- `getSellerProducts()` - List products with pagination
- `countSellerProducts()` - Count products for pagination
- `getSellerProductDetail()` - Get product details
- `createSellerProduct()` - Create new product
- `updateSellerProduct()` - Update product
- `deleteSellerProduct()` - Soft delete product

---

**Last Updated**: January 3, 2025
**API Version**: 1.0
