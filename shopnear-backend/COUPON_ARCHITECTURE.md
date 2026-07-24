# Coupon System Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Admin        │  Seller        │  Customer                       │
│  Dashboard    │  Dashboard     │  Mobile/Web                     │
└───────┬───────┴────────┬───────┴──────────┬──────────────────────┘
        │                │                  │
        │ JWT Token      │ JWT Token        │ JWT Token
        ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTE LAYER (coupon.js)                       │
├─────────────────────────────────────────────────────────────────┤
│ AuthMiddleware → Validation → ErrorHandler → Controller → Response
│                                                                  │
│ Admin Routes:           Seller Routes:        Customer Routes:  │
│ POST   /admin/create    GET /seller/coupons   GET  /available   │
│ GET    /admin/list      GET /seller/coupons/:id POST /apply     │
│ GET    /admin/:id       (Read-only)           POST /remove      │
│ PUT    /admin/:id                                                │
│ DELETE /admin/:id                                                │
└───────┬────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (CouponController.js)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Admin Operations          Seller Operations   Customer Ops     │
│  ├─ createCoupon()        ├─ getSellerCoupons  ├─ getAvailable()│
│  ├─ getAllCoupons()       └─ getSellerDetail() ├─ applyCoupon() │
│  ├─ getCouponDetail()                         └─ removeCoupon()│
│  ├─ updateCoupon()                                              │
│  └─ deleteCoupon()                                               │
│                                                                  │
└───────┬────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│           BUSINESS LOGIC LAYER (CouponService.js)              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Validation           Calculation        Management             │
│  ├─ validateCoupon()  ├─ calculateDiscount() ├─ createCoupon()  │
│  │  ├─ Code exists    │  ├─ Percentage     ├─ updateCoupon()   │
│  │  ├─ Is active      │  ├─ Fixed amount   ├─ deleteCoupon()   │
│  │  ├─ Not expired    │  └─ Apply cap      ├─ getCouponById()  │
│  │  ├─ Min order met  │                     ├─ getAllCoupons()  │
│  │  ├─ User eligible  │  Stats & Queries   ├─ countCoupons()   │
│  │  ├─ Payment mode   │  ├─ getCouponStats()├─ getCouponByCode()│
│  │  ├─ Product match  │  ├─ getAvailable()  └─ getSellerCoupons()│
│  │  └─ Usage limit    │  └─ getSellerDetail()                   │
│  │                                                               │
└───────┬────────────────────────────────────────────────────────┘
        │
        │
        ├──────────────────────────┬──────────────────────────┐
        ▼                          ▼                          ▼
┌──────────────────┐    ┌──────────────────────┐    ┌──────────────────┐
│ DATABASE LAYER   │    │   ORDER SERVICE      │    │  VALIDATION      │
├──────────────────┤    │   (OrderService.js)  │    │  (AdminValidator)│
│                  │    │                      │    │                  │
│ CouponCode Coll. │    │ 2 New Methods:       │    │ 4 New Validators:│
│ ├─ code          │    │ ├─ applyOrUpdate()   │    │ ├─ validateCreate│
│ ├─ title         │    │ │  └─ Updates order  │    │ ├─ validateUpdate│
│ ├─ discountType  │    │ │     with coupon    │    │ ├─ validateId   │
│ ├─ discountValue │    │ │     recalculates   │    │ └─ validateApply │
│ ├─ minOrderValue │    │ │     grandTotal     │    │                  │
│ ├─ usageCount    │    │ └─ removeCoupon()    │    └──────────────────┘
│ ├─ expiryDate    │    │    └─ Removes coupon │
│ ├─ applicableTo  │    │       resets total   │
│ └─ isActive      │    │                      │
│                  │    │ Integrates with:     │
└──────────────────┘    │ UserOrders model     │
                        └──────────────────────┘
