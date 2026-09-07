import { useEffect, useState } from 'react';
import { addToWishlist, fetchWishlist, removeFromWishlist } from '../service/wishService';

/**
 * Shared in-memory wishlist store.
 *
 * Pehle har screen (Search, ProductDetail, Wishlist) apna alag wishlist state
 * rakhti thi jo sirf mount par fetch hota tha. Native stack me screens mounted
 * rehti hain, isliye ek screen par heart hatao to doosri screen par bhara hi
 * rehta tha. Ab wishlisted productIds ka ek hi Set yahan rehta hai; jo bhi
 * screen add/remove kare, `useWishlistIds()` wali sab screens turant re-render
 * hoti hain.
 */

let ids = new Set();
const listeners = new Set();

const emit = () => listeners.forEach((fn) => fn(ids));

// Wishlist API item se productId nikaalo (object ya plain id dono ho sakta hai)
export const wishlistItemId = (item) =>
  String(item.productId?._id || item.productId || item.product?._id || item._id);

export const getWishlistIds = () => ids;

// Wishlist API ke items se store set karo (Wishlist screen list laane ke baad)
export const setWishlistFromItems = (data) => {
  const items = Array.isArray(data) ? data : data?.items || data?.wishlist || [];
  ids = new Set(items.map(wishlistItemId));
  emit();
};

const setWished = (productId, wished) => {
  const next = new Set(ids);
  if (wished) next.add(String(productId));
  else next.delete(String(productId));
  ids = next;
  emit();
};

// Backend se fresh list laake store sync karo
export const refreshWishlist = async () => {
  const res = await fetchWishlist();
  if (res.success) setWishlistFromItems(res.data);
  return res;
};

// Optimistic toggle: pehle UI badlo, API fail ho to wapas
export const toggleWishlist = async (productId) => {
  const wasWished = ids.has(String(productId));
  setWished(productId, !wasWished);
  const result = wasWished
    ? await removeFromWishlist({ productId })
    : await addToWishlist({ productId });
  if (!result.success) setWished(productId, wasWished);
  return { ...result, wished: result.success ? !wasWished : wasWished };
};

// Logout par purane user ke hearts na dikhein
export const clearWishlistStore = () => {
  ids = new Set();
  emit();
};

// Hook: store ka current Set, har change par re-render
export const useWishlistIds = () => {
  const [state, setState] = useState(ids);
  useEffect(() => {
    listeners.add(setState);
    setState(ids);
    return () => listeners.delete(setState);
  }, []);
  return state;
};
