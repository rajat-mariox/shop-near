# Complete Order Flow API Documentation

## Overview

This document describes the complete order management system with customer order placement, payment integration with Razorpay, and seller order management.

---

## Base URLs

### Customer Endpoints
```
/orders
```

### Seller Endpoints
```
/orders/seller
```

All endpoints require authentication via JWT tokens:
- **Customer**: `AuthMiddleware().verifyUserToken`
- **Seller**: `AuthMiddleware().verifySellerToken`

---

## Part 1: CUSTOMER ORDER FLOW

### 1. Place Order

**Endpoint:** `POST /orders/place-order`

**Authentication:** Required (Customer Token)

**Description:** Create an order from cart items.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `addressId` | string | Yes | Delivery address ID |
| `paymentMode` | string | Yes | Payment method: "cod" or "online" |

### Request Example
```bash
curl -X POST http://localhost:5000/orders/place-order \
  -H "Authorization: Bearer your_customer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "paymentMode": "online"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "order_placed",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "addressId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "products": [
      {
        "productId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "productName": "Blue T-Shirt",
        "quantity": 2,
        "unitPrice": 499,
        "totalPrice": 998,
        "size": "M",
        "color": "Blue"
      }
    ],
    "subtotal": 998,
    "shippingCost": 50,
    "couponDiscount": 0,
    "grandTotal": 1048,
    "paymentMode": "online",
    "paymentStatus": "pending",
    "status": "pending",
    "createdAt": "2025-01-03T10:30:00Z"
  }
}
```

---

### 2. Create Razorpay Payment Order

**Endpoint:** `POST /orders/payment/create-order`

**Authentication:** Required (Customer Token)

**Description:** Create a Razorpay payment order for online payment.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID from placed order |
| `amount` | number | Yes | Total amount to pay |
| `currency` | string | No | Currency code (default: "INR") |

### Request Example
```bash
curl -X POST http://localhost:5000/orders/payment/create-order \
  -H "Authorization: Bearer your_customer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "amount": 1048,
    "currency": "INR"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "Payment order created",
  "data": {
    "id": "order_Jz7P7rkfVYYYaK",
    "entity": "order",
    "amount": 104800,
    "amount_paid": 0,
    "amount_due": 104800,
    "currency": "INR",
    "receipt": "ORD-1704270000000-abc123",
    "offer_id": null,
    "status": "created",
    "attempts": 0,
    "notes": {
      "userId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "orderId": "ORD-1704270000000-abc123"
    },
    "created_at": 1704270000
  }
}
```

---

### 3. Verify Payment (Razorpay)

**Endpoint:** `POST /orders/verify-payment`

**Authentication:** Required (Customer Token)

**Description:** Verify Razorpay payment signature and update order status.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID string (from your system) |
| `razorpayOrderId` | string | Yes | Razorpay order ID |
| `razorpayPaymentId` | string | Yes | Razorpay payment ID |
| `razorpaySignature` | string | Yes | Razorpay signature for verification |

### Request Example
```bash
curl -X POST http://localhost:5000/orders/verify-payment \
  -H "Authorization: Bearer your_customer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "razorpayOrderId": "order_Jz7P7rkfVYYYaK",
    "razorpayPaymentId": "pay_Jz7P7rkfVYYYaK",
    "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "payment_verified",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "paymentStatus": "completed",
    "razorpayPaymentId": "pay_Jz7P7rkfVYYYaK",
    "razorpayOrderId": "order_Jz7P7rkfVYYYaK",
    "status": "pending"
  }
}
```

---

### 4. Get Customer Orders

**Endpoint:** `GET /orders/my-orders`

**Authentication:** Required (Customer Token)

**Description:** Get list of all customer orders with optional filters.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `status` | string | No | Order status filter |
| `paymentMode` | string | No | Payment mode: "cod" or "online" |
| `startDate` | string | No | Filter from date (ISO format) |
| `endDate` | string | No | Filter to date (ISO format) |

### Request Example
```bash
GET /orders/my-orders?page=1&limit=10&status=pending&paymentMode=online
```

### Response Example
```json
{
  "success": true,
  "message": "orders_list",
  "data": {
    "page": 1,
    "limit": 10,
    "total_orders": 5,
    "orders": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "orderId": "ORD-1704270000000-abc123",
        "status": "pending",
        "paymentStatus": "completed",
        "paymentMode": "online",
        "grandTotal": 1048,
        "createdAt": "2025-01-03T10:30:00Z",
        "products": [...]
      }
    ]
  }
}
```

---

### 5. Get Order Detail

**Endpoint:** `GET /orders/orders/:id`

**Authentication:** Required (Customer Token)

**Description:** Get complete details of a specific order.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Order ID string |

### Request Example
```bash
GET /orders/orders/ORD-1704270000000-abc123
```

