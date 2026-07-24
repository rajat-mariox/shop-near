import { create } from "zustand";
import { getAdminProfile } from "../api/adminApi";

let initPromise = null;

const useAuthStore = create((set) => ({
  admin: null,
  loading: true,

  init: () => {
    if (initPromise) return initPromise;
    const token = localStorage.getItem("adminToken");
    if (!token) {
      set({ loading: false });
      return Promise.resolve();
    }
    initPromise = getAdminProfile()
      .then((res) => {
        set({ admin: res.data?.data || res.data, loading: false });
      })
      .catch(() => {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        set({ admin: null, loading: false });
      });
    return initPromise;
  },

  login: (token, user) => {
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminUser", JSON.stringify(user));
    set({ admin: user });
  },

  logout: () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    set({ admin: null });
    initPromise = null;
  },
}));

export default useAuthStore;
