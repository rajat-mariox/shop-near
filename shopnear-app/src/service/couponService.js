import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Fetch available coupons
 */
export const fetchAvailableCoupons = async () => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.COUPONS_AVAILABLE}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch coupons' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Apply coupon to cart
 * @param {string} couponCode - Coupon code
 */
export const applyCoupon = async (couponCode) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.CART_APPLY_COUPON}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ couponCode }),
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data, message: data.message || 'Coupon applied!' };
    } else {
      return { success: false, message: data.message || 'Failed to apply coupon' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Remove coupon from cart
 */
export const removeCoupon = async () => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.CART_REMOVE_COUPON}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, message: data.message || 'Coupon removed' };
    } else {
      return { success: false, message: data.message || 'Failed to remove coupon' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
