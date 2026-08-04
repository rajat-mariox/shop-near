import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import useProductStore from "../../store/productStore";
import useOrderStore from "../../store/orderStore";

import fallbackLogo from "../../assets/Images/newLogo.jpeg";
import icClose from "../../assets/figma/ic-close-panel.svg";
import icHome from "../../assets/figma/ic-home.svg";
import icHomeActive from "../../assets/figma/ic-home-active.svg";
import icStore from "../../assets/figma/ic-store.svg";
import icStoreActive from "../../assets/figma/ic-store-active.svg";
import icNote from "../../assets/figma/ic-note.svg";
import icNoteActive from "../../assets/figma/ic-note-active.svg";
import icUsers from "../../assets/figma/ic-users.svg";
import icUsersActive from "../../assets/figma/ic-users-active.svg";
import icChart from "../../assets/figma/ic-chart.svg";
import icChartActive from "../../assets/figma/ic-chart-active.svg";
import icSettings from "../../assets/figma/ic-settings.svg";
import icSettingsActive from "../../assets/figma/ic-settings-active.svg";
import icHelp from "../../assets/figma/ic-help.svg";
import icChevron from "../../assets/figma/ic-chevron.svg";

const ACTIVE_BG = "#fff2f0";
const ACTIVE_TEXT = "#454545";
const INACTIVE_TEXT = "#888";

const ItemIcon = ({ src, style }) => (
  <img
    src={src}
    alt=""
    style={{ width: 18, height: 18, objectFit: "contain", flexShrink: 0, ...style }}
  />
);

