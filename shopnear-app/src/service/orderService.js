import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Create a new order
 * @param {Object} params - Order params
 * @param {string} params.addressId - Address ID
 * @param {string} params.paymentMethod - Payment method (e.g., 'online')
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const createOrder = async ({ addressId, paymentMethod }) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_CREATE}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ addressId, paymentMethod }),
    });
    const data = await response.json();
    if (data.code === 1 && data.data) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to create order' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch orders list for the current user
 * @param {Object} params
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} [params.status] - Order status (optional)
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchOrders = async ({ page = 1, limit = 10, status = '' } = {}) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    let url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_LIST}?page=${page}&limit=${limit}`;
    if (status) url += `&status=${encodeURIComponent(status)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1 && data.data) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch orders' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch order details by orderId
 * @param {string} orderId - Order ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchOrderById = async (orderId) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_DETAIL}/${orderId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1 && data.data) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch order details' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Cancel an order
 * @param {string} orderId - Order ID
 */
export const cancelOrder = async (orderId) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_CANCEL}/${orderId}/cancel`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to cancel order' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Initiate payment (Razorpay order creation)
 * @param {string} orderId - Order ID
 */
export const initiatePayment = async (orderId) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_PAYMENT}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId }),
    });
    const data = await response.json();
    if (data.code === 1 && data.data) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to initiate payment' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Verify Razorpay payment
 * @param {Object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 * @param {string} params.orderId
 */
export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.ORDER_VERIFY_PAYMENT}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }),
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Payment verification failed' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Verify delivery OTP
 * @param {Object} params
 * @param {string} params.orderId
 * @param {string} params.sellerId
 * @param {string} params.otp
 */
export const verifyDeliveryOtp = async ({ orderId, sellerId, otp }) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.VERIFY_DELIVERY_OTP}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, sellerId, otp }),
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'OTP verification failed' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
