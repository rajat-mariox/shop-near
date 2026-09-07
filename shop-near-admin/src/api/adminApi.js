import client from "./client";

/* ============ AUTH ============ */
export const adminLogin = (email, password) =>
  client.post("/admin/login", { email, password });

export const getAdminProfile = () => client.get("/admin/getDetails");

/* ============ DASHBOARD ============ */
export const getDashboardStats = () => client.get("/admin/dashboard/stats");

/* ============ SELLERS ============ */
export const getSellers = (params) => client.get("/admin/sellers", { params });
export const getSellerDetail = (id) => client.get(`/admin/sellers/${id}`);
export const approveSeller = (id) => client.put(`/admin/sellers/${id}/approve`);
export const rejectSeller = (id, reason) =>
  client.put(`/admin/sellers/${id}/reject`, { rejectedReason: reason });
export const toggleSellerStatus = (id) =>
  client.put(`/admin/sellers/${id}/toggle-status`);
export const deleteSeller = (id) => client.delete(`/admin/sellers/${id}`);
export const createSeller = (data) => client.post("/admin/sellers", data);
// Shop pin set/update (purane sellers ke liye jinke paas coords nahi)
export const setSellerLocation = (id, data) =>
  client.put(`/admin/sellers/${id}/location`, data);

/* ============ USERS ============ */
export const getUsers = (params) => client.get("/admin/users", { params });
export const getUserDetail = (id) => client.get(`/admin/users/${id}`);
export const toggleUserStatus = (id) =>
  client.put(`/admin/users/${id}/toggle-status`);

/* ============ CATEGORIES ============ */
export const getCategories = (params) =>
  client.get("/admin/categories", { params });
export const getCategoryDetail = (id) => client.get(`/admin/categories/${id}`);
// Category ab image ke saath banti/update hoti hai, isliye multipart bhejte hain
export const createCategory = (formData) =>
  client.post("/admin/categories", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCategory = (id, formData) =>
  client.put(`/admin/categories/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const toggleCategoryStatus = (id) =>
  client.patch(`/admin/categories/${id}`);
export const deleteCategory = (id) => client.delete(`/admin/categories/${id}`);

/* ============ PRODUCTS ============ */
export const getProducts = (params) =>
  client.get("/admin/products", { params });
export const getProductDetail = (id) => client.get(`/admin/products/${id}`);
export const toggleProductStatus = (id) =>
  client.put(`/admin/products/${id}/toggle-status`);
export const deleteProduct = (id) => client.delete(`/admin/products/${id}`);

/* ============ ORDERS ============ */
export const getOrders = (params) => client.get("/admin/orders", { params });
export const getOrderDetailApi = (id) => client.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status, adminNotes) =>
  client.put(`/admin/orders/${id}/status`, { status, adminNotes });

/* ============ BANNERS ============ */
export const getBanners = (params) => client.get("/admin/banners", { params });
export const createBanner = (formData) =>
  client.post("/admin/banners", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBanner = (id, formData) =>
  client.put(`/admin/banners/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteBanner = (id) => client.delete(`/admin/banners/${id}`);
export const getHomeHeaderBg = () => client.get("/admin/home-header-bg");
export const updateHomeHeaderBg = (formData) =>
  client.put("/admin/home-header-bg", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const removeHomeHeaderBg = () =>
  client.put("/admin/home-header-bg", { remove: true });

/* ============ BRANDS ============ */
export const getBrands = (params) => client.get("/admin/brands", { params });
export const createBrand = (formData) =>
  client.post("/admin/brands", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateBrand = (id, formData) =>
  client.put(`/admin/brands/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const toggleBrandStatus = (id) =>
  client.put(`/admin/brands/${id}/toggle-status`);
export const deleteBrand = (id) => client.delete(`/admin/brands/${id}`);

/* ============ COUPONS ============ */
export const getCoupons = () => client.get("/coupon/admin/list");
export const getCouponDetail = (id) => client.get(`/coupon/admin/${id}`);
// Coupon ab promo card ki image ke saath banta hai, isliye multipart
export const createCoupon = (formData) =>
  client.post("/coupon/admin/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateCoupon = (id, formData) =>
  client.put(`/coupon/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteCoupon = (id) => client.delete(`/coupon/admin/${id}`);

/* ============ OFFERS ============ */
export const getOffers = () => client.get("/offers/admin/list");
export const getOfferDetail = (id) => client.get(`/offers/admin/${id}`);
export const createOffer = (formData) =>
  client.post("/offers/admin/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const updateOffer = (id, formData) =>
  client.put(`/offers/admin/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteOffer = (id) => client.delete(`/offers/admin/${id}`);
export const toggleOfferStatus = (id) =>
  client.patch(`/offers/admin/${id}/toggle`);

/* ============ CMS ============ */
const CMS_TYPES = [
  "terms",
  "privacy",
  "about",
  "shipping",
  "cancellation",
  "refund",
  "contact",
];
export const getCmsPage = (type) => client.get(`/admin/cms/${type}`);
export const saveCmsPage = (type, data) =>
  client.post(`/admin/cms/${type}`, data);
export { CMS_TYPES };

/* ============ Delivery Settings ============ */
export const getDeliverySettings = () => client.get("/admin/delivery-settings");
export const updateDeliverySettings = (data) =>
  client.put("/admin/delivery-settings", data);

/* ============ NOTIFICATIONS (sidebar bell) ============ */
export const getAdminNotifications = (params) =>
  client.get("/admin/notifications", { params });
export const getAdminUnreadCount = () => client.get("/admin/notifications/unread-count");
export const markAdminNotificationRead = (id) => client.put(`/admin/notifications/${id}/read`);
export const markAllAdminNotificationsRead = () => client.put("/admin/notifications/read-all");