```

---

## Request/Response Flow

```
APPLY COUPON REQUEST
        │
        ▼
    ┌────────────────────────────────────┐
    │ POST /coupon/apply                 │
    │ {code: "SUMMER50", orderId: "..."}│
    └────────────┬───────────────────────┘
                 │
                 ▼
         ┌───────────────────────┐
         │ AuthMiddleware        │
         │ ✅ Verify JWT Token   │
         └────────┬──────────────┘
                  │
                  ▼
         ┌────────────────────────────┐
         │ AdminValidator             │
         │ ✅ validateApplyCoupon()   │
         │   - code required          │
         └────────┬───────────────────┘
                  │
                  ▼
    ┌────────────────────────────────────┐
    │ CouponController.applyCoupon()     │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ CouponService.getCouponByCode()    │
    │ ✅ Find coupon document            │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ CouponService.validateCoupon()     │
    │ Check:                             │
    │ ✅ Code exists                     │
    │ ✅ Is active                       │
    │ ✅ Not expired                     │
    │ ✅ Min order value met             │
    │ ✅ User type eligible              │
    │ ✅ Payment mode applicable         │
    │ ✅ Product/category match          │
    │ ✅ Usage limit not exceeded        │
    └────────┬──────────────────────────┘
             │
        VALID?
       /      \
     YES       NO
      │         │
      ▼         ▼
    ┌─────┐ ┌──────────────────┐
    │ ✅  │ │ ❌ Error Response │
    └──┬──┘ │ (COUPON_EXPIRED) │
       │    │ (USER_NOT_ELIGIBLE)
       ▼    └──────────────────┘
    ┌────────────────────────────────────┐
    │ CouponService.calculateDiscount()  │
    │                                    │
    │ If percentage:                     │
    │   amount = min(subtotal*%/100, cap)│
    │ If fixed:                          │
    │   amount = discountValue           │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ OrderService.applyOrUpdateCoupon()│
    │                                    │
    │ 1. Get order by ID                │
    │ 2. Add coupon reference           │
    │ 3. Set coupon discount amount     │
    │ 4. Recalculate:                   │
    │    grandTotal =                    │
    │    subtotal + shipping - discount  │
    │ 5. Update order in DB             │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ ResponseMiddleware                 │
    │ ✅ Format response                 │
    │ {                                  │
    │   success: true,                   │
    │   message: "Coupon applied...",   │
    │   data: {                          │
    │     orderId,                       │
    │     couponCode,                    │
    │     discountAmount,                │
    │     grandTotal                     │
    │   }                                │
    │ }                                  │
    └────────┬──────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────┐
    │ RESPONSE TO CLIENT                 │
    │ 200 OK with updated order data     │
    └────────────────────────────────────┘
```

---

## Data Model Relationships

```
┌──────────────────────────────────────────────────┐
│             CouponCode (Collection)              │
├──────────────────────────────────────────────────┤
│ _id: ObjectId                                    │
│ code: String (unique)  ─────────────────┐       │
│ title: String                          │       │
│ discountType: String                    │       │
│ discountValue: Number                   │       │
│ minOrderValue: Number                   │       │
│ maxUsageLimit: Number                   │       │
│ usageCount: Number (tracked)            │       │
│ applicableProducts: [ObjectId]          │       │
│ applicableCategories: [ObjectId]        │       │
│ applicableUserTypes: [String]           │       │
│ isActive: Boolean                       │       │
│ expiryDate: Date                        │       │
└──────────────────────────────────────────────────┘
                           │
                           │ Reference
                           │
                           ▼
         ┌──────────────────────────────────┐
         │   UserOrders (Collection)        │
         ├──────────────────────────────────┤
         │ _id: ObjectId                    │
         │ orderId: String (unique)         │
         │ userId: ObjectId                 │
         │ products: [Product]              │
         │ couponCodeId: ObjectId (NEW) ←───┘
         │ pricing: {
         │   subtotal: Number
         │   shippingCharge: Number
         │   couponDiscount: Number (NEW)
         │   grandTotal: Number (UPDATED)
         │ }
         │ paymentStatus: String
         │ paymentDetails: Object
         │ status: String
         │ tracking: Object
         │ createdAt: Date
         └──────────────────────────────────┘
