import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Add product to wishlist
 * @param {Object} params - Wishlist params
 * @param {string} params.productId - Product ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const addToWishlist = async ({ productId }) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.ADD_WISHLIST}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
      }),
    });
    const data = await response.json();
    // The API may not return code/data like cart, so check for success by HTTP status or fallback
    if ((data.code === 1 && data.data) || response.ok) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to add to wishlist' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
/**
 * Remove product from wishlist
 * @param {Object} params
 * @param {string} params.productId - Product ID
 */
export const removeFromWishlist = async ({ productId }) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.WISHLIST_REMOVE}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productId }),
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to remove from wishlist' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
/**
 * Fetch wishlist for the current user
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchWishlist = async () => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.WISHLIST_LIST}`;
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
      return { success: false, message: data.message || 'Failed to fetch wishlist' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
