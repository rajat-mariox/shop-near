import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import icBell from "../../assets/figma/ic-bell.svg";
import {
  getSellerNotifications,
  getSellerUnreadCount,
  markSellerNotificationRead,
  markAllSellerNotificationsRead,
} from "../../api/sellerApi";

const POLL_MS = 30000;

const timeAgo = (iso) => {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const TYPE_ICON = {
  new_order: "🛍️",
  payment_received: "💳",
  order_cancelled: "❌",
  new_review: "⭐",
  info: "🔔",
};

/**
 * Header bell: unread badge (30s polling) + dropdown list.
 * Item click -> read mark + Transaction page (order) ya Product page (review).
 */
const NotificationBell = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);

  const refreshUnread = async () => {
    try {
      const res = await getSellerUnreadCount();
      const d = res.data?.data || res.data;
      setUnread(d?.unread || 0);
    } catch {
      /* token na ho / network - chup */
    }
  };

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await getSellerNotifications({ page: 1, limit: 20 });
      const d = res.data?.data || res.data;
      setItems(d?.items || []);
      setUnread(d?.unread || 0);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUnread();
    const t = setInterval(refreshUnread, POLL_MS);
    return () => clearInterval(t);
  }, []);

  // Bahar click par band
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) loadList();
  };

  const openItem = async (n) => {
    if (!n.isRead) {
      setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      setUnread((u) => Math.max(0, u - 1));
      markSellerNotificationRead(n._id).catch(() => {});
    }
    setOpen(false);
    if (n.data?.productId) navigate("/product");
    else navigate("/transaction");
  };

  const readAll = async () => {
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    markAllSellerNotificationsRead().catch(() => {});
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        aria-label="Notifications"
        onClick={toggle}
        style={{
          background: open ? "#ffe9e6" : "#f6f6f6",
          border: "none",
          borderRadius: 9,
          padding: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          position: "relative",
        }}
      >
        <img src={icBell} alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 9,
              background: "#FF6051",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              boxSizing: "border-box",
            }}
          >
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 46,
            right: 0,
            width: 360,
            maxWidth: "90vw",
            background: "#fff",
            border: "1px solid #e7e7e7",
            borderRadius: 14,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            zIndex: 1000,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 15, color: "#2a2a2a" }}>Notifications</div>
            {unread > 0 && (
              <button
                onClick={readAll}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FF6051",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Mark all read
              </button>
            )}
          </div>
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {loading && items.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 13 }}>
                Loading...
              </div>
            ) : items.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "#888", fontSize: 13 }}>
                No notifications yet
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n._id}
                  onClick={() => openItem(n)}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: "12px 16px",
                    cursor: "pointer",
                    background: n.isRead ? "#fff" : "#fff6f4",
                    borderBottom: "1px solid #f5f5f5",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "#f6f6f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      flexShrink: 0,
                    }}
                  >
                    {TYPE_ICON[n.type] || TYPE_ICON.info}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.isRead ? 600 : 700,
                        color: "#2a2a2a",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                      }}
                    >
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.title}
                      </span>
                      <span style={{ fontSize: 11, color: "#aaa", fontWeight: 400, flexShrink: 0 }}>
                        {timeAgo(n.createdAt)}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: "#666", marginTop: 3, lineHeight: 1.4 }}>
                      {n.message}
                    </div>
                  </div>
                  {!n.isRead && (
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        background: "#FF6051",
                        alignSelf: "center",
                        flexShrink: 0,
                      }}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
