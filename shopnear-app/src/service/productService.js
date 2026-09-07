import { API_BASE_URL } from '../constants/api';
import { getTokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from '../constants/api.endpoint';

/**
 * Fetch products for a seller by category.
 * @param {string} sellerId - Seller ID
 * @param {string} categoryId - Category ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchProductsByCategory = async (sellerId, categoryId) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}/user/sellers/${sellerId}/products${categoryId ? `?categoryId=${categoryId}` : ''}`;
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
      return { success: false, message: data.message || 'Failed to fetch products' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch all products of a brand (home "Popular Brand" tile)
 * @param {string} brandId - Brand ID
 */
export const fetchProductsByBrand = async (brandId) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}/user/brands/${brandId}/products`;
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
      return { success: false, message: data.message || 'Failed to fetch products' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch product details by product ID
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchProductDetail = async (productId) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/${productId}`;
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
      return { success: false, message: data.message || 'Failed to fetch product detail' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Fetch ratings/reviews for a product (average, distribution, review list)
 * @param {string} productId - Product ID
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchProductRatings = async (productId) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/${productId}/ratings`;
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
    }
    return { success: false, message: data.message || 'Failed to fetch ratings' };
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Submit a product rating/review for a delivered order.
 * @param {string} productId - Product ID
 * @param {{orderId: string, rating: number, reviewText?: string}} payload
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const submitProductRating = async (
  productId,
  { orderId, rating, reviewText, images = [] },
) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.PRODUCT}/${productId}/ratings`;
    let options;
    if (images.length > 0) {
      // Review photos ke saath multipart; backend req.files.images se S3 par daalta hai
      const formData = new FormData();
      formData.append('orderId', String(orderId));
      formData.append('rating', String(rating));
      formData.append('reviewText', reviewText || '');
      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `review_${idx}.jpg`,
          type: img.type || 'image/jpeg',
        });
      });
      options = {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      };
    } else {
      options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, rating, reviewText }),
      };
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    }
    return { success: false, message: data.message || 'Failed to submit review' };
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};

/**
 * Search products by query string.
 * @param {string} query - Search text
 * @param {number} page - Page number
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const searchProducts = async (query, page = 1) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.SEARCH}?q=${encodeURIComponent(query)}&page=${page}&limit=20`;
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
    }
    return { success: false, message: data.message || 'No results found' };
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
