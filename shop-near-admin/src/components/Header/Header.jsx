import React from "react";
import useAuthStore from "../../store/authStore";
import NotificationBell from "../Sidebar/NotificationBell";

/**
 * Slim top header (seller panel jaisa): right side me notification bell aur
 * admin ka naam/avatar. Global search jaan-boojh kar nahi hai.
 */
const Header = () => {
  const { admin } = useAuthStore();
  const name = admin?.name || "Admin";
  const email = admin?.email || "admin@shopnear.com";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 16,
        padding: "14px 32px",
        background: "#fff",
        borderBottom: "1px solid #ececec",
      }}
    >
      <NotificationBell />
      <div style={{ width: 1, height: 30, background: "#ececec" }} />
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
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#222" }}>{name}</div>
          <div style={{ fontSize: 12, color: "#888" }}>Admin</div>
        </div>
      </div>
    </header>
  );
};

export default Header;
