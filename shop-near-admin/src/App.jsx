import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import Dashboard from "./components/Dashboard/Dashboard";
import SellerList from "./components/Sellers/SellerList";
import SellerDetail from "./components/Sellers/SellerDetail";
import UserList from "./components/Users/UserList";
import UserDetail from "./components/Users/UserDetail";
import CategoryList from "./components/Categories/CategoryList";
import ProductList from "./components/Products/ProductList";
import OrderList from "./components/Orders/OrderList";
import OrderDetail from "./components/Orders/OrderDetail";
import Payments from "./components/Payments/Payments";
import CMSPage from "./components/CMS/CMSPage";
import CouponList from "./components/Coupons/CouponList";
import OfferList from "./components/Offers/OfferList";
import BannerList from "./components/Banners/BannerList";
import BrandList from "./components/Brands/BrandList";
import DeliverySettings from "./components/DeliverySettings/DeliverySettings";
import Login from "./components/Auth/Login";
import PrivacyPolicy from "./components/Public/PrivacyPolicy";
import DeleteAccount from "./components/Public/DeleteAccount";
import useAuthStore from "./store/authStore";

function ProtectedLayout() {
  const { admin, loading } = useAuthStore();
  if (loading)
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  if (!admin) return <Navigate to="/login" replace />;
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sellers" element={<SellerList />} />
          <Route path="/sellers/:id" element={<SellerDetail />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/:id" element={<UserDetail />} />
          <Route path="/categories" element={<CategoryList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/orders" element={<OrderList />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/coupons" element={<CouponList />} />
          <Route path="/offers" element={<OfferList />} />
          <Route path="/banners" element={<BannerList />} />
          <Route path="/brands" element={<BrandList />} />
          <Route path="/cms" element={<CMSPage />} />
          <Route path="/delivery-settings" element={<DeliverySettings />} />
          <Route
            path="*"
            element={
              <div
                className="page-content"
                style={{ textAlign: "center", paddingTop: 80 }}
              >
                <h2 style={{ color: "#888" }}>404 — Page not found</h2>
              </div>
            }
          />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Public pages (bina login) - Play Store listing URLs */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/delete-account" element={<DeleteAccount />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
