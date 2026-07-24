import React, { useState } from "react";
import logo3 from "../../assets/Images/logo3.png";
const SecurityProfile = () => {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add password update logic here
    alert("Password updated!");
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
      }}
    >
      <div
        style={{
          fontSize: 22,
          fontWeight: 600,
          marginBottom: 15,
          color: "#454545",
        }}
      >
        Password
      </div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", gap: 24, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#323130" }}>
              Old Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showOld ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                style={inputStyle}
              />
              <span
                onClick={() => setShowOld((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#bbb",
                }}
                title={showOld ? "Hide" : "Show"}
              >
                {showOld ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#323130" }}>
              New Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showNew ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                style={inputStyle}
              />
              <span
                onClick={() => setShowNew((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#bbb",
                }}
                title={showNew ? "Hide" : "Show"}
              >
                {showNew ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 14, fontWeight: 700, color: "#323130" }}>
              Confirm Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                style={inputStyle}
              />
              <span
                onClick={() => setShowConfirm((v) => !v)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: 12,
                  cursor: "pointer",
                  fontSize: 18,
                  color: "#bbb",
                }}
                title={showConfirm ? "Hide" : "Show"}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginBottom: 16, marginTop: 8, }}>
          <div
            style={{
              color: "#454545",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              marginBottom:5
              
            }}
          >
            <img style={{marginRight:5}} src={logo3} alt="" />
            Minimum 8 characters.
          </div>
          <div
            style={{
              color: "#454545",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              marginBottom:5
            }}
          >
            <img style={{marginRight:5}} src={logo3} alt="" />
            Use combination of uppercase and lowercase letters.
          </div>
          <div
            style={{
              color: "#454545",
              fontSize: 14,
              display: "flex",
              alignItems: "center",
              marginBottom:5
            }}
          >
            <img style={{marginRight:5}} src={logo3} alt="" />
            Use of special characters (e.g. !, @, #, $, %)
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            style={{
              background: "#FF6051",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              marginRight: 12,
            }}
          >
            Update Password
          </button>
          <button
            type="button"
            style={{
              background: "#fff",
              color: "#FF6051",
              border: "none",
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #D1D1D1",
  borderRadius: 8,
  fontSize: 14,
  marginTop: 6,
  marginBottom: 2,
  outline: "none",
};

export default SecurityProfile;
