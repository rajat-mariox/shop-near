# Order Flow - Quick Reference Guide

## Customer Order Journey

### Step 1️⃣ : Place Order
```bash
POST /orders/place-order
{
  "addressId": "address_id",
  "paymentMode": "cod" | "online"
}
```
Response: Order ID (e.g., `ORD-1704270000000-abc123`)

---

### Step 2️⃣ : Create Razorpay Payment Order (If Online Payment)
```bash
POST /orders/payment/create-order
{
  "orderId": "ORD-1704270000000-abc123",
  "amount": 1048,
  "currency": "INR"
}
```
Response: Razorpay order ID and other payment details

---

### Step 3️⃣ : Open Razorpay Checkout (Frontend)
Use the response from Step 2 to initialize Razorpay checkout widget.

---

### Step 4️⃣ : Verify Payment (After successful payment)
```bash
POST /orders/verify-payment
{
  "orderId": "ORD-1704270000000-abc123",
  "razorpayOrderId": "order_Jz7P7rkfVYYYaK",
  "razorpayPaymentId": "pay_Jz7P7rkfVYYYaK",
  "razorpaySignature": "signature_hash"
}
```

---

### Step 5️⃣ : Get Customer Orders
```bash
GET /orders/my-orders?page=1&limit=10&status=pending
```

---

### Step 6️⃣ : Get Order Detail
```bash
GET /orders/orders/ORD-1704270000000-abc123
```

---

### Step 7️⃣ : Track Order (Real-time)
```bash
GET /orders/track/ORD-1704270000000-abc123
```
Response includes:
- Order status
- Tracking number
- Estimated delivery date
- Seller-wise order status

---

### Step 8️⃣ : Cancel Order (if pending)
```bash
POST /orders/cancel-order
{
  "orderId": "ORD-1704270000000-abc123",
  "cancelReason": "Changed my mind"
}
```

---

### Step 9️⃣ : Initiate Return (if delivered)
```bash
POST /orders/initiate-return
{
  "orderId": "ORD-1704270000000-abc123",
  "returnReason": "Product quality issue"
}
```

---

## Seller Order Management

### 1️⃣ : Get All Orders for Seller
```bash
GET /orders/seller/orders?page=1&limit=20&status=pending
```
Filters available:
- `status`: pending, confirmed, processing, shipped, delivered, cancelled
- `startDate`: From date (ISO format)
- `endDate`: To date (ISO format)

---

### 2️⃣ : Get Order Detail
```bash
GET /orders/seller/orders/ORD-1704270000000-abc123
```
Shows only products from this seller

---

### 3️⃣ : Update Order Status
```bash
PUT /orders/seller/update-status
{
  "orderId": "ORD-1704270000000-abc123",
  "status": "shipped"
}
```

**Valid Status Transitions:**
- `pending` → `confirmed` → `processing` → `shipped` → `delivered`
- Any status → `cancelled`

---

### 4️⃣ : Update Tracking Information
```bash
PUT /orders/seller/update-tracking
{
  "orderId": "ORD-1704270000000-abc123",
  "trackingNumber": "SHIP123456",
  "estimatedDeliveryDate": "2025-01-10T00:00:00Z"
}
```

---

### 5️⃣ : Get Seller Statistics
```bash
GET /orders/seller/stats
```
Response includes:
- Total orders
- Pending orders
- Completed (delivered) orders
- Total revenue from orders

---

## Filter Examples

### Customer Orders - Filters
```bash
# Get pending orders
GET /orders/my-orders?status=pending

# Get online payment orders
GET /orders/my-orders?paymentMode=online

# Get orders from date range
GET /orders/my-orders?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z

# Combined filters
GET /orders/my-orders?status=delivered&paymentMode=online&page=1&limit=20
```

### Seller Orders - Filters
```bash
# Get pending orders
GET /orders/seller/orders?status=pending

# Get orders from date range
GET /orders/seller/orders?startDate=2025-01-01T00:00:00Z&endDate=2025-01-31T23:59:59Z

# Get with pagination
GET /orders/seller/orders?page=2&limit=50
```

---

## Order Status Definitions

| Status | Description | Customer Can | Seller Can |
|--------|-------------|--------------|-----------|
| `pending` | Order created, awaiting confirmation | Cancel | Confirm/Cancel |
| `confirmed` | Order confirmed by seller | - | Process |
| `processing` | Seller preparing order | - | Ship |
| `shipped` | Item in transit | Track | Update tracking |
| `delivered` | Delivered to customer | Return | Mark complete |
| `cancelled` | Order cancelled | - | - |
| `returned` | Customer initiated return | - | Process return |

