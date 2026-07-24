# ShopNear Order Management APIs - CURL Examples

Base URL: `http://localhost:3000/api`

## Environment Variables

```bash
export BASE_URL="http://localhost:3000/api"
export USER_TOKEN="your_customer_jwt_token"
export SELLER_TOKEN="your_seller_jwt_token"
export USER_ID="customer_mongo_id"
export SELLER_ID="seller_mongo_id"
export ORDER_ID="ORD-xxxxx"
export PRODUCT_ID="product_mongo_id"
export ADDRESS_ID="address_mongo_id"
```

---

## CUSTOMER ORDER FLOW

### 1. Add to Cart
```bash
curl -X POST "$BASE_URL/orders/cart/add" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'",
    "quantity": 2,
    "size": "M",
    "color": "Black"
  }'
```

### 2. Get Cart
```bash
curl -X GET "$BASE_URL/orders/cart/list" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 3. Place Order
```bash
curl -X POST "$BASE_URL/orders/place-order" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "addressId": "'$ADDRESS_ID'",
    "paymentMode": "online"
  }'
```

### 4. Verify Payment (Razorpay)
```bash
curl -X POST "$BASE_URL/orders/verify-payment" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "razorpayPaymentId": "pay_1234567890",
    "razorpayOrderId": "order_1234567890",
    "razorpaySignature": "signature_hash_here"
  }'
```

### 5. Get My Orders (with filters)
```bash
# Basic - Get all orders
curl -X GET "$BASE_URL/orders/my-orders" \
  -H "Authorization: Bearer $USER_TOKEN"

# With filters
curl -X GET "$BASE_URL/orders/my-orders?page=1&limit=10&status=pending&paymentMode=online" \
  -H "Authorization: Bearer $USER_TOKEN"

# With date range
curl -X GET "$BASE_URL/orders/my-orders?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 6. Get Order Detail
```bash
curl -X GET "$BASE_URL/orders/orders/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 7. Track Order
```bash
curl -X GET "$BASE_URL/orders/track/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN"
```

### 8. Verify Delivery OTP ⭐ NEW
```bash
curl -X POST "$BASE_URL/orders/verify-delivery-otp" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "orderId": "'$ORDER_ID'",
    "sellerId": "'$SELLER_ID'",
    "otp": "123456"
  }'
```

### 9. Cancel Order
```bash
curl -X POST "$BASE_URL/orders/cancel-order" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "orderId": "'$ORDER_ID'",
    "cancelReason": "Changed my mind"
  }'
```

### 10. Initiate Return
```bash
curl -X POST "$BASE_URL/orders/initiate-return" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "orderId": "'$ORDER_ID'",
    "returnReason": "Product quality not as expected"
  }'
```

### 11. Add to Wishlist
```bash
curl -X POST "$BASE_URL/orders/wishlist/add" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'"
  }'
```

### 12. Get Wishlist
```bash
curl -X GET "$BASE_URL/orders/wishlist/list" \
  -H "Authorization: Bearer $USER_TOKEN"
```

---

## SELLER ORDER FLOW

### 1. Get Seller Orders (with filters)
```bash
# Basic - Get all seller orders
curl -X GET "$BASE_URL/orders/seller/orders" \
  -H "Authorization: Bearer $SELLER_TOKEN"

# With pagination and filters
curl -X GET "$BASE_URL/orders/seller/orders?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer $SELLER_TOKEN"

# With date range
curl -X GET "$BASE_URL/orders/seller/orders?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 2. Get Seller Order Detail
```bash
curl -X GET "$BASE_URL/orders/seller/orders/$ORDER_ID" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

### 3. Seller Accept Order ⭐ NEW
```bash
curl -X POST "$BASE_URL/orders/seller/accept" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "'$SELLER_ID'",
    "orderId": "'$ORDER_ID'"
  }'
```

### 4. Seller Reject Order ⭐ NEW
```bash
curl -X POST "$BASE_URL/orders/seller/reject" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "'$SELLER_ID'",
    "orderId": "'$ORDER_ID'",
    "reason": "Out of stock"
  }'
```

### 5. Update Order Status
```bash
curl -X PUT "$BASE_URL/orders/seller/update-status" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "status": "processing"
  }'
```

Status Options: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

### 6. Send Delivery OTP ⭐ NEW
```bash
curl -X POST "$BASE_URL/orders/seller/send-delivery-otp" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "'$SELLER_ID'",
    "orderId": "'$ORDER_ID'"
  }'
```

Response will include the generated OTP (6-digit). In production, send via SMS instead of returning in response.

### 7. Update Tracking Information
```bash
curl -X PUT "$BASE_URL/orders/seller/update-tracking" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "trackingNumber": "TRK123456789",
    "estimatedDeliveryDate": "2024-01-20T00:00:00Z"
  }'
```

### 8. Get Seller Order Statistics
```bash
curl -X GET "$BASE_URL/orders/seller/stats" \
  -H "Authorization: Bearer $SELLER_TOKEN"
