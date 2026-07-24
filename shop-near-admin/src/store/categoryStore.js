import { create } from "zustand";
import { getCategories } from "../api/adminApi";

let fetchPromise = null;

const useCategoryStore = create((set) => ({
  categories: [],
  loaded: false,

  fetchCategories: () => {
    if (fetchPromise) return fetchPromise;
    fetchPromise = getCategories({ limit: 100 })
      .then((res) => {
        const d = res.data?.data || res.data;
        set({ categories: d.categories || d || [], loaded: true });
      })
      .catch((err) => {
        console.error("Failed to fetch categories:", err);
      })
      .finally(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  },

  invalidate: () => {
    set({ loaded: false });
    fetchPromise = null;
  },
}));

export default useCategoryStore;
