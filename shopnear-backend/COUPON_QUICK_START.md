# Coupon System - Quick Start Guide

## 🚀 Getting Started

The coupon management system is fully implemented and ready to use. This guide covers quick setup and testing.

---

## 📦 What's Included

- **Service**: CouponService.js (14 methods)
- **Controller**: CouponController.js (11 methods)
- **Routes**: 8 endpoints
- **Validators**: 4 new validators
- **Documentation**: Complete API reference

---

## 🔌 Integration Status

✅ **Already Integrated:**
- Routes registered in `/src/routes/index.js`
- Service layer created with all business logic
- Controller layer with API handlers
- Validators added for input validation
- OrderService extended with coupon support

**NO ADDITIONAL SETUP REQUIRED** - Start testing immediately!

---

## 🧪 Quick Test Examples

### 1. Create a Coupon (Admin)

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
    "maxUsageLimit": 100,
    "expiryDate": "2025-12-31T23:59:59Z",
    "applicableUserTypes": ["all"],
    "applicablePaymentModes": ["upi", "card"],
    "isActive": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    "_id": "...",
    "code": "WELCOME20",
    "title": "Welcome Discount",
    "discountType": "percentage",
    "discountValue": 20,
    "usageCount": 0
  }
}
```

---

### 2. List All Coupons (Admin)

```bash
curl -X GET "http://localhost:9110/v1/api/coupon/admin/list?page=1&limit=10"
```

---

### 3. Get Available Coupons (Customer)

```bash
curl -X GET http://localhost:9110/v1/api/coupon/available \
  -H "Authorization: Bearer <user-jwt-token>"
```

---

### 4. Apply Coupon to Order (Customer)

**First, create an order using the existing order API**, then apply coupon:

```bash
curl -X POST http://localhost:9110/v1/api/coupon/apply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-jwt-token>" \
  -d '{
    "code": "WELCOME20",
    "orderId": "<order-id-from-order-response>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "orderId": "...",
    "couponCode": "WELCOME20",
    "discountAmount": 200,
    "originalTotal": 1000,
    "grandTotal": 800
  }
}
```

---

### 5. Remove Coupon from Order (Customer)

```bash
curl -X POST http://localhost:9110/v1/api/coupon/remove \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <user-jwt-token>" \
  -d '{
    "orderId": "<order-id>"
  }'
```

---

### 6. Get Seller Coupons (Seller)

```bash
curl -X GET http://localhost:9110/v1/api/coupon/seller/coupons \
  -H "Authorization: Bearer <seller-jwt-token>"
```

---

## 📋 Test Scenario: Complete Workflow

### Step 1: Create an Order
```bash
POST /v1/api/order/place
Authorization: Bearer <user-token>
Body: {
  "addressId": "...",
  "products": [...],
  "paymentMethod": "card"
}
Response: { orderId: "order123", total: 1000, ... }
```

### Step 2: View Available Coupons
```bash
GET /v1/api/coupon/available
Authorization: Bearer <user-token>
Response: { coupons: [{ code: "WELCOME20", discount: 20, ... }] }
```

### Step 3: Apply Coupon
```bash
POST /v1/api/coupon/apply
Authorization: Bearer <user-token>
Body: { code: "WELCOME20", orderId: "order123" }
Response: { 
  couponCode: "WELCOME20",
  discountAmount: 200,
  grandTotal: 800  // Updated from 1000
}
```

### Step 4: Verify Order Updated
Order document now contains:
```javascript
{
  couponCodeId: "<coupon-id>",
  pricing: {
    subtotal: 1000,
    shippingCharge: 50,
    couponDiscount: 200,
    grandTotal: 850
  }
}
```

### Step 5: Remove Coupon (Optional)
```bash
POST /v1/api/coupon/remove
Authorization: Bearer <user-token>
Body: { orderId: "order123" }
Response: { 
  grandTotal: 1050  // Reverted to original + shipping
}
```

---

## 🔧 Configuration Options

### Coupon Type: Percentage with Cap
```javascript
{
  discountType: "percentage",
  discountValue: 50,
  discountCap: 500
}
// 50% off, but max discount of 500
```

### Coupon Type: Fixed Amount
```javascript
{
  discountType: "fixed",
  discountValue: 300
}
// Always 300 off
```

### User Eligibility: All Users
```javascript
{
  applicableUserTypes: ["all"]
}
// Anyone can use
```

### User Eligibility: New Users Only
```javascript
{
  applicableUserTypes: ["new"]
}
// Only users < 30 days old or no orders
```

### User Eligibility: Specific Users
```javascript
{
  applicableUserTypes: ["specific"],
  specificUserIds: ["user1", "user2", "user3"]
}
// Only these user IDs
```

### Payment Mode Restriction
```javascript
{
  applicablePaymentModes: ["upi", "card"]
}
// Works only with UPI or Card, not wallet
```

### Product Restriction
```javascript
{
  applicableProducts: ["prod1", "prod2"]
}
// Only for these products
```

### Category Restriction
```javascript
{
  applicableCategories: ["cat1", "cat2"]
}
// Only for products in these categories
```

---

## ⚠️ Validation Error Messages

When applying a coupon, you might encounter these errors:

| Error Code | Message | Solution |
|-----------|---------|----------|
| `COUPON_NOT_FOUND` | Coupon code doesn't exist | Check coupon code spelling |
| `COUPON_INACTIVE` | Coupon is not active | Wait for coupon to be reactivated |
| `COUPON_EXPIRED` | Coupon has expired | Use an active coupon |
| `MIN_ORDER_VALUE_NOT_MET` | Order value too low | Add more items to reach minimum |
| `USER_NOT_ELIGIBLE` | You're not eligible | New coupon is for specific users only |
| `PAYMENT_MODE_NOT_APPLICABLE` | Payment method not supported | Use a different payment method |
| `PRODUCT_NOT_ELIGIBLE` | Products not eligible | Order doesn't contain eligible items |
| `USAGE_LIMIT_EXCEEDED` | Coupon limit reached | Coupon has been used too many times |

---

## 📊 Discount Calculation Examples

### Example 1: Percentage Discount with Cap
```
Order Details:
- Subtotal: 5000
- Shipping: 50
- Coupon: SUMMER20 (20% off, max 500)

