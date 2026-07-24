import { MEDIA_BASE_URL } from '../constants/api';

/**
 * Backend se aane wale image path ko <Image source> me badalta hai.
 * Path absolute (http...) bhi ho sakta hai aur relative (/uploads/...) bhi.
 * Path missing ho to fallback local asset return hota hai.
 */
export const imageSource = (path, fallback) => {
  if (!path) {
    return fallback;
  }
  if (path.startsWith('http')) {
    return { uri: path };
  }
  return { uri: `${MEDIA_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}` };
};
