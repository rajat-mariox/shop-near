import { create } from "zustand";
import { getSellerProfile } from "../api/sellerApi";

let initPromise = null;

const useAuthStore = create((set, get) => ({
  seller: null,
  loading: true,

  init: () => {
    if (initPromise) return initPromise;
    const token = localStorage.getItem("sellerToken");
    if (!token) {
      set({ loading: false });
      return Promise.resolve();
    }
    initPromise = getSellerProfile()
      .then((res) => {
        const data = res.data?.data || res.data;
        set({ seller: data, loading: false });
      })
      .catch(() => {
        localStorage.removeItem("sellerToken");
        set({ seller: null, loading: false });
      })
      .finally(() => {
        initPromise = null;
      });
    return initPromise;
  },

  login: (token, sellerData) => {
    localStorage.setItem("sellerToken", token);
    set({ seller: sellerData });
  },

  setSeller: (sellerData) => set({ seller: sellerData }),

  logout: () => {
    localStorage.removeItem("sellerToken");
    set({ seller: null });
  },
}));

export default useAuthStore;
