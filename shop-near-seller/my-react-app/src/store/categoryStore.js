import { create } from "zustand";
import { getSellerCategories } from "../api/sellerApi";

let fetchPromise = null;

const useCategoryStore = create((set, get) => ({
  categories: [],
  loaded: false,

  fetchCategories: () => {
    if (get().loaded) return Promise.resolve();
    if (fetchPromise) return fetchPromise;

    fetchPromise = getSellerCategories()
      .then((res) => {
        const d = res.data?.data || res.data;
        set({ categories: d.categories || d || [], loaded: true });
      })
      .catch(() => {
        set({ categories: [], loaded: true });
      })
      .finally(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  },
}));

export default useCategoryStore;
