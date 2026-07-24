import { create } from "zustand";
import { getSellerOrderStats } from "../api/sellerApi";

let fetchPromise = null;

const useOrderStore = create((set, get) => ({
  totalOrders: 0,
  loaded: false,

  fetchStats: () => {
    if (get().loaded) return Promise.resolve();
    if (fetchPromise) return fetchPromise;

    fetchPromise = getSellerOrderStats()
      .then((res) => {
        const d = res.data?.data || res.data;
        set({ totalOrders: d.totalOrders ?? 0, loaded: true });
      })
      .catch(() => {
        set({ loaded: true });
      })
      .finally(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  },
}));

export default useOrderStore;
