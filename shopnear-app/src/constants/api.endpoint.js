// Centralized API endpoints
export const API_ENDPOINTS = {
  AUTH_LOGIN: '/auth/login',
  AUTH_VERIFY_OTP: '/auth/verifyOtp',
  USER_ADDRESS: '/user/address',
  USER_PROFILE: '/user/profile',
  USER_DELETE_ACCOUNT: '/user/delete-account',
  HOME_SCREEN: '/user/homeScreen',
  SELLER_LIST: '/user/sellers',
  SELLER_CATEGORIES: '/user/sellers',
  PRODUCT: '/user/products',
  SEARCH: '/user/search',

  // Cart endpoints
  ADD_CART: '/user/cart/add',
  CART_LIST: '/user/cart',
  CART_ITEM: '/user/cart/items', // Usage: `/user/cart/items/:itemId`
  CART_APPLY_COUPON: '/user/cart/apply-coupon',
  CART_REMOVE_COUPON: '/user/cart/coupon',

  // Wishlist endpoints
  ADD_WISHLIST: '/order/wishlist/add',
  WISHLIST_LIST: '/order/wishlist/list',
  WISHLIST_REMOVE: '/order/wishlist/remove',

  // Order endpoints
  ORDER_CREATE: '/user/orders/create',
  ORDER_LIST: '/user/orders',
  ORDER_DETAIL: '/user/orders', // Usage: `/user/orders/:orderId`
  ORDER_CANCEL: '/user/orders', // Usage: `/user/orders/:orderId/cancel`
  ORDER_PAYMENT: '/user/orders/payment',
  ORDER_VERIFY_PAYMENT: '/user/orders/verify-payment',

  // Delivery OTP
  VERIFY_DELIVERY_OTP: '/order/verify-delivery-otp',

  // Coupons
  COUPONS_AVAILABLE: '/coupon/available',

  // Offers
  OFFERS_HOME: '/offers/home',

  // Feedback
  SUBMIT_FEEDBACK: '/user/feedback',
};
