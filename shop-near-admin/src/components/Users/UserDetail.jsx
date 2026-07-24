import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserDetail, toggleUserStatus } from "../../api/adminApi";

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", marginBottom: 12 }}>
    <div style={{ width: 160, fontWeight: 500, color: "#888", fontSize: 14 }}>
      {label}
    </div>
    <div style={{ fontWeight: 600, color: "#333", fontSize: 14 }}>
      {value || "—"}
    </div>
  </div>
);

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await getUserDetail(id);
      setUser(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleToggle = async () => {
    await toggleUserStatus(id);
    fetchUser();
  };

  if (loading)
    return (
      <div className="page-content" style={{ textAlign: "center", padding: 60 }}>
        Loading...
      </div>
    );
  if (!user)
    return (
      <div className="page-content" style={{ textAlign: "center", paddingTop: 80 }}>
        <h2 style={{ color: "#888" }}>User not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("/users")}>
          Back to Users
        </button>
      </div>
    );

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        User Details
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 24 }}>
        <img
          src={
            user.profileImages ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || "U")}&background=FF6051&color=fff`
          }
          alt=""
          style={{ width: 72, height: 72, borderRadius: 12, objectFit: "cover" }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>{user.fullName || "Unnamed User"}</div>
          <div style={{ color: "#888", fontSize: 14 }}>
            {user.countryCode} {user.mobileNumber} {user.email ? `· ${user.email}` : ""}
          </div>
          <span className={`badge ${user.isActive ? "badge-green" : "badge-grey"}`} style={{ marginTop: 8, display: "inline-block" }}>
            {user.isActive ? "Active" : "Blocked"}
          </span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/users")}>
            ← Back
          </button>
          <button className="btn btn-outline btn-sm" onClick={handleToggle}>
            {user.isActive ? "Block" : "Unblock"}
          </button>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
          Profile Information
        </div>
        <InfoRow label="Gender" value={user.gender} />
        <InfoRow label="Date of Birth" value={user.dob} />
        <InfoRow
          label="Notifications"
          value={user.notificationAllowed ? "Enabled" : "Disabled"}
        />
        <InfoRow
          label="Joined"
          value={user.createdAt ? new Date(user.createdAt).toLocaleString() : ""}
        />
      </div>
    </div>
  );
};

export default UserDetail;