### Response Example
```json
{
  "success": true,
  "message": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "userId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210"
    },
    "addressId": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "fullName": "John Doe",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pinCode": 400001
    },
    "products": [
      {
        "productId": {
          "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
          "productName": "Blue T-Shirt"
        },
        "sellerId": {
          "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
          "shopName": "My Store"
        },
        "quantity": 2,
        "unitPrice": 499,
        "totalPrice": 998,
        "size": "M",
        "color": "Blue"
      }
    ],
    "subtotal": 998,
    "shippingCost": 50,
    "grandTotal": 1048,
    "paymentMode": "online",
    "paymentStatus": "completed",
    "status": "pending",
    "trackingNumber": "SHIP123456",
    "estimatedDeliveryDate": "2025-01-10T00:00:00Z",
    "createdAt": "2025-01-03T10:30:00Z"
  }
}
```

---

### 6. Track Order

**Endpoint:** `GET /orders/track/:id`

**Authentication:** Required (Customer Token)

**Description:** Get real-time tracking information for an order.

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Order ID string |

### Request Example
```bash
GET /orders/track/ORD-1704270000000-abc123
```

### Response Example
```json
{
  "success": true,
  "message": "success",
  "data": {
    "orderId": "ORD-1704270000000-abc123",
    "status": "shipped",
    "trackingNumber": "SHIP123456",
    "estimatedDeliveryDate": "2025-01-10T00:00:00Z",
    "actualDeliveryDate": null,
    "sellerOrderStatus": [
      {
        "sellerId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "status": "shipped",
        "updatedAt": "2025-01-05T10:30:00Z"
      }
    ],
    "createdAt": "2025-01-03T10:30:00Z",
    "updatedAt": "2025-01-05T10:30:00Z"
  }
}
```

---

### 7. Cancel Order

**Endpoint:** `POST /orders/cancel-order`

**Authentication:** Required (Customer Token)

**Description:** Cancel an order (only for pending orders).

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID to cancel |
| `cancelReason` | string | No | Reason for cancellation |

### Request Example
```bash
curl -X POST http://localhost:5000/orders/cancel-order \
  -H "Authorization: Bearer your_customer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "cancelReason": "Changed my mind"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "order_cancelled",
  "data": {}
}
```

---

### 8. Initiate Return

**Endpoint:** `POST /orders/initiate-return`

**Authentication:** Required (Customer Token)

**Description:** Initiate a return for a delivered order.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID to return |
| `returnReason` | string | No | Reason for return |

### Request Example
```bash
curl -X POST http://localhost:5000/orders/initiate-return \
  -H "Authorization: Bearer your_customer_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "returnReason": "Product quality not as expected"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "return_initiated",
  "data": {}
}
```

---

## Part 2: SELLER ORDER MANAGEMENT

### 1. Get Seller Orders

**Endpoint:** `GET /orders/seller/orders`

**Authentication:** Required (Seller Token)

**Description:** Get all orders for seller's products with optional filters.

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 10) |
| `status` | string | No | Order status filter |
| `startDate` | string | No | Filter from date (ISO format) |
| `endDate` | string | No | Filter to date (ISO format) |

### Request Example
```bash
GET /orders/seller/orders?page=1&limit=20&status=pending
```

### Response Example
```json
{
  "success": true,
  "message": "seller_orders_list",
  "data": {
    "page": 1,
    "limit": 20,
    "total_orders": 45,
    "orders": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "orderId": "ORD-1704270000000-abc123",
        "userId": {
          "fullName": "John Doe",
          "email": "john@example.com",
          "mobileNumber": "9876543210"
        },
        "addressId": {
          "fullName": "John Doe",
          "address": "123 Main Street",
          "city": "Mumbai",
          "pinCode": 400001
        },
        "products": [
          {
            "productName": "Blue T-Shirt",
            "quantity": 2,
            "unitPrice": 499,
            "totalPrice": 998
          }
        ],
        "status": "pending",
        "sellerOrderStatus": [
          {
            "sellerId": "64a1b2c3d4e5f6g7h8i9j0k1",
            "status": "pending",
            "updatedAt": "2025-01-03T10:30:00Z"
          }
        ],
        "createdAt": "2025-01-03T10:30:00Z"
      }
    ]
  }
}
```

---

### 2. Get Seller Order Detail

**Endpoint:** `GET /orders/seller/orders/:id`

**Authentication:** Required (Seller Token)

