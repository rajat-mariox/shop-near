import React, { useState, useEffect } from "react";
import { getCmsPage, saveCmsPage, CMS_TYPES } from "../../api/adminApi";

const CMS_LABELS = {
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
  about: "About Us",
  shipping: "Shipping Policy",
  cancellation: "Cancellation Policy",
  refund: "Refund Policy",
  contact: "Contact Us",
};

const CMS_FIELD_KEYS = {
  terms: "termsAndConditions",
  privacy: "privacyPolicy",
  about: "aboutUs",
  shipping: "shippingPolicy",
  cancellation: "cancellationPolicy",
  refund: "refundPolicy",
};

const CMSPage = () => {
  const [activeType, setActiveType] = useState("terms");
  const [content, setContent] = useState("");
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchPage = async (type) => {
    setLoading(true);
    setSaved(false);
    try {
      const res = await getCmsPage(type);
      const d = res.data?.data || res.data;
      if (type === "contact") {
        setContact({
          email: d?.email || "",
          phone: d?.phone || "",
          address: d?.address || "",
        });
      } else {
        setContent(d?.[CMS_FIELD_KEYS[type]] || "");
      }
    } catch (err) {
      setContent("");
      setContact({ email: "", phone: "", address: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(activeType);
  }, [activeType]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload =
        activeType === "contact"
          ? { contactUs: contact }
          : { [CMS_FIELD_KEYS[activeType]]: content };

      await saveCmsPage(activeType, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("CMS save error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 4,
          color: "#2A2A2A",
        }}
      >
        CMS Pages
      </div>

      <div style={{ display: "flex", gap: 24 }}>
        {/* Sidebar nav */}
        <div className="card" style={{ minWidth: 200, padding: 0 }}>
          {CMS_TYPES.map((type) => (
            <div
              key={type}
              onClick={() => setActiveType(type)}
              style={{
                padding: "14px 20px",
                cursor: "pointer",
                fontWeight: activeType === type ? 700 : 400,
                color: activeType === type ? "#FF6051" : "#555",
                background: activeType === type ? "#FFF0EF" : "transparent",
                borderLeft:
                  activeType === type
                    ? "3px solid #FF6051"
                    : "3px solid transparent",
                fontSize: 14,
              }}
            >
              {CMS_LABELS[type] || type}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>
            {CMS_LABELS[activeType]}
          </div>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
              Loading...
            </div>
          ) : (
            <>
              {activeType === "contact" ? (
                <div style={{ display: "grid", gap: 14, maxWidth: 420 }}>
                  <div>
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      value={contact.email}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, email: e.target.value }))
                      }
                      placeholder="support@shopnear.com"
                    />
                  </div>
                  <div>
                    <label className="form-label">Phone</label>
                    <input
                      className="form-input"
                      value={contact.phone}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, phone: e.target.value }))
                      }
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="form-label">Address</label>
                    <input
                      className="form-input"
                      value={contact.address}
                      onChange={(e) =>
                        setContact((c) => ({ ...c, address: e.target.value }))
                      }
                      placeholder="Office address"
                    />
                  </div>
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 300,
                    border: "1.5px solid #ececec",
                    borderRadius: 10,
                    padding: 16,
                    fontSize: 14,
                    fontFamily: "Inter, sans-serif",
                    resize: "vertical",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  placeholder={`Enter ${CMS_LABELS[activeType]} content...`}
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {saved && (
                  <span
                    style={{
                      color: "#09DE13",
                      fontWeight: 600,
                      alignSelf: "center",
                    }}
                  >
                    Saved!
                  </span>
                )}
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CMSPage;