Calculation:
- Raw discount = (5000 × 20) / 100 = 1000
- Applied discount = min(1000, 500) = 500
- Grand Total = 5000 + 50 - 500 = 4550
```

### Example 2: Fixed Amount Discount
```
Order Details:
- Subtotal: 2000
- Shipping: 50
- Coupon: FIXED300 (300 off)

Calculation:
- Applied discount = 300
- Grand Total = 2000 + 50 - 300 = 1750
```

### Example 3: Failed Validation
```
Order Details:
- Subtotal: 300
- Coupon: MIN500 (min order 500)

Validation Result: ❌ FAILED
- Subtotal (300) < minOrderValue (500)
- Error: MIN_ORDER_VALUE_NOT_MET
- Action: Add 200+ more to cart
```

---

## 🔍 Admin Statistics

When viewing a coupon detail, you get:

```javascript
{
  code: "SUMMER50",
  usageCount: 45,           // Times used
  maxUsageLimit: 100,       // Max allowed uses
  totalDiscountAmount: 22500, // Total discount given
  totalRevenueGenerated: 450000 // Total order value
}
```

---

## 📚 Complete Documentation

For detailed information, see:
- **[COUPON_API.md](COUPON_API.md)** - Complete API reference with all endpoints
- **[COUPON_SYSTEM_SUMMARY.md](COUPON_SYSTEM_SUMMARY.md)** - Implementation overview

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] Can create coupon as admin
- [ ] Can list coupons
- [ ] Can apply valid coupon to order
- [ ] Discount calculated correctly
- [ ] Grand total updated in order
- [ ] Can remove coupon from order
- [ ] Total reverted correctly after removal
- [ ] Expired coupon rejected
- [ ] Invalid payment mode rejected
- [ ] Min order value validation works
- [ ] Seller can see applicable coupons
- [ ] Customer sees available coupons

---

## 🐛 Troubleshooting

### Coupon not applying
1. Check coupon `code` spelling
2. Verify `isActive: true`
3. Check expiry date hasn't passed
4. Ensure order value > `minOrderValue`
5. Verify payment method is applicable

### Grand total not updating
- Check OrderService methods were added correctly
- Verify order document structure has pricing object
- Check for any errors in console logs

### Customer can't see coupons
1. Verify user JWT token is valid
2. Check coupon's `applicableUserTypes`
3. Verify coupon `isActive: true`
4. Check user eligibility rules

### Seller can't see coupons
1. Verify seller JWT token is valid
2. Check if seller has products
3. Check if any coupons apply to those products

---

## 🚀 Production Checklist

Before deploying to production:

1. **Database**
   - [ ] Create indexes on CouponCode collection
   - [ ] Backup existing data
   - [ ] Test migrations

2. **Security**
   - [ ] Add admin authentication to admin endpoints
   - [ ] Validate all input fields
   - [ ] Test XSS/injection vulnerabilities

3. **Performance**
   - [ ] Test with 1000+ coupons
   - [ ] Monitor query performance
   - [ ] Add caching if needed

4. **Testing**
   - [ ] Run full test suite
   - [ ] Manual testing of all endpoints
   - [ ] Edge case testing

5. **Documentation**
   - [ ] Update API docs
   - [ ] Train support team
   - [ ] Create monitoring alerts

---

## 📞 Support

For issues:
1. Check the troubleshooting section above
2. Review error messages in logs
3. Consult [COUPON_API.md](COUPON_API.md) for detailed specs
4. Check validation rules in CouponService.validateCoupon()

---

**Ready to test?** Start with creating a coupon and applying it to an order!
