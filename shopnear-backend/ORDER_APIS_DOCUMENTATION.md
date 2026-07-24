# Order Management APIs - Complete Documentation

## Overview

Complete customer and seller order management system with the following features:
- Cart management (add/view items)
- Order placement with payment integration (Razorpay)
- Seller accept/reject orders
- Multi-seller order tracking
- **OTP-based delivery confirmation** (NEW)
- Order cancellation and returns
- Wishlist management

---

## Table of Contents

1. [Customer Order Flow APIs](#customer-order-flow-apis)
2. [Seller Order Flow APIs](#seller-order-flow-apis)
3. [Response Format](#response-format)
4. [Error Codes](#error-codes)
5. [Order Status Enums](#order-status-enums)

---

## Customer Order Flow APIs

### 1. Add to Cart
**Endpoint:** `POST /orders/cart/add`  
**Auth:** User Token Required  

**Request Body:**
```json
{
  "userId": "string (required)",
  "productId": "string (required)",
  "quantity": "number (required)",
  "size": "string (optional, e.g., 'M', 'L')",
  "color": "string (optional, e.g., 'Black', 'White')"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "Cart updated",
  "rData": {
    "_id": "order_id",
    "userId": "user_id",
    "products": [
      {
        "productId": "product_id",
        "productName": "Product Name",
        "quantity": 2,
        "unitPrice": 500,
        "totalPrice": 1000,
        "size": "M",
        "color": "Black"
      }
    ],
    "status": "cart",
    "subtotal": 2000,
    "grandTotal": 2000
  }
}
```

---

### 2. Get Cart
**Endpoint:** `GET /orders/cart/list`  
**Auth:** User Token Required  

**Response:**
```json
{
  "rCode": 1,
  "msg": "Cart fetched",
  "rData": {
    "_id": "order_id",
    "userId": "user_id",
    "products": [...],
    "status": "cart",
    "subtotal": 2000,
    "grandTotal": 2000
  }
}
```

---

### 3. Place Order
**Endpoint:** `POST /orders/place-order`  
**Auth:** User Token Required  
**Description:** Creates an order from cart. Must have valid address and payment mode.

**Request Body:**
```json
{
  "userId": "string (required)",
  "addressId": "string (required, MongoDB ID)",
  "paymentMode": "string (required, enum: 'cod' | 'online')"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "order_placed",
  "rData": {
    "_id": "order_id",
    "orderId": "ORD-1705316400000-abcdef",
    "userId": "user_id",
    "addressId": "address_id",
    "status": "pending",
    "paymentMode": "online",
    "paymentStatus": "pending",
    "products": [...],
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "pending",
        "otp": null,
        "otpVerified": false,
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "subtotal": 2000,
    "grandTotal": 2000,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### 4. Verify Payment
**Endpoint:** `POST /orders/verify-payment`  
**Auth:** User Token Required  
**Description:** Verifies Razorpay payment signature and updates order.

**Request Body:**
```json
{
  "orderId": "string (required)",
  "razorpayPaymentId": "string (required)",
  "razorpayOrderId": "string (required)",
  "razorpaySignature": "string (required)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "payment_verified",
  "rData": {
    "orderId": "ORD-xxx",
    "paymentStatus": "completed",
    "razorpayPaymentId": "pay_123",
    "razorpayOrderId": "order_123",
    "razorpaySignature": "sig_hash"
  }
}
```

---

### 5. Get My Orders
**Endpoint:** `GET /orders/my-orders`  
**Auth:** User Token Required  
**Description:** Fetch all customer orders with optional filters.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `status` (string, optional: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
- `paymentMode` (string, optional: 'cod', 'online')
- `startDate` (ISO date string, optional)
- `endDate` (ISO date string, optional)

**Example:** `GET /orders/my-orders?page=1&limit=10&status=delivered`

**Response:**
```json
{
  "rCode": 1,
  "msg": "orders_list",
  "rData": {
    "page": 1,
    "limit": 10,
    "total_orders": 25,
    "filters": {
      "status": "delivered",
      "paymentMode": null
    },
    "orders": [
      {
        "_id": "order_id",
        "orderId": "ORD-xxx",
        "status": "delivered",
        "products": [...],
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

---

### 6. Get Order Detail
**Endpoint:** `GET /orders/orders/:id`  
**Auth:** User Token Required  
**Description:** Get detailed information about a specific order.

**URL Parameters:**
- `id` (string, required): Order ID

**Response:**
```json
{
  "rCode": 1,
  "msg": "success",
  "rData": {
    "_id": "order_id",
    "orderId": "ORD-xxx",
    "userId": { "fullName": "John Doe", "email": "john@example.com" },
    "addressId": { "address": "123 Main St", "city": "New York" },
    "status": "delivered",
    "products": [
      {
        "productId": { "productName": "Product Name" },
        "sellerId": { "shopName": "Shop Name" },
        "quantity": 2,
        "unitPrice": 500,
        "totalPrice": 1000
      }
    ],
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "delivered",
        "otpVerified": true,
        "updatedAt": "2024-01-15T15:00:00Z"
      }
    ],
    "paymentMode": "online",
    "paymentStatus": "completed"
  }
}
```

---

### 7. Track Order
**Endpoint:** `GET /orders/track/:id`  
**Auth:** User Token Required  
**Description:** Get real-time tracking information of an order.

**Response:**
```json
{
  "rCode": 1,
  "msg": "success",
  "rData": {
    "orderId": "ORD-xxx",
    "status": "shipped",
    "trackingNumber": "TRK123456789",
    "estimatedDeliveryDate": "2024-01-20T00:00:00Z",
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "shipped",
        "updatedAt": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

---

### 8. Verify Delivery OTP ⭐ **NEW**
**Endpoint:** `POST /orders/verify-delivery-otp`  
**Auth:** User Token Required  
**Description:** Customer verifies the OTP sent by seller for delivery confirmation. After successful verification, marks that seller's portion of the order as delivered.

**Request Body:**
```json
{
  "userId": "string (required)",
  "orderId": "string (required)",
  "sellerId": "string (required, seller's MongoDB ID)",
  "otp": "string (required, 6-digit code)"
}
```

**Response (Success):**
```json
{
  "rCode": 1,
  "msg": "otp_verified",
  "rData": {
    "orderId": "ORD-xxx",
    "status": "delivered",
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "delivered",
        "otpVerified": true,
        "updatedAt": "2024-01-15T15:30:00Z"
      }
    ],
    "actualDeliveryDate": "2024-01-15T15:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "rCode": 0,
  "msg": "Invalid OTP"
}
```

```json
{
  "rCode": 0,
  "msg": "OTP expired"
}
```

---

### 9. Cancel Order
**Endpoint:** `POST /orders/cancel-order`  
**Auth:** User Token Required  
**Description:** Cancel an order (only possible before processing begins).

**Request Body:**
```json
{
  "userId": "string (required)",
  "orderId": "string (required)",
  "cancelReason": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "order_cancelled",
  "rData": {}
}
```

---

### 10. Initiate Return
**Endpoint:** `POST /orders/initiate-return`  
**Auth:** User Token Required  
**Description:** Initiate return process for a delivered order.

**Request Body:**
```json
{
  "userId": "string (required)",
  "orderId": "string (required)",
  "returnReason": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "return_initiated",
  "rData": {}
}
```

---

### 11. Add to Wishlist
**Endpoint:** `POST /orders/wishlist/add`  
**Auth:** User Token Required  

**Request Body:**
```json
{
  "userId": "string (required)",
  "productId": "string (required)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "Added to wishlist",
  "rData": {
    "_id": "wishlist_item_id",
    "userId": "user_id",
    "productId": "product_id",
    "productName": "Product Name",
    "price": 500,
    "discountPrice": 400
  }
}
```

---

### 12. Get Wishlist
**Endpoint:** `GET /orders/wishlist/list`  
**Auth:** User Token Required  

**Response:**
```json
{
  "rCode": 1,
  "msg": "Wishlist fetched",
  "rData": [
    {
      "_id": "wishlist_item_id",
      "productId": "product_id",
      "productName": "Product Name",
      "price": 500
    }
  ]
}
```

---

## Seller Order Flow APIs

### 1. Get Seller Orders
**Endpoint:** `GET /orders/seller/orders`  
**Auth:** Seller Token Required  
**Description:** Fetch all orders containing seller's products with optional filters.

**Query Parameters:**
- `page` (number, optional, default: 1)
- `limit` (number, optional, default: 10)
- `status` (string, optional: 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')
- `startDate` (ISO date string, optional)
- `endDate` (ISO date string, optional)

**Response:**
```json
{
  "rCode": 1,
  "msg": "seller_orders_list",
  "rData": {
    "page": 1,
    "limit": 10,
    "total_orders": 15,
    "filters": { "status": "pending" },
    "orders": [
      {
        "_id": "order_id",
        "orderId": "ORD-xxx",
        "userId": { "fullName": "John Doe", "mobileNumber": "9999999999" },
        "products": [
          {
            "sellerId": "seller_id",
            "productName": "Product Name",
            "quantity": 2,
            "totalPrice": 1000
          }
        ],
        "sellerOrderStatus": [
          {
            "sellerId": "seller_id",
            "status": "pending",
            "updatedAt": "2024-01-15T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

---

### 2. Get Seller Order Detail
**Endpoint:** `GET /orders/seller/orders/:id`  
**Auth:** Seller Token Required  
**Description:** Get order details (only seller's products shown).

**Response:**
```json
{
  "rCode": 1,
  "msg": "success",
  "rData": {
    "_id": "order_id",
    "orderId": "ORD-xxx",
    "products": [
      {
        "sellerId": "seller_id",
        "productName": "Product Name",
        "quantity": 2,
        "unitPrice": 500
      }
    ],
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "pending",
        "otp": null,
        "otpVerified": false
      }
    ]
  }
}
```

---

### 3. Seller Accept Order ⭐ **NEW**
**Endpoint:** `POST /orders/seller/accept`  
**Auth:** Seller Token Required  
**Description:** Seller accepts an order. Sets seller's status to 'confirmed' and main order status to 'confirmed'.

**Request Body:**
```json
{
  "sellerId": "string (required)",
  "orderId": "string (required)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "seller_accepted",
  "rData": {
    "orderId": "ORD-xxx",
    "status": "confirmed",
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "confirmed",
        "updatedAt": "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

---

### 4. Seller Reject Order ⭐ **NEW**
**Endpoint:** `POST /orders/seller/reject`  
**Auth:** Seller Token Required  
**Description:** Seller rejects an order. Sets seller's status to 'cancelled'. If ALL sellers cancel, entire order becomes 'cancelled'.

**Request Body:**
```json
{
  "sellerId": "string (required)",
  "orderId": "string (required)",
  "reason": "string (optional, max 500 chars)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "seller_rejected",
  "rData": {
    "orderId": "ORD-xxx",
    "status": "cancelled",
    "cancelReason": "Out of stock",
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "cancelled",
        "updatedAt": "2024-01-15T10:05:00Z"
      }
    ]
  }
}
```

---

### 5. Update Order Status
**Endpoint:** `PUT /orders/seller/update-status`  
**Auth:** Seller Token Required  
**Description:** Update seller's order status through the flow.

**Request Body:**
```json
{
  "orderId": "string (required)",
  "status": "string (required, enum: pending|confirmed|processing|shipped|delivered|cancelled)"
}
```

**Status Flow:**
- `pending` → `confirmed` (after seller accepts)
- `confirmed` → `processing` (seller starts preparation)
- `processing` → `shipped` (seller ships out)
- `shipped` → `delivered` (after OTP verification)
- Any status → `cancelled` (if seller rejects)

**Response:**
```json
{
  "rCode": 1,
  "msg": "order_status_updated",
  "rData": {
    "orderId": "ORD-xxx",
    "status": "processing",
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "processing",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

---

### 6. Send Delivery OTP ⭐ **NEW**
**Endpoint:** `POST /orders/seller/send-delivery-otp`  
**Auth:** Seller Token Required  
**Description:** Generates a 6-digit OTP and stores it for delivery confirmation. Sets order status to 'shipped'. OTP expires in 10 minutes.

**Request Body:**
```json
{
  "sellerId": "string (required)",
  "orderId": "string (required)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "otp_sent",
  "rData": {
    "otp": "123456",
    "order": {
      "orderId": "ORD-xxx",
      "status": "shipped",
      "sellerOrderStatus": [
        {
          "sellerId": "seller_id",
          "status": "shipped",
          "otp": "123456",
          "otpExpires": "2024-01-15T10:50:00Z",
          "otpVerified": false,
          "updatedAt": "2024-01-15T10:40:00Z"
        }
      ]
    }
  }
}
```

**IMPORTANT:** In production, send OTP via SMS/Email to customer and remove from API response.

---

### 7. Update Tracking Information
**Endpoint:** `PUT /orders/seller/update-tracking`  
**Auth:** Seller Token Required  
**Description:** Update shipping tracking details.

**Request Body:**
```json
{
  "orderId": "string (required)",
  "trackingNumber": "string (required)",
  "estimatedDeliveryDate": "ISO date string (optional)"
}
```

**Response:**
```json
{
  "rCode": 1,
  "msg": "tracking_updated",
  "rData": {
    "orderId": "ORD-xxx",
    "trackingNumber": "TRK123456789",
    "estimatedDeliveryDate": "2024-01-20T00:00:00Z"
  }
}
```

---

### 8. Get Seller Order Statistics
**Endpoint:** `GET /orders/seller/stats`  
**Auth:** Seller Token Required  
**Description:** Get seller's order statistics dashboard.

**Response:**
```json
{
  "rCode": 1,
  "msg": "success",
  "rData": {
    "totalOrders": 150,
    "pendingOrders": 10,
    "completedOrders": 120,
    "totalRevenue": 150000
  }
}
```

---

## Response Format

All APIs follow this standard response format:

```json
{
  "rCode": 1,
  "msg": "success|error_message",
  "rData": {}
}
```

- `rCode`: 
  - `1` = Success
  - `0` = Error
  - `5` = Not Found
- `msg`: Message key or error description
- `rData`: Response data object (empty {} on error)

---

## Error Codes

| Error | Status | Solution |
|-------|--------|----------|
| Missing required fields | 400 | Verify all required fields are provided |
| Invalid token | 401 | Check authorization header and token validity |
| Order not found | 404 | Verify order ID is correct |
| Cart is empty | 400 | Add products to cart before placing order |
| Invalid OTP | 400 | Verify OTP is correct (6 digits) |
| OTP expired | 400 | Request new OTP from seller |
| Order cannot be cancelled | 400 | Order must be in pending/created state |
| Seller not authorized | 403 | Seller doesn't have products in this order |

---

## Order Status Enums

### Order Status Flow
```
pending → confirmed → processing → shipped → delivered
                   ↓
                cancelled
                   ↑
returned (from delivered)
```

### Valid Values
- **pending**: Order created, awaiting seller confirmation
- **confirmed**: Seller accepted order
- **processing**: Seller preparing order
- **shipped**: Order dispatched (OTP will be sent)
- **delivered**: Order delivered (after OTP verification)
- **cancelled**: Order cancelled (by customer or all sellers)
- **returned**: Order returned (after delivery)

---

## Payment Mode Enums
- **cod**: Cash on Delivery
- **online**: Online Payment (Razorpay)

---

## Multi-Seller Order Handling

When an order has products from multiple sellers:

1. Each seller gets independent status in `sellerOrderStatus` array
2. Sellers can accept/reject independently
3. OTP verification is per-seller basis
4. Order is `delivered` only when ALL sellers are either `delivered` or `cancelled`

**Example Multi-Seller Order:**
```json
{
  "orderId": "ORD-xxx",
  "status": "shipped",
  "products": [
    { "sellerId": "seller_1", "productId": "prod_1" },
    { "sellerId": "seller_2", "productId": "prod_2" }
  ],
  "sellerOrderStatus": [
    { "sellerId": "seller_1", "status": "shipped" },
    { "sellerId": "seller_2", "status": "processing" }
  ]
}
```

In this case:
- Seller 1 can send OTP for their delivery
- Seller 2 still processing
- Order won't be marked fully delivered until both are done

---

## OTP Delivery Confirmation Flow

### Step 1: Seller sends OTP
```
Seller calls: POST /seller/send-delivery-otp
→ OTP generated (6 digits, 10 min validity)
→ Stored in database
→ Status set to 'shipped'
→ (In prod: send via SMS to customer)
```

### Step 2: Customer receives OTP
- SMS/Email with OTP code
- Customer notes the 6-digit code

### Step 3: Customer verifies OTP
```
Customer calls: POST /verify-delivery-otp
→ OTP verified against stored value
→ Status set to 'delivered'
→ Order marked as delivered
```

### Step 4: Seller can see confirmation
```
Seller calls: GET /seller/orders/:id
→ sellerOrderStatus shows otpVerified: true
→ status: 'delivered'
```

---

## Testing Tips

1. **Use Postman Collection** provided in `ORDER_APIS_POSTMAN_COLLECTION.json`
2. **Set environment variables** in Postman for easy switching
3. **Use test OTP** like `123456` during development
4. **Mock Razorpay** for payment testing (use test credentials)
5. **Test multi-seller** by creating orders with products from different sellers

---

## Integration Checklist

- [ ] Setup Razorpay API keys in `.env`
- [ ] Setup SMS gateway for OTP (Twilio, AWS SNS, etc.)
- [ ] Add order status change notifications
- [ ] Implement refund logic for rejected orders
- [ ] Add email notifications for order updates
- [ ] Setup order analytics dashboard
- [ ] Add rate limiting on OTP endpoint
- [ ] Implement order search/filter UI
- [ ] Add seller rating/review system
- [ ] Setup order return/refund portal
