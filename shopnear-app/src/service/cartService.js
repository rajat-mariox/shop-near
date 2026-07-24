import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Add product to cart
 * @param {Object} params - Cart params
 * @param {string} params.productId - Product ID
 * @param {string} params.sellerId - Seller ID
 * @param {number} params.quantity - Quantity
 * @param {Object} params.selectedColor - Selected color (object with name/code)
 * @param {string} params.selectedSize - Selected size
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const addToCart = async ({ productId, sellerId, quantity, selectedColor, selectedSize }) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.ADD_CART}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        productId,
        sellerId,
        quantity,
        selectedColor,
        selectedSize,
      }),
    });
    const data = await response.json();
    if (data.code === 1 && data.data) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to add to cart' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Remove item from cart
 * @param {string} itemId - Cart item ID
 */
export const removeFromCart = async (itemId) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.CART_ITEM}/${itemId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to remove item' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Update cart item quantity
 * @param {string} itemId - Cart item ID
 * @param {number} quantity - New quantity
 */
export const updateCartItemQty = async (itemId, quantity) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.CART_ITEM}/${itemId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quantity }),
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to update quantity' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch cart list for the current user
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchCartList = async () => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.CART_LIST}`;
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
      return { success: false, message: data.message || 'Failed to fetch cart' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
