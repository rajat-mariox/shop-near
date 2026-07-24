# Seller Products API - Quick Reference Guide

## API Base URL
```
http://localhost:5000/sellers
```

All endpoints require authentication header:
```
Authorization: Bearer <seller_jwt_token>
```

---

## 1️⃣ LIST PRODUCTS

### Basic List
```bash
GET /sellers/products?page=1&limit=10
```

### Filter by Category
```bash
GET /sellers/products?categoryId=64a1b2c3d4e5f6g7h8i9j0k1
```

### Filter by Price Range
```bash
GET /sellers/products?minPrice=100&maxPrice=1000
```

### Filter by Date Range
```bash
GET /sellers/products?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z
```

### Filter by Stock Status
```bash
# In stock products
GET /sellers/products?stock=1

# Out of stock products
GET /sellers/products?stock=0
```

### Filter by Rating
```bash
GET /sellers/products?rating=4.0
```

### Filter by Status
```bash
GET /sellers/products?isActive=true
```

### Search Products
```bash
GET /sellers/products?search=t-shirt
```

### Combined Filters
```bash
GET /sellers/products?categoryId=xyz&minPrice=100&maxPrice=1000&stock=1&rating=4&isActive=true&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "message": "products_list",
  "data": {
    "page": 1,
    "limit": 10,
    "total_products": 45,
    "products": [...]
  }
}
```

---

## 2️⃣ GET PRODUCT DETAILS

```bash
GET /sellers/products/64a1b2c3d4e5f6g7h8i9j0k1
```

**Response:**
```json
{
  "success": true,
  "message": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "productName": "Blue T-Shirt",
    "price": 499,
    "stock": 50,
    "rating": 4.5,
    ...
  }
}
```

---

## 3️⃣ CREATE PRODUCT

### Using cURL with Images:
```bash
curl -X POST http://localhost:5000/sellers/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productName=Blue T-Shirt" \
  -F "categoryId=64a1b2c3d4e5f6g7h8i9j0k1" \
  -F "price=499" \
  -F "stock=50" \
  -F "description=High quality cotton t-shirt" \
  -F "brand=MyBrand" \
  -F "discountPrice=399" \
  -F "discountPercent=20" \
  -F "colors=[{\"name\":\"Blue\",\"code\":\"#0000FF\"},{\"name\":\"Red\",\"code\":\"#FF0000\"}]" \
  -F "sizes=[{\"label\":\"S\",\"inStock\":true},{\"label\":\"M\",\"inStock\":true},{\"label\":\"L\",\"inStock\":true}]" \
  -F "highlights=[{\"text\":\"100% Cotton\"},{\"text\":\"Free Shipping\"}]" \
  -F "productImages=@/path/to/image1.jpg" \
  -F "productImages=@/path/to/image2.jpg" \
  -F "descriptionImages=@/path/to/desc1.jpg" \
  -F "isFeatured=false" \
  -F "isActive=true"
```

### Using JavaScript/Fetch:
```javascript
const formData = new FormData();
formData.append('productName', 'Blue T-Shirt');
formData.append('categoryId', 'category_id');
formData.append('price', 499);
formData.append('stock', 50);
formData.append('description', 'High quality cotton t-shirt');
formData.append('brand', 'MyBrand');
formData.append('colors', JSON.stringify([
  {name: 'Blue', code: '#0000FF'},
  {name: 'Red', code: '#FF0000'}
]));
formData.append('sizes', JSON.stringify([
  {label: 'S', inStock: true},
  {label: 'M', inStock: true}
]));

// Add files
document.getElementById('image1').files[0] && 
  formData.append('productImages', document.getElementById('image1').files[0]);
document.getElementById('image2').files[0] && 
  formData.append('productImages', document.getElementById('image2').files[0]);

const response = await fetch('/sellers/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

### Using Postman:
1. Set method to `POST`
2. URL: `{{baseUrl}}/sellers/products`
3. Headers: `Authorization: Bearer {{seller_token}}`
4. Body → form-data:
   - `productName` (text): Blue T-Shirt
   - `categoryId` (text): category_id
   - `price` (text): 499
   - `stock` (text): 50
   - `description` (text): High quality cotton t-shirt
   - `brand` (text): MyBrand
   - `colors` (text): [{"name":"Blue","code":"#0000FF"}]
   - `sizes` (text): [{"label":"S","inStock":true}]
   - `productImages` (file): image1.jpg, image2.jpg
   - `isFeatured` (text): false
   - `isActive` (text): true

**Minimal Required Fields:**
```
- productName (string, required)
- categoryId (string, required)
- price (number, required)
- stock (number, required)
- description (string, required)
```

---

## 4️⃣ UPDATE PRODUCT

### Update Price and Stock:
```bash
curl -X PUT http://localhost:5000/sellers/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "price=449" \
  -F "stock=75"
