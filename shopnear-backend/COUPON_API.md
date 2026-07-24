# Coupon Management System API Documentation

## Overview
Complete coupon management system supporting admin creation/management, customer application with validation, and seller visibility of applicable coupons.

---

## Table of Contents
1. [Admin Coupon Management](#admin-coupon-management)
2. [Customer Coupon Operations](#customer-coupon-operations)
3. [Seller Coupon Visibility](#seller-coupon-visibility)
4. [Coupon Validation Rules](#coupon-validation-rules)
5. [Discount Calculation](#discount-calculation)
6. [Data Models](#data-models)

---

## Admin Coupon Management

### 1. Create Coupon
**Endpoint:** `POST /v1/api/coupon/admin/create`

**Description:** Admin creates a new coupon with discount rules and restrictions.

**Request Body:**
```json
{
  "code": "SUMMER50",
  "title": "Summer Sale",
  "description": "50% discount on electronics",
  "discountType": "percentage",
  "discountValue": 50,
  "discountCap": 500,
  "minOrderValue": 1000,
  "maxUsageLimit": 100,
  "expiryDate": "2024-12-31T23:59:59Z",
  "applicableUserTypes": ["all"],
  "applicablePaymentModes": ["upi", "card", "wallet"],
  "applicableCategories": ["60d5ec49c1234567890abcd1", "60d5ec49c1234567890abcd2"],
  "applicableProducts": ["60d5ec49c1234567890abcd3"],
  "isActive": true
}
```

**Field Descriptions:**
- `code` (string, required): Unique coupon code (e.g., "SUMMER50")
- `title` (string, required): Coupon name/title
- `description` (string): Detailed description
- `discountType` (string, required): Either "percentage" or "fixed"
- `discountValue` (number, required): Discount amount (percentage or fixed)
- `discountCap` (number): Maximum discount amount (for percentage discounts)
- `minOrderValue` (number): Minimum order value to apply coupon (default: 0)
- `maxUsageLimit` (number): Total times coupon can be used
- `expiryDate` (date): Coupon expiry date/time
- `applicableUserTypes` (array): 
  - "all" - All users
  - "new" - Only new users
  - "specific" - Specific user IDs (requires userIds array)
- `applicablePaymentModes` (array): Payment modes where coupon is valid (upi, card, wallet, etc.)
- `applicableCategories` (array): Category ObjectIds where coupon applies
- `applicableProducts` (array): Product ObjectIds where coupon applies
- `isActive` (boolean): Whether coupon is active

**Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "code": "SUMMER50",
    "title": "Summer Sale",
    "discountType": "percentage",
    "discountValue": 50,
    "discountCap": 500,
    "minOrderValue": 1000,
    "maxUsageLimit": 100,
    "usageCount": 0,
    "expiryDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get All Coupons
**Endpoint:** `GET /v1/api/coupon/admin/list?page=1&limit=10&search=SUMMER&isActive=true`

**Description:** Retrieve list of all coupons with pagination and filters.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page
- `search` (string): Search by coupon code or title
- `isActive` (boolean): Filter by active status
- `sortBy` (string): Sort field (default: createdAt)
- `order` (string): asc or desc (default: desc)

**Response:**
```json
{
  "success": true,
  "message": "Coupons retrieved successfully",
  "data": {
    "coupons": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "code": "SUMMER50",
        "title": "Summer Sale",
        "discountType": "percentage",
        "discountValue": 50,
        "minOrderValue": 1000,
        "expiryDate": "2024-12-31T23:59:59Z",
        "usageCount": 45,
        "maxUsageLimit": 100,
        "isActive": true
      }
    ],
    "totalRecords": 1,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 3. Get Coupon Details
**Endpoint:** `GET /v1/api/coupon/admin/:id`

**Description:** Retrieve detailed information about a specific coupon including usage statistics.

**Path Parameters:**
- `id` (string, required): Coupon ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Coupon retrieved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "code": "SUMMER50",
    "title": "Summer Sale",
    "description": "50% discount on electronics",
    "discountType": "percentage",
    "discountValue": 50,
    "discountCap": 500,
    "minOrderValue": 1000,
    "maxUsageLimit": 100,
    "usageCount": 45,
    "totalDiscountAmount": 22500,
    "totalRevenueGenerated": 45000,
    "applicableUserTypes": ["all"],
    "applicablePaymentModes": ["upi", "card"],
    "applicableCategories": ["60d5ec49c1234567890abcd1"],
    "applicableProducts": [],
    "expiryDate": "2024-12-31T23:59:59Z",
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Statistics Included:**
- `usageCount`: Number of times coupon has been used
- `totalDiscountAmount`: Total discount given via this coupon
- `totalRevenueGenerated`: Total order value from coupon usage

---

### 4. Update Coupon
**Endpoint:** `PUT /v1/api/coupon/admin/:id`

**Description:** Update existing coupon details (all fields optional).

**Path Parameters:**
- `id` (string, required): Coupon ObjectId

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "discountValue": 60,
  "discountCap": 600,
  "minOrderValue": 500,
  "expiryDate": "2024-12-31T23:59:59Z",
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "code": "SUMMER50",
    "title": "Updated Title",
    "discountValue": 60,
    "discountCap": 600,
    "minOrderValue": 500,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

---

### 5. Delete Coupon
**Endpoint:** `DELETE /v1/api/coupon/admin/:id`

**Description:** Soft delete or permanently remove a coupon.

**Path Parameters:**
- `id` (string, required): Coupon ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Coupon deleted successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "code": "SUMMER50"
  }
}
```

---

## Customer Coupon Operations

### 1. Get Available Coupons
**Endpoint:** `GET /v1/api/coupon/available`

**Description:** Retrieve coupons available for the logged-in customer.

**Authentication:** Required (User JWT Token)

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Available coupons retrieved successfully",
  "data": {
    "coupons": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "code": "SUMMER50",
        "title": "Summer Sale",
        "description": "50% discount on electronics",
        "discountType": "percentage",
        "discountValue": 50,
        "discountCap": 500,
        "minOrderValue": 1000,
        "expiryDate": "2024-12-31T23:59:59Z",
        "isActive": true
      }
    ],
    "totalRecords": 5,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 2. Apply Coupon to Order
**Endpoint:** `POST /v1/api/coupon/apply`

**Description:** Apply a coupon code to a customer's order. Updates order with coupon discount and recalculates grand total.

**Authentication:** Required (User JWT Token)

**Request Body:**
```json
{
  "code": "SUMMER50",
  "orderId": "60d5ec49c1234567890abcd0"
}
```

**Validation Rules Applied:**
- ✅ Coupon code must exist
- ✅ Coupon must be active
- ✅ Coupon must not be expired
- ✅ Order value must meet minimum requirement
- ✅ User must be eligible (new/all/specific)
- ✅ Payment mode must be applicable
- ✅ Order products/categories must match coupon restrictions
- ✅ Coupon usage limit must not be exceeded
- ✅ User must not have exceeded usage limit (if per-user limit exists)

**Response (Success):**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "orderId": "60d5ec49c1234567890abcd0",
    "couponCode": "SUMMER50",
    "discountAmount": 500,
    "originalTotal": 2000,
    "grandTotal": 1500,
    "pricing": {
      "subtotal": 1500,
      "shippingCharge": 50,
      "couponDiscount": 500,
      "grandTotal": 1050
    }
  }
}
```

**Response (Validation Error):**
```json
{
  "success": false,
  "message": "Coupon validation failed",
  "error": "Coupon has expired",
  "code": "COUPON_EXPIRED"
}
```

**Common Error Codes:**
- `COUPON_NOT_FOUND`: Coupon code doesn't exist
- `COUPON_EXPIRED`: Coupon expiry date passed
- `COUPON_INACTIVE`: Coupon is not active
- `MIN_ORDER_VALUE_NOT_MET`: Order value is below minimum
- `USER_NOT_ELIGIBLE`: User doesn't match eligible user types
- `PAYMENT_MODE_NOT_APPLICABLE`: Selected payment mode not supported
- `PRODUCT_NOT_ELIGIBLE`: Order contains non-eligible products
- `USAGE_LIMIT_EXCEEDED`: Coupon usage limit reached

---

### 3. Remove Coupon from Order
**Endpoint:** `POST /v1/api/coupon/remove`

**Description:** Remove previously applied coupon from an order and recalculate total.

**Authentication:** Required (User JWT Token)

**Request Body:**
```json
{
  "orderId": "60d5ec49c1234567890abcd0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Coupon removed successfully",
  "data": {
    "orderId": "60d5ec49c1234567890abcd0",
    "grandTotal": 2050,
    "pricing": {
      "subtotal": 2000,
      "shippingCharge": 50,
      "couponDiscount": 0,
      "grandTotal": 2050
    }
  }
}
```

---

## Seller Coupon Visibility

### 1. Get Seller Coupons
**Endpoint:** `GET /v1/api/coupon/seller/coupons?page=1&limit=10`

**Description:** Retrieve coupons applicable to seller's products. Read-only access for sellers.

**Authentication:** Required (Seller JWT Token)

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 10): Items per page

**Response:**
```json
{
  "success": true,
  "message": "Seller coupons retrieved successfully",
  "data": {
    "coupons": [
      {
        "_id": "60d5ec49c1234567890abcde",
        "code": "SUMMER50",
        "title": "Summer Sale",
        "description": "50% discount on electronics",
        "discountType": "percentage",
        "discountValue": 50,
        "minOrderValue": 1000,
        "applicableProducts": [
          {
            "_id": "60d5ec49c1234567890abcd3",
            "name": "Product Name"
          }
        ],
        "usageCount": 45,
        "maxUsageLimit": 100,
        "expiryDate": "2024-12-31T23:59:59Z",
        "isActive": true
      }
    ],
    "totalRecords": 3,
    "totalPages": 1,
    "currentPage": 1
  }
}
```

---

### 2. Get Seller Coupon Details
**Endpoint:** `GET /v1/api/coupon/seller/coupons/:id`

**Description:** Retrieve detailed information about a specific coupon applicable to seller's products.

**Authentication:** Required (Seller JWT Token)

**Path Parameters:**
- `id` (string, required): Coupon ObjectId

**Response:**
```json
{
  "success": true,
  "message": "Coupon details retrieved successfully",
  "data": {
    "_id": "60d5ec49c1234567890abcde",
    "code": "SUMMER50",
    "title": "Summer Sale",
    "description": "50% discount on electronics",
    "discountType": "percentage",
    "discountValue": 50,
    "discountCap": 500,
    "minOrderValue": 1000,
    "usageCount": 45,
    "maxUsageLimit": 100,
    "totalDiscountAmount": 22500,
    "applicableProducts": [
      {
        "_id": "60d5ec49c1234567890abcd3",
        "name": "Product 1",
        "price": 2000
      },
      {
        "_id": "60d5ec49c1234567890abcd4",
        "name": "Product 2",
        "price": 1500
      }
    ],
    "applicableCategories": ["Electronics", "Gadgets"],
    "expiryDate": "2024-12-31T23:59:59Z",
    "isActive": true
  }
}
```

---

## Coupon Validation Rules

### Eligibility Checks
1. **Expiry Check**
   - Coupon must not be expired
   - Checked against current timestamp

2. **User Type Validation**
   - "all": Any user can apply
   - "new": Only users with first-time purchases (account age < 30 days or no completed orders)
   - "specific": Only listed user IDs can apply

3. **Minimum Order Value**
   - Order subtotal must be >= `minOrderValue`
   - Checked before discount calculation

4. **Payment Mode Validation**
   - Selected payment method must be in `applicablePaymentModes`
   - Example modes: upi, card, wallet, netbanking

5. **Product/Category Eligibility**
   - If `applicableProducts` defined: At least one order product must be in list
   - If `applicableCategories` defined: At least one order product's category must be in list
   - If both empty: Coupon applies to all products

6. **Usage Limit Check**
   - Global usage count must be < `maxUsageLimit`
   - Prevents overuse

7. **Active Status**
   - Coupon must have `isActive: true`

### Validation Flow
```
Apply Coupon Request
    ↓
Code Exists? → NO → Error: COUPON_NOT_FOUND
    ↓ YES
Is Active? → NO → Error: COUPON_INACTIVE
    ↓ YES
Expired? → YES → Error: COUPON_EXPIRED
    ↓ NO
Min Order Met? → NO → Error: MIN_ORDER_VALUE_NOT_MET
    ↓ YES
User Eligible? → NO → Error: USER_NOT_ELIGIBLE
    ↓ YES
Payment Mode Valid? → NO → Error: PAYMENT_MODE_NOT_APPLICABLE
    ↓ YES
Products Eligible? → NO → Error: PRODUCT_NOT_ELIGIBLE
    ↓ YES
Usage Limit? → EXCEEDED → Error: USAGE_LIMIT_EXCEEDED
    ↓ OK
✅ APPLY COUPON
```

---

## Discount Calculation

### Percentage Discount
**Formula:**
```
discountAmount = Math.min(
  (subtotal * discountValue) / 100,
  discountCap || Infinity
)
```

**Example:**
```
subtotal: 5000
discountType: "percentage"
discountValue: 20
discountCap: 500

Calculation:
Raw discount = (5000 * 20) / 100 = 1000
Final discount = min(1000, 500) = 500

grandTotal = subtotal + shipping - discount
           = 5000 + 50 - 500
           = 4550
```

### Fixed Amount Discount
**Formula:**
```
discountAmount = discountValue
```

**Example:**
```
subtotal: 2000
discountType: "fixed"
discountValue: 300

Calculation:
discountAmount = 300

grandTotal = subtotal + shipping - discount
           = 2000 + 50 - 300
           = 1750
```

### Discount Limits
- **Percentage**: Use `discountCap` to limit maximum discount
- **Fixed**: No cap, applies as-is (recommended to validate discountValue on creation)

---

## Data Models

### CouponCode Model
```javascript
{
  code: String (unique),
  title: String,
  description: String,
  discountType: String (percentage|fixed),
  discountValue: Number,
  discountCap: Number (for percentage only),
  minOrderValue: Number (default: 0),
  maxUsageLimit: Number,
  usageCount: Number (default: 0),
  expiryDate: Date,
  applicableUserTypes: [String], // all, new, specific
  specificUserIds: [ObjectId],
  applicablePaymentModes: [String], // upi, card, wallet, etc.
  applicableCategories: [ObjectId],
  applicableProducts: [ObjectId],
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Coupon Fields (UserOrders Model)
```javascript
{
  couponCodeId: ObjectId, // Reference to CouponCode
  pricing: {
    subtotal: Number,
    shippingCharge: Number,
    couponDiscount: Number (default: 0),
    grandTotal: Number
  }
}
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical error details (if available)",
  "code": "ERROR_CODE"
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (missing/invalid token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `500`: Server Error

---

## Integration Examples

### Complete Order with Coupon Flow

#### 1. Customer creates order
```bash
POST /v1/api/order/place
Authorization: Bearer <user-token>
{
  "addressId": "...",
  "products": [...],
  "paymentMethod": "card"
}
```

#### 2. Customer views available coupons
```bash
GET /v1/api/coupon/available
Authorization: Bearer <user-token>
```

#### 3. Customer applies coupon
```bash
POST /v1/api/coupon/apply
Authorization: Bearer <user-token>
{
  "code": "SUMMER50",
  "orderId": "..."
}
```

#### 4. Seller views applicable coupons
```bash
GET /v1/api/coupon/seller/coupons
Authorization: Bearer <seller-token>
```

#### 5. Admin manages coupons
```bash
# Create coupon
POST /v1/api/coupon/admin/create

# View all
GET /v1/api/coupon/admin/list

# View stats
GET /v1/api/coupon/admin/:id

# Update
PUT /v1/api/coupon/admin/:id

# Delete
DELETE /v1/api/coupon/admin/:id
```

---

## Testing the Coupon System

### Sample Coupon Creation
```bash
curl -X POST http://localhost:9110/v1/api/coupon/admin/create \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WELCOME20",
    "title": "Welcome Discount",
    "description": "20% off for new users",
    "discountType": "percentage",
    "discountValue": 20,
    "discountCap": 500,
    "minOrderValue": 500,
    "expiryDate": "2024-12-31T23:59:59Z",
    "applicableUserTypes": ["new"],
    "applicablePaymentModes": ["upi", "card"],
    "isActive": true
  }'
```

### Sample Coupon Application
```bash
curl -X POST http://localhost:9110/v1/api/coupon/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-token>" \
  -d '{
    "code": "WELCOME20",
    "orderId": "60d5ec49c1234567890abcd0"
  }'
```

---

## Best Practices

1. **Validation**: Always validate coupon eligibility before showing to users
2. **Usage Limit**: Set reasonable usage limits to control costs
3. **Expiry**: Always set expiry dates for promotional coupons
4. **Categories**: Use category-based eligibility for targeted promotions
5. **Discount Cap**: Always set caps for percentage discounts
6. **Monitoring**: Monitor coupon usage and revenue impact
7. **Testing**: Test validation rules thoroughly before deployment

---

## Future Enhancements

- [ ] Tiered discounts based on order value
- [ ] Coupon combinations (stack multiple)
- [ ] Auto-apply best coupon for customer
- [ ] Referral coupon generation
- [ ] Seasonal coupon templates
- [ ] A/B testing for coupon effectiveness
- [ ] Email reminders for expiring coupons