```

---

## Service Interaction Diagram

```
                    CouponController
                    (Request Handler)
                    /    |    \
                   /     |     \
         Admin Ops/ Customer   \Seller Ops
                 /      |        \
                /       |         \
               ▼        ▼          ▼
        ┌──────────────────────────────┐
        │    CouponService             │
        │  (Business Logic)            │
        ├──────────────────────────────┤
        │                              │
        │ validateCoupon()             │
        │ ├─ Check eligibility        │
        │ ├─ Validate dates           │
        │ └─ Check restrictions       │
        │                              │
        │ calculateDiscount()          │
        │ ├─ Percentage logic         │
        │ └─ Fixed amount logic       │
        │                              │
        │ CRUD Operations              │
        │ ├─ Create/Read/Update/Delete│
        │ └─ Query operations         │
        └────┬────────────────┬───────┘
             │                │
             │                │ Calls for
             │                │ coupon apply/remove
             ▼                ▼
        ┌───────────────────────────────┐
        │   OrderService                │
        │   (Order Updates)             │
        ├───────────────────────────────┤
        │                               │
        │ applyOrUpdateCoupon()         │
        │ ├─ Find order                │
        │ ├─ Add coupon ref           │
        │ └─ Recalculate total        │
        │                               │
        │ removeCoupon()                │
        │ ├─ Find order                │
        │ ├─ Remove coupon ref         │
        │ └─ Restore total            │
        └────────────┬──────────────────┘
                     │
                     ▼
          ┌────────────────────────┐
          │  MongoDB               │
          │  ├─ CouponCode       │
          │  ├─ UserOrders       │
          │  └─ Other Collections │
          └────────────────────────┘
```

---

## Validation Rules Decision Tree

```
Customer tries to apply coupon
              │
              ▼
    Does coupon code exist?
       /              \
      NO               YES
      │                │
      ▼                ▼
   ❌ Error      Is coupon active?
                   /        \
                  NO        YES
                  │          │
                  ▼          ▼
               ❌ Error  Has it expired?
                        /        \
                       NO        YES
                       │          │
                       ▼          ▼
                   ✅ Pass    ❌ Error

                       │
                       ▼
                Order value >= min?
                   /        \
                  NO        YES
                  │          │
                  ▼          ▼
               ❌ Error  Is user eligible?
                        /        \
                       NO        YES
                       │          │
                       ▼          ▼
                   ❌ Error  Payment mode OK?
                           /        \
                          NO        YES
                          │          │
                          ▼          ▼
                       ❌ Error  Products match?
                               /        \
                              NO        YES
                              │          │
                              ▼          ▼
                           ❌ Error  Usage < Limit?
                                     /        \
                                    NO        YES
                                    │          │
                                    ▼          ▼
                                 ❌ Error   ✅ APPLY COUPON
                                            │
                                            ▼
                                    Calculate discount
                                    Update order total
                                    Return success