```

### Update with New Images:
```bash
curl -X PUT http://localhost:5000/sellers/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "productName=Red T-Shirt" \
  -F "price=449" \
  -F "stock=75" \
  -F "productImages=@/path/to/newimage1.jpg" \
  -F "productImages=@/path/to/newimage2.jpg" \
  -F "isActive=true"
```

### Update Status Only:
```bash
curl -X PUT http://localhost:5000/sellers/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "isActive=false"
```

**Optional Fields for Update:**
```
- productName
- price
- stock
- description
- brand
- discountPrice
- discountPercent
- colors
- sizes
- highlights
- features
- isFeatured
- showOnDashboard
- isActive
- productImages (replaces all)
- descriptionImages (replaces all)
```

---

## 5️⃣ DELETE PRODUCT

```bash
curl -X DELETE http://localhost:5000/sellers/products/64a1b2c3d4e5f6g7h8i9j0k1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Note:** This is a soft delete. The product is marked as deleted but not removed from database.

---

## 📋 FILTER PARAMETERS REFERENCE

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (starts at 1) |
| `limit` | number | 10 | Items per page |
| `categoryId` | string | "64a1..." | Filter by category |
| `startDate` | string | "2025-01-01T00:00:00Z" | From date (ISO format) |
| `endDate` | string | "2025-01-31T23:59:59Z" | To date (ISO format) |
| `minPrice` | number | 100 | Minimum price |
| `maxPrice` | number | 1000 | Maximum price |
| `stock` | number | 0 or 1 | 0=out, 1=in stock |
| `rating` | number | 4.0 | Minimum rating |
| `isActive` | boolean | true | true/false |
| `search` | string | "shirt" | Search text |

---

## 🔑 REQUEST/RESPONSE EXAMPLES

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "products_list",
  "data": {
    "page": 1,
    "limit": 10,
    "total_products": 45,
    "products": [...]
  }
}
```

### Validation Error (400)
```json
{
  "success": false,
  "rCode": 0,
  "message": "The productName field must not be empty."
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "rCode": 2,
  "message": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "success": false,
  "rCode": 5,
  "message": "product_not_found",
  "data": {}
}
```

---

## 🎨 COMPLEX FIELD FORMATS

### Colors (as JSON string in form data):
```json
[
  {"name": "Blue", "code": "#0000FF"},
  {"name": "Red", "code": "#FF0000"},
  {"name": "Green", "code": "#008000"}
]
```

### Sizes (as JSON string in form data):
```json
[
  {"label": "S", "inStock": true},
  {"label": "M", "inStock": true},
  {"label": "L", "inStock": false},
  {"label": "XL", "inStock": true}
]
```

### Highlights (as JSON string in form data):
```json
[
  {"text": "100% Cotton"},
  {"text": "Free Shipping"},
  {"text": "30-Day Return"},
  {"text": "Cashback Available"}
]
```

---

## 💡 USAGE TIPS

1. **Always include auth header** with valid seller token
2. **Use ISO format for dates**: `YYYY-MM-DDTHH:mm:ssZ`
3. **JSON fields in form-data** must be sent as strings, not objects
4. **Multiple files** can be sent with same field name
5. **Images are uploaded to S3** - ensure AWS credentials are configured
6. **Soft delete only** - deleted products can potentially be restored from database
7. **Seller isolation** - can only access/modify your own products
8. **Case-insensitive search** - search works on productName and description

---

## 🧪 TESTING CHECKLIST

- [ ] List all products (no filters)
- [ ] List with category filter
- [ ] List with price range
- [ ] List with date range
- [ ] List with stock filter
- [ ] List with rating filter
- [ ] List with search
- [ ] Get product detail
- [ ] Create product (minimal fields)
- [ ] Create product (all fields)
- [ ] Create with images
- [ ] Update product (partial)
- [ ] Update product (with images)
- [ ] Delete product
- [ ] Verify product not accessible after delete
- [ ] Test without auth header (should fail)
- [ ] Test with invalid product ID (should fail)

---

**Last Updated**: January 3, 2025
**API Version**: 1.0