const MenuItem = ({ icon, iconActive, label, active, onClick, trailing }) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      height: 40,
      padding: 8,
      borderRadius: 12,
      cursor: "pointer",
      background: active ? ACTIVE_BG : "transparent",
      transition: "background 0.2s",
    }}
  >
    {icon && <ItemIcon src={active && iconActive ? iconActive : icon} />}
    <span
      style={{
        flex: 1,
        fontSize: 14,
        lineHeight: 1.5,
        fontWeight: active ? 700 : 400,
        color: active ? ACTIVE_TEXT : INACTIVE_TEXT,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {label}
    </span>
    {trailing}
  </div>
);

const SectionTitle = ({ children }) => (
  <div style={{ padding: "0 8px", fontSize: 14, color: "#727272", lineHeight: 1.5 }}>
    {children}
  </div>
);

const Sidebar = ({ onNavigate }) => {
  const [productOpen, setProductOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const rawNavigate = useNavigate();
  const location = useLocation();
  const seller = useAuthStore((s) => s.seller);
  const logout = useAuthStore((s) => s.logout);
  const productTotal = useProductStore((s) => s.total);
  const fetchProducts = useProductStore((s) => s.fetchProducts);
  const orderTotal = useOrderStore((s) => s.totalOrders);
  const fetchStats = useOrderStore((s) => s.fetchStats);

  const navigate = (path) => {
    rawNavigate(path);
    onNavigate?.();
  };

  useEffect(() => {
    fetchProducts();
    fetchStats();
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const productSubItems = [
    { label: "All Products", path: "/product" },
    {
      label: "Add Product",
      path: "/product",
      state: { openAdd: true },
    },
  ];

  return (
    <aside
      style={{
        width: "100%",
        minHeight: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        gap: 40,
        padding: "32px 16px",
      }}
    >
      {/* Top: Company card + close button (ShopNear logo ki jagah) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: 8,
            border: "1px solid #e7e7e7",
            borderRadius: 12,
          }}
        >
          <img
            src={seller?.shopLogo || fallbackLogo}
            alt=""
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 12, color: "#b0b0b0", lineHeight: 1.4 }}>Company</div>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#454545",
                lineHeight: 1.5,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {seller?.shopName || "ShopNear"}
            </div>
          </div>
        </div>
        <img
          src={icClose}
          alt="Close panel"
          onClick={() => onNavigate?.()}
          style={{ width: 22, height: 22, cursor: "pointer", flexShrink: 0 }}
        />
      </div>

      {/* Menu */}
      <div style={{ display: "flex", flexDirection: "column", gap: 32, flex: 1, minHeight: 0 }}>
        {/* GENERAL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionTitle>GENERAL</SectionTitle>
          <MenuItem
            icon={icHome}
            iconActive={icHomeActive}
            label="Dashboard"
            active={isActive("/")}
            onClick={() => navigate("/")}
          />
          <div>
            <MenuItem
              icon={icStore}
              iconActive={icStoreActive}
              label={`Product (${productTotal})`}
              active={isActive("/product")}
              onClick={() => setProductOpen((o) => !o)}
              trailing={
                <ItemIcon
                  src={icChevron}
                  style={{
                    width: 14,
                    height: 14,
                    transform: productOpen ? "rotate(-90deg)" : "rotate(90deg)",
                    transition: "transform 0.2s",
                  }}
                />
              }
            />
            {productOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                {productSubItems.map((sub) => {
                  const subActive = isActive(sub.path) && !sub.state;
                  return (
                    <div
                      key={sub.label}
                      onClick={() => {
                        rawNavigate(sub.path, sub.state ? { state: sub.state } : undefined);
                        onNavigate?.();
                      }}
                      style={{
                        height: 40,
                        display: "flex",
                        alignItems: "center",
                        marginLeft: 32,
                        padding: 8,
                        borderRadius: 12,
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: subActive ? 700 : 400,
                        color: subActive ? ACTIVE_TEXT : INACTIVE_TEXT,
                        background: subActive ? ACTIVE_BG : "transparent",
                      }}
                    >
                      {sub.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <MenuItem
            icon={icNote}
            iconActive={icNoteActive}
            label={`Transaction (${orderTotal})`}
            active={isActive("/transaction")}
            onClick={() => navigate("/transaction")}
          />
          <MenuItem
            icon={icUsers}
            iconActive={icUsersActive}
            label="Customers"
            active={isActive("/customer")}
            onClick={() => navigate("/customer")}
          />
          <MenuItem
            icon={icUsers}
            iconActive={icUsersActive}
            label="Delivery Agents"
            active={isActive("/agents")}
            onClick={() => navigate("/agents")}
          />
          <MenuItem
            icon={icChart}
            iconActive={icChartActive}
            label="Sales Report"
            active={isActive("/sales-report")}
            onClick={() => navigate("/sales-report")}
          />
        </div>

        {/* TOOLS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionTitle>TOOLS</SectionTitle>
          <MenuItem
            icon={icSettings}
            iconActive={icSettingsActive}
            label="Account & Settings"
            active={isActive("/account-profile")}
            onClick={() => navigate("/account-profile")}
          />
          <MenuItem
            icon={icHelp}
            label="Help"
            active={false}
            onClick={() => window.open("mailto:support@shopnear.in")}
          />
        </div>
      </div>

      {/* Account card */}
      <div
        style={{
          border: "1px solid #e7e7e7",
          borderRadius: 12,
          padding: 8,
        }}
      >
        <div
          onClick={() => setAccountOpen((o) => !o)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}>
            {seller?.ownerImage ? (
              <img
                src={seller.ownerImage}
                alt=""
                style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: "#FF6051",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: 16,
                  flexShrink: 0,
                }}
              >
                {(seller?.fullName || "S").charAt(0).toUpperCase()}
              </div>
            )}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#454545",
                  lineHeight: 1.5,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {seller?.fullName || "Seller"}
              </div>
              <div style={{ fontSize: 12, color: "#b0b0b0", lineHeight: 1.4 }}>Seller</div>
            </div>
          </div>
          <ItemIcon
            src={icChevron}
            style={{
              width: 14,
              height: 14,
              transform: accountOpen ? "rotate(-90deg)" : "rotate(90deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
        {accountOpen && (
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              marginTop: 8,
              background: "#fff2f0",
              border: "1px solid #ffd7cf",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              color: "#FF6051",
              fontWeight: 700,
            }}
          >
            Logout
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
