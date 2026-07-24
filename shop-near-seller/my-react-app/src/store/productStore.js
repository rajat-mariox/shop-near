import { create } from "zustand";
import {
  getSellerProducts,
  deleteSellerProduct,
} from "../api/sellerApi";

let fetchPromise = null;

const useProductStore = create((set, get) => ({
  products: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: true,
  search: "",
  // filters
  categoryId: "",
  stockFilter: "",
  statusFilter: "",
  minPrice: "",
  maxPrice: "",
  startDate: "",
  endDate: "",

  fetchProducts: () => {
    if (fetchPromise) return fetchPromise;
    const {
      page, limit, search,
      categoryId, stockFilter, statusFilter,
      minPrice, maxPrice, startDate, endDate,
    } = get();

    set({ loading: true });
    const params = { page, limit, search: search || undefined };
    if (categoryId) params.categoryId = categoryId;
    if (stockFilter) params.stock = stockFilter;
    if (statusFilter) params.isActive = statusFilter;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    fetchPromise = getSellerProducts(params)
      .then((res) => {
        const d = res.data?.data || res.data;
        set({
          products: d.products || [],
          total: d.total_products ?? d.totalProducts ?? d.total ?? 0,
          loading: false,
        });
      })
      .catch(() => {
        set({ products: [], loading: false });
      })
      .finally(() => {
        fetchPromise = null;
      });
    return fetchPromise;
  },

  setPage: (page) => {
    set({ page });
    get().fetchProducts();
  },

  setSearch: (search) => set({ search }),

  searchProducts: () => {
    set({ page: 1 });
    get().fetchProducts();
  },

  setFilter: (key, value) => {
    set({ [key]: value, page: 1 });
    fetchPromise = null; // allow new fetch
    get().fetchProducts();
  },

  clearFilters: () => {
    set({
      categoryId: "",
      stockFilter: "",
      statusFilter: "",
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
      page: 1,
    });
    fetchPromise = null;
    get().fetchProducts();
  },

  removeProduct: async (id) => {
    await deleteSellerProduct(id);
    set((s) => ({
      products: s.products.filter((p) => p._id !== id),
      total: s.total - 1,
    }));
  },
}));

export default useProductStore;
