import { API_BASE_URL } from '../constants/api';
import { getTokenStorage } from '../utils/tokenStorage';
import { API_ENDPOINTS } from '../constants/api.endpoint';

/**
 * Fetch home screen data for the user.
 * @param {{lat:number,lng:number}|null} [coords] live location - backend isi ke
 *   around admin-set radius me "Shops Near You" nikalta hai (na ho to saved address)
 * @returns {Promise<{success: boolean, data?: any, message?: string}>}
 */
export const fetchHomeScreen = async (coords = null) => {
  try {
    const token = await getTokenStorage();
    if (!token) {
      throw new Error('No auth token found');
    }
    const query =
      coords && coords.lat != null && coords.lng != null
        ? `?lat=${coords.lat}&lng=${coords.lng}`
        : '';
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HOME_SCREEN}${query}`, {
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
      return { success: false, message: data.message || 'Failed to fetch home screen' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
