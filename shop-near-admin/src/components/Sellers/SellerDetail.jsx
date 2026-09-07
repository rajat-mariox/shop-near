import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getSellerDetail,
  approveSeller,
  rejectSeller,
  toggleSellerStatus,
} from "../../api/adminApi";

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

const SellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  const fetchSeller = async () => {
    try {
      const res = await getSellerDetail(id);
      setSeller(res.data?.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, [id]);

  if (loading)
    return (
      <div
        className="page-content"
        style={{ textAlign: "center", padding: 60 }}
      >
        Loading...
      </div>
    );
  if (!seller)
    return (
      <div
        className="page-content"
        style={{ textAlign: "center", paddingTop: 80 }}
      >
        <h2 style={{ color: "#888" }}>Seller not found</h2>
        <button
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate("/sellers")}
        >
          Back to Sellers
        </button>
      </div>
    );

  const statusLabel =
    seller.status === "approved"
      ? seller.isActive
        ? "Active"
        : "Inactive"
      : seller.status === "pending_approval" ||
          seller.status === "pending_profile"
        ? "Pending"
        : seller.status === "rejected"
          ? "Rejected"
          : seller.status;
  const badgeClass =
    statusLabel === "Active"
      ? "badge-green"
      : statusLabel === "Pending"
        ? "badge-orange"
        : statusLabel === "Rejected"
          ? "badge-red"
          : "badge-grey";

  const handleApprove = async () => {
    await approveSeller(id);
    fetchSeller();
  };
  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    setRejecting(true);
    try {
      await rejectSeller(id, rejectReason.trim());
      setRejectModal(false);
      setRejectReason("");
      fetchSeller();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to reject seller");
    } finally {
      setRejecting(false);
    }
  };
  const handleToggle = async () => {
    await toggleSellerStatus(id);
    fetchSeller();
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
        Seller Details
      </div>

      {/* Header Card */}
      <div
        className="card"
        style={{ display: "flex", alignItems: "center", gap: 24 }}
      >
        <img
          src={
            seller.ownerImage ||
            seller.shopLogo ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(seller.shopName || seller.fullName || "S")}&background=FF6051&color=fff`
          }
          alt=""
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            objectFit: "cover",
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 4,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 20 }}>
              {seller.shopName || seller.fullName}
            </span>
            <span className={`badge ${badgeClass}`}>{statusLabel}</span>
          </div>
          <div style={{ color: "#888", fontSize: 14 }}>
            {seller.email} &middot; {seller.mobile}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => navigate("/sellers")}
          >
            ← Back
          </button>
          {(seller.status === "pending_approval" ||
            seller.status === "pending_profile") && (
            <>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleApprove}
              >
                Approve
              </button>
              <button
                className="btn btn-outline btn-sm"
                style={{ color: "#e74c3c", borderColor: "#e74c3c" }}
                onClick={() => setRejectModal(true)}
              >
                Reject
              </button>
            </>
          )}
          {seller.status === "approved" && (
            <button className="btn btn-outline btn-sm" onClick={handleToggle}>
              {seller.isActive ? "Deactivate" : "Activate"}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
        {[
          { label: "Business Type", value: seller.businessType || "N/A" },
          { label: "City", value: seller.city || "N/A" },
          { label: "GST Verified", value: seller.gstVerified ? "Yes" : "No" },
          { label: "Status", value: statusLabel },
        ].map((s) => (
          <div
            key={s.label}
            className="card"
            style={{ flex: 1, textAlign: "center" }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 6,
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#FF6051" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Cards */}
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div className="card" style={{ flex: "1 1 380px" }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Business Information
          </div>
          <InfoRow label="Shop Name" value={seller.shopName} />
          <InfoRow label="Owner Name" value={seller.fullName} />
          <InfoRow label="Business Type" value={seller.businessType} />
          <InfoRow label="GST Number" value={seller.gstNumber} />
          <InfoRow label="Aadhaar" value={seller.aadhaarNumber} />
          <InfoRow label="PAN" value={seller.panNumber} />
          <InfoRow
            label="Address"
            value={`${seller.address || ""} ${seller.street || ""} ${seller.city || ""} ${seller.pincode || ""}`}
          />
          {/* Exact pin - isi se user app me nearby shops nikalti hain; na ho to approve nahi hoga */}
          <InfoRow
            label="Shop Location"
            value={
              seller.lat && seller.lng ? (
                <a
                  href={`https://www.google.com/maps?q=${seller.lat},${seller.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {Number(seller.lat).toFixed(5)}, {Number(seller.lng).toFixed(5)} (open map)
                </a>
              ) : (
                <span style={{ color: "#d97706" }}>Not set - cannot approve</span>
              )
            }
          />
          <InfoRow
            label="Shop Timing"
            value={
              seller.openingTime && seller.closingTime
                ? `${seller.openingTime} - ${seller.closingTime}`
                : "Not set"
            }
          />
          <InfoRow label="Weekly Off" value={seller.weeklyOff} />
          <InfoRow
            label="Joined"
            value={
              seller.createdAt
                ? new Date(seller.createdAt).toLocaleDateString()
                : ""
            }
          />
        </div>
        <div className="card" style={{ flex: "1 1 380px" }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Bank Details
          </div>
          <InfoRow label="Bank Name" value={seller.bankDetails?.bankName} />
          <InfoRow
            label="Account Holder"
            value={seller.bankDetails?.accountHolder}
          />
          <InfoRow
            label="Account No"
            value={seller.bankDetails?.accountNumber}
          />
          <InfoRow label="IFSC" value={seller.bankDetails?.ifsc} />
          <InfoRow label="UPI" value={seller.bankDetails?.upi} />
          <InfoRow
            label="UPI Verified"
            value={seller.bankDetails?.upiVerified ? "Yes" : "No"}
          />
          {seller.status === "rejected" && (
            <>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 16,
                  marginTop: 24,
                  marginBottom: 12,
                  color: "#e74c3c",
                }}
              >
                Rejection Info
              </div>
              <InfoRow label="Reason" value={seller.rejectedReason} />
              <InfoRow
                label="Rejected At"
                value={
                  seller.rejectedAt
                    ? new Date(seller.rejectedAt).toLocaleString()
                    : ""
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Shop Images */}
      {seller.shopImages && seller.shopImages.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 16 }}>
            Shop Images
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {seller.shopImages.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt="Shop"
                style={{
                  width: 120,
                  height: 90,
                  objectFit: "cover",
                  borderRadius: 10,
                  border: "1px solid #ececec",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              Reject Seller
            </div>
            <div>
              <label className="form-label">Reason for rejection</label>
              <textarea
                className="form-input"
                rows={4}
                autoFocus
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Explain why this seller application is being rejected"
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                className="btn btn-outline"
                onClick={() => {
                  setRejectModal(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                style={{ background: "#e74c3c" }}
                onClick={handleReject}
                disabled={rejecting || !rejectReason.trim()}
              >
                {rejecting ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetail;
