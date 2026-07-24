import { create } from "zustand";
import {
  getSellers,
  toggleSellerStatus,
  approveSeller,
  deleteSeller as deleteSellerApi,
  createSeller as createSellerApi,
} from "../api/adminApi";

let fetchPromise = null;

const useSellerStore = create((set, get) => ({
  sellers: [],
  total: 0,
  loading: true,
  page: 1,
  limit: 10,
  activeTab: 0,
  search: "",

  setPage: (page) => {
    set({ page });
    fetchPromise = null;
    get().fetchSellers();
  },

  setActiveTab: (activeTab) => {
    set({ activeTab, page: 1 });
    fetchPromise = null;
    get().fetchSellers();
  },

  setSearch: (search) => set({ search }),

  searchSellers: () => {
    set({ page: 1 });
    fetchPromise = null;
    get().fetchSellers();
  },

  fetchSellers: async () => {
    if (fetchPromise) return fetchPromise;
    const { page, limit, search, activeTab } = get();
    const TABS = [
      {},
      { isActive: true, status: "approved" },
      { isActive: false },
    ];
    set({ loading: true });
    fetchPromise = getSellers({
      page,
      limit,
      search: search || undefined,
      ...TABS[activeTab],
    })
      .then((res) => {
        const d = res.data?.data || res.data;
        set({
          sellers: d.sellers || d.seller || d.user || [],
          total: d.total_seller || d.total || d.total_user || 0,
          loading: false,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch sellers:", err);
        set({ loading: false });
      })
      .finally(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  },

  toggleStatus: async (id) => {
    await toggleSellerStatus(id);
    fetchPromise = null;
    get().fetchSellers();
  },

  approve: async (id) => {
    await approveSeller(id);
    fetchPromise = null;
    get().fetchSellers();
  },

  remove: async (id) => {
    await deleteSellerApi(id);
    fetchPromise = null;
    get().fetchSellers();
  },

  create: async (data) => {
    await createSellerApi(data);
    fetchPromise = null;
    get().fetchSellers();
  },
}));

export default useSellerStore;
