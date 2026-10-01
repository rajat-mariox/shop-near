import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';

/**
 * Admin panel > CMS ka content (public endpoint, token nahi chahiye — Landing/Login
 * se bhi khulta hai).
 * @param {'terms'|'privacy'|'about'|'shipping'|'cancellation'|'refund'|'contact'} type
 * @returns data: { type, title, content, updatedAt, contact? }
 */
export const fetchCmsPage = async (type) => {
  try {
    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.CMS_PAGE}/${type}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    }
    return { success: false, message: data.message || 'Failed to load page' };
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
