import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9001/v1/api";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// Inject seller token on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("sellerToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401/403 — sirf protected pages se. Auth/onboarding
// pages par hard redirect mat karo, warna signup ke beech me screen
// bina message ke gayab ho jati hai; wahan component khud error handle karta hai.
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      const path = window.location.pathname;
      const onAuthPage = ["/login", "/onboarding", "/verification"].some((p) =>
        path.startsWith(p),
      );
      if (!onAuthPage) {
        localStorage.removeItem("sellerToken");
        localStorage.removeItem("sellerUser");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);

export default client;
