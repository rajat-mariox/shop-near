# ShopNear API Documentation

## Table of Contents
1. [Admin APIs](#admin-apis)
2. [Seller APIs](#seller-apis) 
4. [User APIs](#user-apis)
5. [Authentication APIs](#authentication-apis)

---

## Admin APIs

### Authentication

#### 1. Register Admin
```
POST /v1/api/admin/register
```
Register a new admin account.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "name": "Admin Name"
}
```

---

#### 2. Login Admin
```
POST /v1/api/admin/login
```
Login with email and password.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

---

#### 3. Forgot Password
```
POST /v1/api/admin/forgotPassword
```
Request password reset OTP.

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

---

#### 4. Verify OTP for Forgot Password
```
POST /v1/api/admin/verifyOtp
```
Verify OTP sent for password reset.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "otp": "123456"
}
```

---

#### 5. Resend OTP
```
PUT /v1/api/admin/resendOtp
```
Resend OTP to email.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "admin@example.com"
}
```

---

#### 6. Reset Password
```
PATCH /v1/api/admin/resetPassword
```
Reset password after OTP verification.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

#### 7. Change Password
```
PATCH /v1/api/admin/changePassword
```
Change password (requires old password).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

---

### Profile Management

#### 8. Get Admin Details
```
GET /v1/api/admin/getDetails
```
Get admin profile information.

**Headers:**
```
Authorization: Bearer <token>
```

---

#### 9. Edit Admin Profile
```
PUT /v1/api/admin/editProfile
```
Update admin profile details.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "email": "newemail@example.com",
  "phone": "9876543210"
}
```

---

### Category Management

#### 10. Create Category
```
POST /v1/api/admin/categories
```
Create a new product category.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic products",
  "image": "category_image_url"
}
```

---

#### 11. Get All Categories
```
GET /v1/api/admin/categories
```
Get all product categories.

**Headers:**
```
Authorization: Bearer <token>
```

---

#### 12. Get Category by ID
```
GET /v1/api/admin/categories/:id
```
Get specific category details.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Category ID

---

#### 13. Delete Category
```
DELETE /v1/api/admin/categories/:id
```
Delete a category.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Category ID

---

#### 14. Toggle Category Status
```
PATCH /v1/api/admin/categories/:id
```
Enable or disable a category.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Category ID

---

## Seller APIs

### Authentication

#### 1. Seller Login
```
POST /v1/api/seller/login
```
Login with email and password.

**Request Body:**
```json
{
  "email": "seller@example.com",
  "password": "password123"
}
```

---

#### 2. Verify OTP
```
POST /v1/api/seller/verify-otp
```
Verify OTP for seller login.

**Request Body:**
```json
{
  "email": "seller@example.com",
  "otp": "123456"
}
```

---

### Profile Management

#### 3. Get Seller Profile
```
GET /v1/api/seller/profile
```
Get seller profile details.

**Headers:**
```
Authorization: Bearer <seller_token>
```

---

#### 4. Edit Seller Profile
```
PUT /v1/api/seller/profile
```
Update seller profile information.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Request Body:**
```json
{
  "shopName": "My Shop",
  "description": "Shop description",
  "phone": "9876543210",
  "profileImage": "image_url"
}
```

---

### KYC Management

#### 5. Update KYC
```
PUT /v1/api/seller/kyc
```
Submit or update KYC documents.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Request Body:**
```json
{
  "panNumber": "XXXXXXXXXX",
  "panImage": "pan_image_url",
  "aadharNumber": "XXXXXXXXXXXX",
  "aadharImage": "aadhar_image_url"
}
```

---

### Bank Details Management

#### 6. Update Bank Details
```
PUT /v1/api/seller/bank
```
Submit or update bank account details.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Request Body:**
```json
{
  "bankName": "Bank Name",
  "accountNumber": "XXXXXXXXXX",
  "ifscCode": "XXXXXXXX",
  "accountHolderName": "Name"
}
```

---

### Shop Timing Management

#### 7. Update Shop Timing
```
PUT /v1/api/seller/shop-timing
```
Set shop opening and closing hours.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Request Body:**
```json
{
  "openingTime": "09:00",
  "closingTime": "21:00",
  "daysOpen": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
}
```

---

### Product Management

#### 8. List Seller Products
```
GET /v1/api/seller/products
```
Get all products of the seller with filters.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (active/inactive)
- `category` - Filter by category

---

#### 9. Get Product Details
```
GET /v1/api/seller/products/:id
```
Get specific product details.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Path Parameters:**
- `id` - Product ID

---

#### 10. Create Product
```
POST /v1/api/seller/products
```
Create a new product.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "categoryId": "category_id",
  "price": 999.99,
  "discount": 10,
  "stock": 50,
  "colors": ["Red", "Blue"],
  "sizes": ["S", "M", "L"],
  "images": ["image_url_1", "image_url_2"]
}
```

---

#### 11. Edit Product
```
PUT /v1/api/seller/products/:id
```
Update product details.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Path Parameters:**
- `id` - Product ID

**Request Body:**
```json
{
  "name": "Updated Name",
  "price": 1099.99,
  "stock": 45
}
```

---

#### 12. Delete Product
```
DELETE /v1/api/seller/products/:id
```
Delete a product.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Path Parameters:**
- `id` - Product ID

---

### Category Management

#### 13. Get All Categories
```
GET /v1/api/seller/categories
```
Get all product categories.

**Headers:**
```
Authorization: Bearer <seller_token>
```

---

#### 14. Get Category by ID
```
GET /v1/api/seller/categories/:id
```
Get specific category details.

**Headers:**
```
Authorization: Bearer <seller_token>
```

**Path Parameters:**
- `id` - Category ID

---

### Admin-Only Seller Management

#### 15. Get All Sellers List
```
GET /v1/api/seller/admin/list
```
Get list of all sellers (admin view).

---

#### 16. Get Seller Details
```
GET /v1/api/seller/admin/:id
```
Get seller details by ID (admin view).

**Path Parameters:**
- `id` - Seller ID

---

#### 17. Approve Seller
```
PUT /v1/api/seller/admin/:id/approve
```
Approve a seller registration.

**Path Parameters:**
- `id` - Seller ID

---

#### 18. Reject Seller
```
PUT /v1/api/seller/admin/:id/reject
```
Reject a seller registration.

**Path Parameters:**
- `id` - Seller ID

---

#### 19. Toggle Seller Status
```
PUT /v1/api/seller/admin/:id/toggle-status
```
Activate or deactivate seller account.

**Path Parameters:**
- `id` - Seller ID

---

#### 20. Delete Seller
```
DELETE /v1/api/seller/admin/:id
```
Delete seller account and data.

**Path Parameters:**
- `id` - Seller ID

---

## User APIs

### Profile Management

#### 1. Get User Profile
```
GET /v1/api/user/profile
```
Get user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "profileImage": "image_url"
  }
}
```

---

#### 2. Edit User Profile
```
PUT /v1/api/user/profile
```
Update user profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "phone": "9876543211",
  "profileImage": "new_image_url"
}
```

