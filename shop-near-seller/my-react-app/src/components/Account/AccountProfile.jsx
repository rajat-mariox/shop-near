import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getSellerProfile,
  updateSellerProfile,
  updateSellerBank,
  updateShopTiming,
} from "../../api/sellerApi";

import icEdit from "../../assets/figma/ic-edit.svg";
import icCrumbArrow from "../../assets/figma/ic-crumb-arrow.svg";
import icEyeOpen from "../../assets/figma/ic-eye.svg";
import icEyeHidden from "../../assets/figma/ic-eye-hidden.svg";
import icCheckCircle from "../../assets/figma/ic-check-circle.svg";

const FONT = "'Plus Jakarta Sans', sans-serif";

const labelStyle = {
  fontSize: 14,
  fontWeight: 700,
  color: "#323130",
  lineHeight: 1.5,
  display: "block",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  height: 52,
  padding: 16,
  border: "1.6px solid #D1D1D1",
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  fontFamily: FONT,
  color: "#454545",
  background: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const readonlyInputStyle = {
  ...inputStyle,
  background: "#E7E7E7",
};

const cardStyle = {
  background: "#fff",
  border: "1px solid #E7E7E7",
  borderRadius: 24,
  padding: 24,
  width: "100%",
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const cardTitleStyle = {
  fontSize: 22,
  fontWeight: 600,
  color: "#454545",
  lineHeight: 1.3,
};

const outlineBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  padding: "8px 8px 8px 12px",
  border: "1px solid #B0B0B0",
  borderRadius: 12,
  background: "#fff",
  fontFamily: FONT,
  fontSize: 12,
  fontWeight: 700,
  color: "#454545",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const primaryBtnStyle = {
  background: "#FF6051",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "12px 24px",
  fontWeight: 700,
  fontSize: 14,
  fontFamily: FONT,
  cursor: "pointer",
};

const linkBtnStyle = {
  background: "none",
  border: "none",
  color: "#FF6051",
  fontWeight: 700,
  fontSize: 14,
  fontFamily: FONT,
  textDecoration: "underline",
  cursor: "pointer",
};

const Field = ({ label, children, width }) => (
  <div style={width ? { flex: "1 1 260px", maxWidth: width, minWidth: 220 } : { flex: 1, minWidth: 200 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const TABS = [
  { key: "account", label: "Account" },
  { key: "security", label: "Security" },
  { key: "shop", label: "Shop Info" },
  { key: "bank", label: "Bank Details" },
];

const PWD_RULES = [
  { key: "length", label: "Minimum 8 characters.", test: (p) => p.length >= 8 },
  {
    key: "case",
    label: "Use combination of uppercase and lowercase letters.",
    test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p),
  },
  {
    key: "special",
    label: "Use of special characters (e.g., !, @, #, $, %)",
    test: (p) => /[^A-Za-z0-9]/.test(p),
  },
];

const AccountProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editContact, setEditContact] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    return TABS.some((t) => t.key === tab) ? tab : "account";
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  /* security tab */
  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [showPwd, setShowPwd] = useState({ oldPassword: false, newPassword: false, confirmPassword: false });

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    shopName: "",
    shopDescription: "",
    offerText: "",
    businessType: "",
    address: "",
    street: "",
    city: "",
    pincode: "",
    gstNumber: "",
    aadhaarNumber: "",
    panNumber: "",
    openingTime: "",
    closingTime: "",
    weeklyOff: "",
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
    upi: "",
  });

  const fillForm = (s) => ({
    fullName: s.fullName || "",
    email: s.email || "",
    mobile: s.mobile || "",
    shopName: s.shopName || "",
    shopDescription: s.shopDescription || "",
    offerText: s.offerText || "",
    businessType: s.businessType || "",
    address: s.address || "",
    street: s.street || "",
    city: s.city || "",
    pincode: s.pincode || "",
    gstNumber: s.gstNumber || "",
    aadhaarNumber: s.aadhaarNumber || "",
    panNumber: s.panNumber || "",
    openingTime: s.openingTime || "",
    closingTime: s.closingTime || "",
    weeklyOff: s.weeklyOff || "",
    accountHolder: s.bankDetails?.accountHolder || "",
    accountNumber: s.bankDetails?.accountNumber || "",
    ifsc: s.bankDetails?.ifsc || "",
    bankName: s.bankDetails?.bankName || "",
    upi: s.bankDetails?.upi || "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await getSellerProfile();
        const s = res.data?.data || res.data?.rData || res.data;
        setProfile(s);
        setAvatarPreview(s.shopLogo || s.ownerImage || "");
        setForm(fillForm(s));
      } catch (e) {
        console.error("Failed to load profile", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    if (profile) {
      setForm(fillForm(profile));
      setAvatarFile(null);
      setAvatarPreview(profile.shopLogo || profile.ownerImage || "");
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
      setAvatarPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append("fullName", form.fullName);
      fd.append("email", form.email);
      fd.append("shopName", form.shopName);
      fd.append("shopDescription", form.shopDescription);
      fd.append("offerText", form.offerText);
      fd.append("businessType", form.businessType);
      fd.append("address", form.address);
      fd.append("street", form.street);
      fd.append("city", form.city);
      fd.append("pincode", form.pincode);
      if (avatarFile) fd.append("shopLogo", avatarFile);
      await updateSellerProfile(fd);
      alert("Profile updated successfully!");
      setEditContact(false);
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleBankUpdate = async () => {
    try {
      setSaving(true);
      await updateSellerBank({
        accountHolder: form.accountHolder,
        accountNumber: form.accountNumber,
        ifsc: form.ifsc,
        bankName: form.bankName,
        upi: form.upi,
      });
      alert("Bank details updated!");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to update bank details");
    } finally {
      setSaving(false);
    }
  };

  const handleTimingUpdate = async () => {
    try {
      setSaving(true);
      await updateShopTiming({
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        weeklyOff: form.weeklyOff,
      });
      alert("Shop timing updated!");
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to update timing");
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPwd((prev) => ({ ...prev, [name]: value }));
  };

  const resetPwd = () => {
    setPwd({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowPwd({ oldPassword: false, newPassword: false, confirmPassword: false });
  };

  const handlePasswordUpdate = () => {
    if (!pwd.oldPassword || !pwd.newPassword || !pwd.confirmPassword) {
      alert("Please fill in all password fields");
      return;
    }
    if (pwd.newPassword !== pwd.confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }
    if (!PWD_RULES.every((r) => r.test(pwd.newPassword))) {
      alert("New password does not meet the requirements below");
      return;
    }
    alert(
      "Password login is not enabled for seller accounts yet — login works via mobile OTP. This will start working once the backend adds a seller password API."
    );
  };

  if (loading)
    return (
      <div style={{ padding: 32, color: "#888", textAlign: "center", fontFamily: FONT }}>
        Loading profile...
      </div>
    );

  return (
    <div style={{ padding: 32, fontFamily: FONT }}>
      {/* Title + breadcrumbs */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.3 }}>
          Account &amp; Settings
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
          <span
            style={{ fontSize: 14, color: "#888", cursor: "pointer" }}
            onClick={() => navigate("/")}
          >
            Dashboard
          </span>
          <img src={icCrumbArrow} alt="" style={{ width: 7, height: 11 }} />
          <span style={{ fontSize: 14, color: "#FF6051", fontWeight: 700 }}>
            Profile
          </span>
        </div>
      </div>

      {/* Tab strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "#fff",
          border: "1px solid #D1D1D1",
          borderRadius: 14,
          marginBottom: 22,
        }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 6px",
                borderRadius: 8,
                background: active ? "#FFF2F0" : "transparent",
                color: active ? "#FF6051" : "#737373",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                lineHeight: 1.5,
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </div>
          );
        })}
      </div>

      {/* ---- Account Tab ---- */}
      {activeTab === "account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Profile Information */}
          <div style={cardStyle}>
            <div style={cardTitleStyle}>Profile Information</div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="avatar"
                  style={{ width: 73, height: 68, borderRadius: 12, objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    width: 73,
                    height: 68,
                    borderRadius: 12,
                    background: "#FF6051",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {(form.fullName || "S").charAt(0).toUpperCase()}
                </div>
              )}
              <label style={{ cursor: "pointer" }}>
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
                <span style={outlineBtnStyle}>
                  Change Pictures
                  <img src={icEdit} alt="" style={{ width: 20, height: 20 }} />
                </span>
              </label>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Field label="Full Name">
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Business Type">
                  <input
                    type="text"
                    name="businessType"
                    value={form.businessType}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <Field label="GST Number" width={339}>
                  <input
                    type="text"
                    name="gstNumber"
                    value={form.gstNumber}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </Field>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button
                type="button"
                onClick={handleProfileUpdate}
                disabled={saving}
                style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
              >
                {saving ? "Saving..." : "Update"}
              </button>
              <button type="button" onClick={resetForm} style={linkBtnStyle}>
                Cancel
              </button>
            </div>
          </div>

          {/* Contact Detail */}
          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div style={cardTitleStyle}>Contact Detail</div>
              <button
                type="button"
                onClick={() => setEditContact((v) => !v)}
                style={{
                  ...outlineBtnStyle,
                  background: editContact ? "#FFF2F0" : "#fff",
                  borderColor: editContact ? "#FF6051" : "#B0B0B0",
                  color: editContact ? "#FF6051" : "#454545",
                }}
              >
                Edit
                <img src={icEdit} alt="" style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Phone Number" width={339}>
                <input
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  style={readonlyInputStyle}
                  disabled
                />
              </Field>
              <Field label="Address" width={339}>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  style={editContact ? inputStyle : readonlyInputStyle}
                  disabled={!editContact}
                />
              </Field>
              <Field label="Street" width={339}>
                <input
                  type="text"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  style={editContact ? inputStyle : readonlyInputStyle}
                  disabled={!editContact}
                />
              </Field>
              <Field label="City" width={339}>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  style={editContact ? inputStyle : readonlyInputStyle}
                  disabled={!editContact}
                />
              </Field>
              <Field label="Pincode" width={339}>
                <input
                  type="text"
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  style={editContact ? inputStyle : readonlyInputStyle}
                  disabled={!editContact}
                />
              </Field>
            </div>

            {editContact && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  type="button"
                  onClick={handleProfileUpdate}
                  disabled={saving}
                  style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
                >
                  {saving ? "Saving..." : "Update"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setEditContact(false);
                  }}
                  style={linkBtnStyle}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---- Security Tab ---- */}
      {activeTab === "security" && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Password</div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", width: "100%" }}>
            {[
              { name: "oldPassword", label: "Old Password" },
              { name: "newPassword", label: "New Password" },
              { name: "confirmPassword", label: "Confirm Password" },
            ].map((f) => (
              <Field key={f.name} label={f.label} width={339}>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={showPwd[f.name] ? "text" : "password"}
                    name={f.name}
                    value={pwd[f.name]}
                    onChange={handlePwdChange}
                    placeholder="••••••••••••••"
                    style={{ ...inputStyle, paddingRight: 48 }}
                  />
                  <img
                    src={showPwd[f.name] ? icEyeOpen : icEyeHidden}
                    alt={showPwd[f.name] ? "Hide password" : "Show password"}
                    onClick={() =>
                      setShowPwd((prev) => ({ ...prev, [f.name]: !prev[f.name] }))
                    }
                    style={{
                      width: 20,
                      height: 20,
                      position: "absolute",
                      right: 16,
                      top: "50%",
                      transform: "translateY(-50%)",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </Field>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PWD_RULES.map((rule) => {
              const ok = rule.test(pwd.newPassword);
              return (
                <div key={rule.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <img
                    src={icCheckCircle}
                    alt=""
                    style={{
                      width: 20,
                      height: 20,
                      filter: ok ? "none" : "grayscale(1)",
                      opacity: ok ? 1 : 0.45,
                    }}
                  />
                  <span style={{ fontSize: 14, color: "#454545", lineHeight: 1.5 }}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button type="button" onClick={handlePasswordUpdate} style={primaryBtnStyle}>
              Update Password
            </button>
            <button type="button" onClick={resetPwd} style={linkBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---- Shop Info Tab ---- */}
      {activeTab === "shop" && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Shop &amp; Timing</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Shop Name">
                <input
                  type="text"
                  name="shopName"
                  value={form.shopName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <div style={{ flex: 2, minWidth: 280 }}>
                <label style={labelStyle}>Shop Description</label>
                <input
                  type="text"
                  name="shopDescription"
                  value={form.shopDescription}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Offer Text" width={480}>
                <input
                  type="text"
                  name="offerText"
                  value={form.offerText}
                  onChange={handleChange}
                  placeholder="e.g. Flat ₹150 off above ₹150"
                  style={inputStyle}
                />
                <div style={{ fontSize: 12, color: "#888", marginTop: 6, lineHeight: 1.4 }}>
                  App ke home screen par aapke shop card me hara offer chip banta hai.
                  Khaali chhodne par chip nahi dikhega.
                </div>
              </Field>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Opening Time">
                <input
                  type="text"
                  name="openingTime"
                  value={form.openingTime}
                  onChange={handleChange}
                  placeholder="e.g. 09:00 AM"
                  style={inputStyle}
                />
              </Field>
              <Field label="Closing Time">
                <input
                  type="text"
                  name="closingTime"
                  value={form.closingTime}
                  onChange={handleChange}
                  placeholder="e.g. 09:00 PM"
                  style={inputStyle}
                />
              </Field>
              <Field label="Weekly Off">
                <input
                  type="text"
                  name="weeklyOff"
                  value={form.weeklyOff}
                  onChange={handleChange}
                  placeholder="e.g. Sunday"
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={handleTimingUpdate}
              disabled={saving}
              style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
            >
              {saving ? "Saving..." : "Update"}
            </button>
            <button type="button" onClick={resetForm} style={linkBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ---- Bank Tab ---- */}
      {activeTab === "bank" && (
        <div style={cardStyle}>
          <div style={cardTitleStyle}>Bank Details</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="Account Holder">
                <input
                  type="text"
                  name="accountHolder"
                  value={form.accountHolder}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="Account Number">
                <input
                  type="text"
                  name="accountNumber"
                  value={form.accountNumber}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Field label="IFSC Code">
                <input
                  type="text"
                  name="ifsc"
                  value={form.ifsc}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="Bank Name">
                <input
                  type="text"
                  name="bankName"
                  value={form.bankName}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
              <Field label="UPI ID">
                <input
                  type="text"
                  name="upi"
                  value={form.upi}
                  onChange={handleChange}
                  style={inputStyle}
                />
              </Field>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              type="button"
              onClick={handleBankUpdate}
              disabled={saving}
              style={{ ...primaryBtnStyle, opacity: saving ? 0.6 : 1, cursor: saving ? "default" : "pointer" }}
            >
              {saving ? "Saving..." : "Update"}
            </button>
            <button type="button" onClick={resetForm} style={linkBtnStyle}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfile;
