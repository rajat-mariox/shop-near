import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import useAuthStore from "../../store/authStore";

const NAV_SECTIONS = [
  {
    heading: "General",
    items: [
      { label: "Dashboard", path: "/", icon: "📊" },
      { label: "Sellers", path: "/sellers", icon: "🏪" },
      { label: "Users", path: "/users", icon: "👥" },
      { label: "Categories", path: "/categories", icon: "📂" },
      { label: "Products", path: "/products", icon: "🛍" },
      { label: "Orders", path: "/orders", icon: "📦" },
      { label: "Payments", path: "/payments", icon: "💳" },
    ],
  },
  {
    heading: "Marketing",
    items: [
      { label: "Coupons", path: "/coupons", icon: "🎟️" },
      { label: "Offers", path: "/offers", icon: "🏷️" },
      { label: "Banners", path: "/banners", icon: "🖼️" },
      { label: "Brands", path: "/brands", icon: "🏷" },
    ],
  },
  {
    heading: "Tools",
    items: [
      { label: "CMS Pages", path: "/cms", icon: "📄" },
      { label: "Delivery Settings", path: "/delivery-settings", icon: "🚚" },
    ],
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { admin, logout } = useAuthStore();

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      style={{
        width: 260,
        background: "#fff",
        borderRight: "1px solid #ececec",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "24px 0",
      }}
    >
      <div style={{ padding: "0 32px", marginBottom: 32 }}>
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            display: "flex",
            alignItems: "center",
            gap: 12,
            border: "1px solid #ececec",
            height: 55,
            padding: "0 16px",
          }}
        >
          <img
            src="/newLogo.jpeg"
            alt="ShopNear"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              objectFit: "cover",
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: 12, color: "#bbb", fontWeight: 500 }}>
              Admin Panel
            </div>
            <div style={{ fontWeight: 700, color: "#222", fontSize: 16 }}>
              ShopNear
            </div>
          </div>
        </div>
      </div>

      <nav style={{ flex: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <div key={section.heading}>
            <div
              style={{
                fontSize: 13,
                color: "#727272",
                fontWeight: 400,
                margin: "16px 0 4px 20px",
              }}
            >
              {section.heading}
            </div>
            <ul>
              {section.items.map((item) => {
                const active = isActive(item.path);
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: active ? "#FFF0EE" : "transparent",
                        borderRadius: 8,
                        margin: "0 16px 4px 16px",
                        padding: "11px 20px",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#FF6051" : "#555",
                        cursor: "pointer",
                        transition: "background 0.2s",
                        fontSize: 15,
                        textDecoration: "none",
                      }}
                    >
                      <span style={{ fontSize: 17 }}>{item.icon}</span>
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div
        style={{
          marginTop: "auto",
          padding: "24px 32px 0",
          borderTop: "1px solid #ececec",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#FF6051",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              {admin?.name || "Admin"}
            </div>
            <div style={{ fontSize: 12, color: "#888" }}>
              {admin?.email || "admin@shopnear.com"}
            </div>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            marginTop: 16,
            background: "#fff4f2",
            border: "1px solid #ffd7cf",
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            cursor: "pointer",
            color: "#e74c3c",
            fontWeight: 700,
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
