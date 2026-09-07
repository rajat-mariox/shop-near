import "./App.css";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";
import StatsCards from "./components/Dashboard/StatsCards";
import YourSalesThisYearChart from "./components/Dashboard/YourSalesThisYearChart";
import IncreaseSalesCard from "./components/Dashboard/IncreaseSalesCard";
import CustomerGrowthMap from "./components/Dashboard/CustomerGrowthMap";
import ProductPopularTable from "./components/Dashboard/ProductPopularTable";
import Product from "./components/Product/Product";
import AccountProfile from "./components/Account/AccountProfile";
import Transaction from "./components/Transaction/Transaction";
import Customer from "./components/Customer/Customer";
import Agents from "./components/Agents/Agents";
import SalesReport from "./components/SalesReport/SalesReport";
import Login from "./components/Auth/Login";
import Onboarding from "./components/Onboarding/Onboarding";

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

function DashboardContent() {
  return (
    <div className="dashboard-content">
      {/* Title / Breadcrumbs */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2a2a2a", lineHeight: 1.3 }}>
          Dashboard
        </div>
        <div style={{ fontSize: 14, color: "#888", lineHeight: 1.5, marginTop: 8 }}>
          Dashboard
        </div>
      </div>
      {/* Row 1: Sales chart | Stat cards + promo */}
      <div className="dash-row" style={{ marginBottom: 22 }}>
        <div className="dash-col" style={{ flex: "1.05 1 460px" }}>
          <YourSalesThisYearChart />
        </div>
        <div className="dash-col" style={{ flex: "1 1 440px" }}>
          <StatsCards />
          <IncreaseSalesCard />
        </div>
      </div>
      {/* Row 2: Customer growth map | Product popular table */}
      <div className="dash-row">
        <CustomerGrowthMap />
        <ProductPopularTable />
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const seller = useAuthStore((s) => s.seller);
  const loading = useAuthStore((s) => s.loading);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f7f7fa",
        }}
      >
        <p style={{ color: "#888", fontSize: 16 }}>Loading...</p>
      </div>
    );
  }
  if (!seller) return <Navigate to="/login" replace />;
  if (seller.status && seller.status !== "approved") {
    return (
      <Navigate
        to={seller.status === "pending_profile" ? "/onboarding" : "/verification"}
        replace
      />
    );
  }

  return (
    <div className="app-container">
      {/* Mobile hamburger */}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`seller-sidebar ${sidebarOpen ? "open" : ""}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<DashboardContent />} />
          <Route path="/product" element={<Product />} />
          <Route path="/account-profile" element={<AccountProfile />} />
          <Route path="/sales-report" element={<SalesReport />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/agents" element={<Agents />} />
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
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/verification" element={<Onboarding verification />} />
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