---

### Address Management

#### 3. Add User Address
```
POST /v1/api/user/address
```
Add a new delivery address.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "New York",
  "state": "NY",
  "pincode": "10001",
  "country": "USA",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

---

#### 4. Get All User Addresses
```
GET /v1/api/user/address
```
Get all saved delivery addresses.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "addresses": [
    {
      "_id": "address_id",
      "fullName": "John Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "isSelected": true
    }
  ]
}
```

---

#### 5. Get Address Details
```
GET /v1/api/user/address/:id
```
Get specific address details.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Address ID

---

#### 6. Delete Address
```
DELETE /v1/api/user/address/:id
```
Delete a saved address.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Address ID

---

#### 7. Select Address
```
PUT /v1/api/user/address/:id
```
Set a primary delivery address.

**Headers:**
```
Authorization: Bearer <token>
```

**Path Parameters:**
- `id` - Address ID

---

### Notifications

#### 8. Toggle Notification Settings
```
GET /v1/api/user/notifications/switch
```
Enable or disable notifications.

**Headers:**
```
Authorization: Bearer <token>
```

---

### Home Screen

#### 9. Get Home Screen Data
```
GET /v1/api/user/homeScreen
```
Get dynamic home screen content including banners, categories, featured products, etc.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "homeScreen": {
    "banners": [
      {
        "_id": "banner_id",
        "title": "Sale Banner",
        "image": "banner_image_url",
        "redirectUrl": "product_id"
      }
    ],
    "categories": [
      {
        "_id": "category_id",
        "name": "Electronics",
        "image": "category_image_url"
      }
    ],
    "featuredProducts": [
      {
        "_id": "product_id",
        "name": "Product Name",
        "price": 999.99,
        "image": "product_image_url"
      }
    ],
    "deliverySettings": {
      "baseDeliveryCharge": 50.00,
      "freeDeliveryAbove": 500.00,
      "standardDeliveryDays": 3,
      "expressDeliveryDays": 1
    }
  }
}
```

---

## Authentication APIs

### General Authentication

#### 1. Register User
```
POST /v1/api/auth/register
```
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

---

#### 2. Login User
```
POST /v1/api/auth/login
```
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

---

#### 3. Verify OTP
```
POST /v1/api/auth/verify-otp
```
Verify OTP for login or registration.

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## API Response Format

All APIs follow a standard response format:

### Success Response (200)
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": {
    // Response data
  }
}
```

### Error Response (4xx/5xx)
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Detailed error description"
}
```

---

## Authentication Headers

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

Replace `<JWT_TOKEN>` with the token received from login endpoint.

---

## Base URL

```
http://localhost:3000/v1/api
```

---

## Rate Limiting

- All APIs have rate limiting enabled
- Default limit: 100 requests per 15 minutes per IP
- Requests exceeding limit will receive 429 (Too Many Requests) status

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Success |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Invalid/missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## Last Updated

January 3, 2026

---

**Note:** This documentation covers all APIs added for Admin, Seller, Customer, and User modules. For any additional features or changes, please refer to the route files in `/src/routes/`.
