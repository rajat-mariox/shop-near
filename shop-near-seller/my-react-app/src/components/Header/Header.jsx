import React from "react";
import useAuthStore from "../../store/authStore";
import fallbackLogo from "../../assets/Images/newLogo.jpeg";
import icSearch from "../../assets/figma/ic-search.svg";
import icMail from "../../assets/figma/ic-mail.svg";
import icBell from "../../assets/figma/ic-bell.svg";

const IconButton = ({ src, alt }) => (
  <button
    aria-label={alt}
    style={{
      background: "#f6f6f6",
      border: "none",
      borderRadius: 9,
      padding: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <img src={src} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
  </button>
);

const Header = () => {
  const seller = useAuthStore((s) => s.seller);

  return (
    <header
      style={{
        width: "100%",
        minHeight: 87,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "24px 32px",
        background: "#fff",
        borderBottom: "2px solid #e7e7e7",
      }}
    >
      {/* Search */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          width: 300,
          maxWidth: "100%",
          border: "1.6px solid #b0b0b0",
          borderRadius: 12,
          padding: "8px 16px",
          background: "#fff",
        }}
      >
        <input
          type="text"
          placeholder="Search product"
          style={{
            flex: 1,
            border: "none",
            fontSize: 14,
            color: "#454545",
            background: "transparent",
            minWidth: 0,
          }}
        />
        <img src={icSearch} alt="" style={{ width: 20, height: 20 }} />
      </div>

      {/* Right content */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <IconButton src={icMail} alt="Messages" />
        <IconButton src={icBell} alt="Notifications" />
        <div style={{ width: 1, height: 34, background: "#e7e7e7" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ position: "relative", width: 40, height: 36, flexShrink: 0 }}>
            <img
              src={seller?.ownerImage || seller?.shopLogo || fallbackLogo}
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