```

---

## COMPLETE ORDER FLOW SCENARIO

### Step-by-Step Complete Flow

#### Customer side:
```bash
# 1. Customer adds products to cart
curl -X POST "$BASE_URL/orders/cart/add" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "productId": "'$PRODUCT_ID'",
    "quantity": 2,
    "size": "M",
    "color": "Black"
  }'

# 2. Customer places order with payment
curl -X POST "$BASE_URL/orders/place-order" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "addressId": "'$ADDRESS_ID'",
    "paymentMode": "online"
  }'

# 3. Customer verifies payment (after Razorpay)
curl -X POST "$BASE_URL/orders/verify-payment" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "razorpayPaymentId": "pay_123",
    "razorpayOrderId": "order_123",
    "razorpaySignature": "sig_hash"
  }'

# 4. Customer tracks order
curl -X GET "$BASE_URL/orders/track/$ORDER_ID" \
  -H "Authorization: Bearer $USER_TOKEN"

# 5. When delivery OTP is received, customer verifies it
curl -X POST "$BASE_URL/orders/verify-delivery-otp" \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_ID'",
    "orderId": "'$ORDER_ID'",
    "sellerId": "'$SELLER_ID'",
    "otp": "123456"
  }'
```

#### Seller side:
```bash
# 1. Seller views pending orders
curl -X GET "$BASE_URL/orders/seller/orders?status=pending" \
  -H "Authorization: Bearer $SELLER_TOKEN"

# 2. Seller accepts order
curl -X POST "$BASE_URL/orders/seller/accept" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "'$SELLER_ID'",
    "orderId": "'$ORDER_ID'"
  }'

# 3. Seller updates status to processing
curl -X PUT "$BASE_URL/orders/seller/update-status" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "status": "processing"
  }'

# 4. Seller updates tracking
curl -X PUT "$BASE_URL/orders/seller/update-tracking" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "trackingNumber": "TRK123456789",
    "estimatedDeliveryDate": "2024-01-20T00:00:00Z"
  }'

# 5. Seller updates status to shipped
curl -X PUT "$BASE_URL/orders/seller/update-status" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "'$ORDER_ID'",
    "status": "shipped"
  }'

# 6. Seller sends delivery OTP (before final delivery)
curl -X POST "$BASE_URL/orders/seller/send-delivery-otp" \
  -H "Authorization: Bearer $SELLER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sellerId": "'$SELLER_ID'",
    "orderId": "'$ORDER_ID'"
  }'
```

---

## API Response Format

### Success Response
```json
{
  "rCode": 1,
  "msg": "order_placed",
  "rData": {
    "_id": "mongo_object_id",
    "orderId": "ORD-1234567890-abcdef",
    "userId": "user_id",
    "status": "pending",
    "products": [
      {
        "productId": "product_id",
        "sellerId": "seller_id",
        "productName": "Product Name",
        "quantity": 2,
        "unitPrice": 500,
        "totalPrice": 1000
      }
    ],
    "sellerOrderStatus": [
      {
        "sellerId": "seller_id",
        "status": "pending",
        "otp": null,
        "otpVerified": false,
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "paymentMode": "online",
    "paymentStatus": "pending",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### Error Response
```json
{
  "rCode": 0,
  "msg": "error_message",
  "rData": {}
}
```

---

## Key Notes

### New Endpoints (⭐)
1. **POST /seller/accept** - Seller accepts an order
2. **POST /seller/reject** - Seller rejects an order
3. **POST /seller/send-delivery-otp** - Generate and send OTP for delivery
4. **POST /verify-delivery-otp** - Customer verifies delivery OTP

### Order Status Flow
- **Customer side**: pending → confirmed → processing → shipped → delivered
- **Seller side**: pending → confirmed → processing → shipped → delivered
- **Cancellation**: Any status can be cancelled (by customer before processing or seller reject)

### OTP Details
- Generated by: Seller (via `/seller/send-delivery-otp`)
- Verified by: Customer (via `/verify-delivery-otp`)
- Length: 6 digits
- Validity: 10 minutes (600 seconds)
- Purpose: Confirm product delivery to customer

### Multi-Seller Orders
If an order has products from multiple sellers:
- Each seller has independent order status tracking
- OTP verification is per-seller basis
- Order is fully delivered only when ALL sellers have delivered or cancelled

---

## Testing Checklist

- [ ] Add products to cart
- [ ] View cart items
- [ ] Place order with payment mode
- [ ] Verify Razorpay payment
- [ ] View customer orders with filters
- [ ] View specific order details
- [ ] Track order progress
- [ ] Seller views pending orders
- [ ] Seller accepts order
- [ ] Seller updates order status (processing → shipped)
- [ ] Seller sends delivery OTP
- [ ] Customer verifies delivery OTP
- [ ] Seller rejects order
- [ ] Customer initiates return
- [ ] Cancel order
- [ ] View seller statistics