**Description:** Get detailed information of a specific order (only for seller's products).

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Order ID string |

### Request Example
```bash
GET /orders/seller/orders/ORD-1704270000000-abc123
```

### Response Example
```json
{
  "success": true,
  "message": "success",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "userId": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "mobileNumber": "9876543210"
    },
    "addressId": {
      "fullName": "John Doe",
      "address": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pinCode": 400001,
      "phoneNumber": "9876543210"
    },
    "products": [
      {
        "productName": "Blue T-Shirt",
        "quantity": 2,
        "unitPrice": 499,
        "totalPrice": 998,
        "size": "M",
        "color": "Blue"
      }
    ],
    "grandTotal": 1048,
    "paymentMode": "online",
    "paymentStatus": "completed",
    "status": "pending",
    "trackingNumber": null,
    "createdAt": "2025-01-03T10:30:00Z"
  }
}
```

---

### 3. Update Order Status

**Endpoint:** `PUT /orders/seller/update-status`

**Authentication:** Required (Seller Token)

**Description:** Update order status for seller's products.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID |
| `status` | string | Yes | New status: "pending", "confirmed", "processing", "shipped", "delivered", "cancelled" |

### Request Example
```bash
curl -X PUT http://localhost:5000/orders/seller/update-status \
  -H "Authorization: Bearer your_seller_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "status": "shipped"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "order_status_updated",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "status": "shipped",
    "sellerOrderStatus": [
      {
        "sellerId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "status": "shipped",
        "updatedAt": "2025-01-05T10:30:00Z"
      }
    ]
  }
}
```

---

### 4. Update Tracking Information

**Endpoint:** `PUT /orders/seller/update-tracking`

**Authentication:** Required (Seller Token)

**Description:** Add tracking number and estimated delivery date.

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `orderId` | string | Yes | Order ID |
| `trackingNumber` | string | Yes | Tracking number for shipment |
| `estimatedDeliveryDate` | string | No | Expected delivery date (ISO format) |

### Request Example
```bash
curl -X PUT http://localhost:5000/orders/seller/update-tracking \
  -H "Authorization: Bearer your_seller_token" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "trackingNumber": "SHIP123456",
    "estimatedDeliveryDate": "2025-01-10T00:00:00Z"
  }'
```

### Response Example
```json
{
  "success": true,
  "message": "tracking_updated",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "orderId": "ORD-1704270000000-abc123",
    "trackingNumber": "SHIP123456",
    "estimatedDeliveryDate": "2025-01-10T00:00:00Z"
  }
}
```

---

### 5. Get Seller Order Statistics

**Endpoint:** `GET /orders/seller/stats`

**Authentication:** Required (Seller Token)

**Description:** Get order statistics and dashboard data for seller.

### Request Example
```bash
GET /orders/seller/stats
```

### Response Example
```json
{
  "success": true,
  "message": "success",
  "data": {
    "totalOrders": 45,
    "pendingOrders": 12,
    "completedOrders": 30,
    "totalRevenue": 45000
  }
}
```

---

## Order Status Flow

### Customer Order Status
```
pending → confirmed → processing → shipped → delivered
  ↓
cancelled (at any stage before delivery)
  ↓
returned (after delivery)
```

### Seller Order Status (per seller)
```
pending → confirmed → processing → shipped → delivered
  ↓
cancelled
```

---

## Payment Status
- `pending`: Payment initiated but not completed
- `completed`: Payment received successfully
- `failed`: Payment failed
- `refunded`: Amount refunded to customer

---

## Error Responses

### 400 - Validation Error
```json
{
  "success": false,
  "rCode": 0,
  "message": "The orderId field must not be empty."
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
  "message": "order_not_found"
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

## Razorpay Integration Steps

### 1. Setup Razorpay Account
- Create account at https://razorpay.com
- Get API Key ID and Key Secret

### 2. Environment Variables
```
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### 3. Frontend Implementation (JavaScript)
```javascript
// Step 1: Create order on backend
const response = await fetch('/orders/place-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    addressId: selectedAddressId,
    paymentMode: 'online'
  })
});
const order = await response.json();

// Step 2: Create Razorpay order
const paymentResponse = await fetch('/orders/payment/create-order', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: order.data.orderId,
    amount: order.data.grandTotal
  })
});
const paymentOrder = await paymentResponse.json();

// Step 3: Open Razorpay Checkout
const options = {
  key: 'YOUR_RAZORPAY_KEY_ID',
  amount: order.data.grandTotal * 100,
  currency: 'INR',
  name: 'ShopNear',
  order_id: paymentOrder.data.id,
  handler: function(response) {
    // Step 4: Verify payment
    verifyPayment(response);
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

---

## Important Notes

1. **Order ID Format**: `ORD-{timestamp}-{userId_suffix}`
2. **Soft Delete**: Deleted orders are marked with appropriate status
3. **Seller Isolation**: Sellers can only see/manage their own products' orders
4. **Payment Verification**: Signature verification is mandatory for security
5. **Multi-Seller Orders**: An order can have products from multiple sellers
6. **Status Transitions**: Not all status transitions are allowed (e.g., cannot go back to pending)

---

**Last Updated**: January 3, 2025
**API Version**: 1.0
