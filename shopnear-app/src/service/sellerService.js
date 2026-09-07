// src/service/sellerService.js
import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Fetch sellers list from API
 * @param {string} token - Bearer token for auth
 * @param {number} page - Page number (optional)
 * @param {number} limit - Results per page (optional)
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
// coords = live GPS { lat, lng }; backend isi se nearby (admin radius) filter karta hai,
// na ho to saved address use karta hai
export const fetchSellers = async (page = 1, limit = 10, coords = null) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const geo =
      coords && coords.lat != null && coords.lng != null ? `&lat=${coords.lat}&lng=${coords.lng}` : '';
    const url = `${API_BASE_URL}${API_ENDPOINTS.SELLER_LIST}?page=${page}&limit=${limit}${geo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1 && data.data && Array.isArray(data.data.sellers)) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch sellers' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
/**
 * Fetch shops (sellers) that belong to a given category.
 * Backend `/user/sellers` already supports a `category` query filter.
 * @param {string} categoryId - Category's ID
 * @param {number} page - Page number (optional)
 * @param {number} limit - Results per page (optional)
 * @param {{lat:number,lng:number}|null} coords - Live GPS; backend isi se nearby filter karta hai
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchShopsByCategory = async (categoryId, page = 1, limit = 20, coords = null) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const geo =
      coords && coords.lat != null && coords.lng != null ? `&lat=${coords.lat}&lng=${coords.lng}` : '';
    const url = `${API_BASE_URL}${API_ENDPOINTS.SELLER_LIST}?category=${categoryId}&page=${page}&limit=${limit}${geo}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1 && data.data && Array.isArray(data.data.sellers)) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch shops' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
/**
 * Fetch categories for a seller
 * @param {string} sellerId - Seller's ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchSellerCategories = async (sellerId) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.SELLER_CATEGORIES}/${sellerId}/categories`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    if (data.code === 1 && data.data && Array.isArray(data.data.categories)) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to fetch seller categories' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
