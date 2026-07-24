import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';

/**
 * Submit app feedback (star rating + optional message + optional photos)
 * @param {number} rating
 * @param {string} message
 * @param {Array<{uri: string, fileName?: string, type?: string}>} [images]
 */
export const submitFeedback = async (rating, message, images = []) => {
  try {
    const token = await getTokenStorage();
    if (!token) throw new Error('No auth token found');
    const url = `${API_BASE_URL}${API_ENDPOINTS.SUBMIT_FEEDBACK}`;
    let options;
    if (images.length > 0) {
      // Photos ke saath multipart — backend req.files.images me uthata hai
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('message', message || '');
      images.forEach((img, idx) => {
        formData.append('images', {
          uri: img.uri,
          name: img.fileName || `feedback_${idx}.jpg`,
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
        body: JSON.stringify({ rating, message }),
      };
    }
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.code === 1) {
      return { success: true, data: data.data };
    } else {
      return { success: false, message: data.message || 'Failed to submit feedback' };
    }
  } catch (error) {
    return { success: false, message: error.message || 'Network error' };
  }
};
