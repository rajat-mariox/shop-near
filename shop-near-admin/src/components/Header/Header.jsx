import React from "react";
import useAuthStore from "../../store/authStore";
import NotificationBell from "../Sidebar/NotificationBell";

/**
 * Slim top header (seller panel jaisa): right side me notification bell aur
 * admin ka naam/avatar. Global search jaan-boojh kar nahi hai.
 */
const Header = ({ onMenuClick }) => {
  const { admin } = useAuthStore();
  const name = admin?.name || "Admin";
  const email = admin?.email || "admin@shopnear.com";

  return (
    <header className="admin-header">
      {/* Mobile/tablet: hamburger + logo (desktop par CSS se hidden) */}
      <div className="header-mobile-brand">
        <button
          type="button"
          className="header-menu-btn"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 7h16M4 12h16M4 17h10"
              stroke="#222"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <img src="/newLogo.jpeg" alt="AasPass" className="header-logo" />
        <span className="header-title">AasPass</span>
      </div>
      <div style={{ flex: 1 }} />
      <NotificationBell />
      <div className="header-divider" />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#FF6051",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            flexShrink: 0,
          }}
        >
          {(name || email).charAt(0).toUpperCase()}
        </div>
        <div className="header-user-text" style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>Admin</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
