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

// Redirect to login on 401/403
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response &&
      (err.response.status === 401 || err.response.status === 403)
    ) {
      localStorage.removeItem("sellerToken");
      localStorage.removeItem("sellerUser");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default client;