---

## Payment Status

| Status | Meaning |
|--------|---------|
| `pending` | Awaiting payment |
| `completed` | Payment received |
| `failed` | Payment failed |
| `refunded` | Amount refunded |

---

## cURL Examples

### Customer: Place Order (COD)
```bash
curl -X POST http://localhost:5000/orders/place-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "paymentMode": "cod"
  }'
```

### Customer: Place Order (Online Payment)
```bash
curl -X POST http://localhost:5000/orders/place-order \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "addressId": "64a1b2c3d4e5f6g7h8i9j0k1",
    "paymentMode": "online"
  }'
```

### Customer: Get Orders
```bash
curl -X GET "http://localhost:5000/orders/my-orders?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"
```

### Customer: Track Order
```bash
curl -X GET "http://localhost:5000/orders/track/ORD-1704270000000-abc123" \
  -H "Authorization: Bearer $TOKEN"
```

### Seller: Get Orders
```bash
curl -X GET "http://localhost:5000/orders/seller/orders?page=1&limit=20" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### Seller: Update Order Status
```bash
curl -X PUT http://localhost:5000/orders/seller/update-status \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "status": "shipped"
  }'
```

### Seller: Update Tracking
```bash
curl -X PUT http://localhost:5000/orders/seller/update-tracking \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORD-1704270000000-abc123",
    "trackingNumber": "SHIP123456",
    "estimatedDeliveryDate": "2025-01-10T00:00:00Z"
  }'
```

### Seller: Get Statistics
```bash
curl -X GET "http://localhost:5000/orders/seller/stats" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

---

## JavaScript/Fetch Examples

### Place Order
```javascript
const placeOrder = async (addressId, paymentMode) => {
  const response = await fetch('/orders/place-order', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ addressId, paymentMode })
  });
  return response.json();
};
```

### Get Customer Orders
```javascript
const getMyOrders = async (page = 1, limit = 10, filters = {}) => {
  const queryParams = new URLSearchParams({
    page,
    limit,
    ...filters
  });
  
  const response = await fetch(`/orders/my-orders?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

### Get Seller Orders
```javascript
const getSellerOrders = async (page = 1, limit = 20, status = null) => {
  let url = `/orders/seller/orders?page=${page}&limit=${limit}`;
  if (status) url += `&status=${status}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${sellerToken}`
    }
  });
  return response.json();
};
```

### Update Order Status
```javascript
const updateOrderStatus = async (orderId, status) => {
  const response = await fetch('/orders/seller/update-status', {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${sellerToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ orderId, status })
  });
  return response.json();
};
```

### Verify Payment
```javascript
const verifyPayment = async (orderId, paymentResponse) => {
  const response = await fetch('/orders/verify-payment', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      orderId,
      razorpayOrderId: paymentResponse.razorpay_order_id,
      razorpayPaymentId: paymentResponse.razorpay_payment_id,
      razorpaySignature: paymentResponse.razorpay_signature
    })
  });
  return response.json();
};
```

---

## Testing Checklist

### Customer Flow
- [ ] Add items to cart
- [ ] Place order with COD
- [ ] Place order with online payment
- [ ] Create Razorpay payment order
- [ ] Verify payment signature
- [ ] Get my orders
- [ ] Get order detail
- [ ] Track order
- [ ] Cancel pending order
- [ ] Initiate return on delivered order

### Seller Flow
- [ ] Get all orders for seller
- [ ] Get order detail
- [ ] Update order status (pending → confirmed)
- [ ] Update order status (confirmed → processing)
- [ ] Update order status (processing → shipped)
- [ ] Update tracking information
- [ ] Update order status (shipped → delivered)
- [ ] Get seller statistics
- [ ] Filter orders by status
- [ ] Filter orders by date range

### Edge Cases
- [ ] Cancel order that's already shipped (should fail)
- [ ] Return order that's not delivered (should fail)
- [ ] Payment verification with wrong signature (should fail)
- [ ] Get order that doesn't belong to user (should fail)
- [ ] Seller accessing order without their products (should fail)

---

## Environment Variables Required

```
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

---

**Last Updated**: January 3, 2025
**API Version**: 1.0