```

---

## Component Dependencies

```
┌──────────────────────────────────────────────────────┐
│            External Dependencies                     │
│  express, mongoose, node-input-validator, etc.      │
└──────────────────────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
         ▼              ▼              ▼
    ┌─────────┐  ┌─────────┐  ┌──────────────┐
    │Middleware│  │Models   │  │Utilities     │
    │Auth      │  │CouponCode│ │helpers.js    │
    │Response  │  │UserOrders│ │messages.js   │
    │Error     │  │Product   │ │              │
    │Handler   │  │Category  │ │              │
    └────┬─────┘  └────┬────┘  └──────┬───────┘
         │             │              │
         └─────────────┼──────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
   ┌──────────────────┐       ┌─────────────────┐
   │CouponValidator   │       │CouponService    │
   │(AdminValidator)  │       │(Business Logic) │
   │ validateApply()  │───────│ validate()      │
   │ validateCreate() │       │ calculate()     │
   │ validateUpdate() │       │ CRUD ops        │
   │ validateId()     │       │ getStats()      │
   └──────┬───────────┘       └────────┬────────┘
          │                            │
          └────────────┬───────────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │ CouponController         │
          │ (Request Handler)        │
          │ applyCoupon()            │
          │ removeCoupon()           │
          │ createCoupon()           │
          │ getAvailable()           │
          └────────────┬─────────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │ OrderService             │
          │ (Order Updates)          │
          │ applyOrUpdateCoupon()   │
          │ removeCoupon()          │
          └────────────┬─────────────┘
                       │
                       ▼
          ┌──────────────────────────┐
          │ MongoDB Database         │
          │ (Data Persistence)       │
          └──────────────────────────┘
```

---

## Request Routing Map

```
Client Request
    │
    └─→ POST /v1/api/coupon/apply
        │
        ├─→ AuthMiddleware (verifyUserToken)
        │   │
        │   └─→ Check JWT token validity
        │
        ├─→ AdminValidator (validateApplyCoupon)
        │   │
        │   └─→ Check required fields
        │
        ├─→ ErrorHandlerMiddleware (Wrapper)
        │   │
        │   └─→ CouponController.applyCoupon()
        │       │
        │       ├─→ CouponService.getCouponByCode()
        │       ├─→ CouponService.validateCoupon()
        │       ├─→ CouponService.calculateDiscount()
        │       ├─→ OrderService.applyOrUpdateCoupon()
        │       │
        │       └─→ return response
        │
        └─→ ResponseMiddleware (Format Response)
            │
            └─→ Client receives JSON response
```

---

## Error Handling Flow

```
Application Error Occurs
        │
        ▼
ErrorHandlerMiddleware catches it
        │
        ├─ Validation Error?
        │   ├─ YES: Return 400 + validation messages
        │   └─ NO: Continue
        │
        ├─ Coupon Error?
        │   ├─ COUPON_NOT_FOUND: Return 404
        │   ├─ COUPON_EXPIRED: Return 400
        │   ├─ USER_NOT_ELIGIBLE: Return 403
        │   └─ Other: Return 400 + message
        │
        ├─ Order Error?
        │   ├─ ORDER_NOT_FOUND: Return 404
        │   └─ Other: Return 400 + message
        │
        ├─ Database Error?
        │   ├─ YES: Return 500 + generic message
        │   └─ NO: Continue
        │
        └─ Return error response with:
           ├─ success: false
           ├─ message: user-friendly text
           ├─ error: technical details (optional)
           └─ code: error code string
```

---

## Data Transformation Pipeline

```
Input Coupon JSON
    │
    ▼
┌─────────────────────────────────────┐
│ Validation & Transformation         │
│ ├─ Parse applicableCategories       │
│ │  (String[] → ObjectId[])          │
│ ├─ Parse applicableProducts         │
│ │  (String[] → ObjectId[])          │
│ └─ Convert specificUserIds          │
│    (String[] → ObjectId[])          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Business Logic Processing           │
│ ├─ Validate against rules           │
│ ├─ Check database uniqueness        │
│ └─ Set default values               │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Database Operation                  │
│ ├─ Insert/Update document           │
│ └─ Return created/updated object    │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Response Formatting                 │
│ ├─ Filter sensitive fields          │
│ ├─ Format dates                     │
│ └─ Structure response object        │
└────────────┬────────────────────────┘
             │
             ▼
Output JSON Response
```

---

This architecture ensures:
- ✅ Clean separation of concerns
- ✅ Easy to test each component
- ✅ Maintainable and scalable
- ✅ Reusable business logic
- ✅ Consistent error handling
- ✅ Clear data flow
- ✅ Proper middleware usage
- ✅ Database integrity
