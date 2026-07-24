import { createContext, useContext, useState, useEffect } from "react";
import { getSellerProfile } from "../api/sellerApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("sellerToken");
    if (token) {
      getSellerProfile()
        .then((res) => {
          const data = res.data?.data || res.data;
          setSeller(data);
        })
        .catch(() => {
          localStorage.removeItem("sellerToken");
          setSeller(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, sellerData) => {
    localStorage.setItem("sellerToken", token);
    setSeller(sellerData);
  };

  const logout = () => {
    localStorage.removeItem("sellerToken");
    setSeller(null);
  };

  return (
    <AuthContext.Provider value={{ seller, setSeller, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
