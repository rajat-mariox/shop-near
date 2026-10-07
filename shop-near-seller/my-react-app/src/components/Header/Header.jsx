import React from "react";
import useAuthStore from "../../store/authStore";
import fallbackLogo from "../../assets/Images/newLogo.jpeg";
import NotificationBell from "./NotificationBell";

const Header = ({ onMenuClick }) => {
  const seller = useAuthStore((s) => s.seller);

  return (
    <header className="seller-header">
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
        <img src={fallbackLogo} alt="AasPass" className="header-logo" />
        <span className="header-title">AasPass</span>
      </div>
      <div style={{ flex: 1 }} />
      {/* Right content */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <NotificationBell />
        <div className="header-divider" style={{ width: 1, height: 34, background: "#e7e7e7" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 40, height: 36, flexShrink: 0 }}>
            <img
              src={seller?.shopLogo || seller?.ownerImage || fallbackLogo}
              alt=""
              style={{
                width: 40,
                height: 36,
                borderRadius: 6,
                objectFit: "cover",
                display: "block",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: -3,
                bottom: -3,
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#23a149",
                border: "2px solid #fff",
              }}
            />
          </div>
          <div className="header-user-text">
            <div
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: 16,
                color: "#2a2a2a",
                lineHeight: 1.1,
                whiteSpace: "nowrap",
              }}
            >
              {seller?.fullName || "Seller"}
            </div>
            <div
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 12,
                color: "#727272",
                lineHeight: 1.1,
                marginTop: 4,
              }}
            >
              Seller
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
