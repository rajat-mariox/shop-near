import client from "./client";

/* ============ AUTH ============ */
export const sellerLogin = (mobile) => client.post("/seller/login", { mobile });

export const sellerVerifyOtp = (mobile, otp, txnId) =>
  client.post("/seller/verify-otp", { mobile, otp, txnId });

/* ============ PROFILE ============ */
export const getSellerProfile = () => client.get("/seller/profile");

const bodyHeaders = (data) => ({
  headers: {
    "Content-Type":
      data instanceof FormData ? "multipart/form-data" : "application/json",
  },
});

export const updateSellerProfile = (data) =>
  client.put("/seller/profile", data, bodyHeaders(data));

export const updateSellerKyc = (data) =>
  client.put("/seller/kyc", data, bodyHeaders(data));

export const updateSellerBank = (data) => client.put("/seller/bank", data);

export const updateShopTiming = (data) =>
  client.put("/seller/shop-timing", data);

/* ============ PRODUCTS ============ */
export const getSellerProducts = (params) =>
  client.get("/seller/products", { params });

export const getSellerProductDetail = (id) =>
  client.get(`/seller/products/${id}`);

export const createSellerProduct = (formData) =>
  client.post("/seller/products", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateSellerProduct = (id, formData) =>
  client.put(`/seller/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteSellerProduct = (id) =>
  client.delete(`/seller/products/${id}`);

/* ============ CATEGORIES ============ */
export const getSellerCategories = () => client.get("/seller/categories");

/* ============ BRANDS ============ */
export const getSellerBrands = () =>
  client.get("/seller/brands", { params: { isActive: true, limit: 100 } });

/* ============ ORDERS ============ */
export const getSellerOrders = (params) =>
  client.get("/order/seller/orders", { params });

/* ============ CUSTOMERS ============ */
export const getSellerCustomers = (params) =>
  client.get("/order/seller/customers", { params });

export const getSellerOrderDetail = (id) =>
  client.get(`/order/seller/orders/${id}`);

export const getSellerOrderStats = () => client.get("/order/seller/stats");

export const acceptOrder = (orderId) =>
  client.post("/order/seller/accept", { orderId });

export const rejectOrder = (orderId, reason) =>
  client.post("/order/seller/reject", { orderId, reason });

export const updateOrderStatus = (orderId, status) =>
  client.put("/order/seller/update-status", { orderId, status });

export const sendDeliveryOtp = (orderId) =>
  client.post("/order/seller/send-delivery-otp", { orderId });

export const verifySellerDeliveryOtp = (orderId, otp) =>
  client.post("/order/seller/verify-delivery-otp", { orderId, otp });

export const updateTracking = (orderId, trackingData) =>
  client.put("/order/seller/update-tracking", { orderId, ...trackingData });
