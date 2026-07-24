import React, { useState, useEffect, useRef } from "react";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon as deleteCouponApi,
} from "../../api/adminApi";

// Field naam CouponCode model se match karte hain (minOrderValue / maxDiscountAmount)
const EMPTY = {
  title: "",
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderValue: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  isActive: true,
};

const CouponList = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [preview, setPreview] = useState("");
  const fileRef = useRef(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await getCoupons();
      const d = res.data?.data || res.data;
      setCoupons(d.coupons || d.data || d || []);
    } catch (err) {
      console.error("Failed to fetch coupons:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
    setModal(true);
  };

  const openEdit = (c) => {
    setEditing(c._id);
    setForm({
      title: c.title || "",
      code: c.code || "",
      description: c.description || "",
      discountType: c.discountType || "percentage",
      discountValue: c.discountValue || 0,
      minOrderValue: c.minOrderValue || 0,
      maxDiscountAmount: c.maxDiscountAmount || 0,
      startDate: c.startDate ? c.startDate.slice(0, 10) : "",
      endDate: c.endDate ? c.endDate.slice(0, 10) : "",
      isActive: c.isActive !== false,
    });
    setPreview(c.image || "");
    if (fileRef.current) fileRef.current.value = "";
    setModal(true);
  };

  const handlePickImage = (e) => {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSave = async () => {
    if (!form.code) return alert("Code is required");
    try {
      // Image ek file hai, isliye poora form multipart me bhejte hain
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ""));
      const file = fileRef.current?.files?.[0];
      if (file) fd.append("image", file);

      if (editing) {
        await updateCoupon(editing, fd);
      } else {
        await createCoupon(fd);
      }
      setModal(false);
      fetchCoupons();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save coupon");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await deleteCouponApi(id);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Coupons
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Coupon
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Type</th>
                <th>Value</th>
                <th>Min Order</th>
                <th>Max Discount</th>
                <th>Image</th>
                <th>Status</th>
                <th>Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                    Loading...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c._id}>
                    <td style={{ fontWeight: 600 }}>{c.code}</td>
                    <td>{c.discountType}</td>
                    <td>
                      {c.discountType === "percentage"
                        ? `${c.discountValue}%`
                        : `₹${c.discountValue}`}
                    </td>
                    <td>₹{c.minOrderValue || 0}</td>
                    <td>₹{c.maxDiscountAmount || "—"}</td>
                    <td>
                      {c.image ? (
                        <img
                          src={c.image}
                          alt=""
                          style={{ width: 64, height: 30, objectFit: "cover", borderRadius: 4 }}
                        />
                      ) : (
                        <span style={{ color: "#bbb", fontSize: 12 }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${c.isActive ? "badge-green" : "badge-grey"}`}>
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {c.startDate ? new Date(c.startDate).toLocaleDateString() : "—"} →{" "}
                      {c.endDate ? new Date(c.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="action-icons">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(c)}
                          style={{ marginRight: 6 }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDelete(c._id)}
                          style={{ color: "red" }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              {editing ? "Edit Coupon" : "Add Coupon"}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Get 20% instant Discount"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Coupon Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. SUMMER50"
                  value={form.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <input
                  className="form-input"
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Discount Type</label>
                  <select
                    className="form-input"
                    value={form.discountType}
                    onChange={(e) => set("discountType", e.target.value)}
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Discount Value</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.discountValue}
                    onChange={(e) => set("discountValue", Number(e.target.value))}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Min Order Amount</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.minOrderValue}
                    onChange={(e) => set("minOrderValue", Number(e.target.value))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Max Discount Amount</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.maxDiscountAmount}
                    onChange={(e) => set("maxDiscountAmount", Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="form-label">
                  Promo Image {editing ? "(choose a file only to replace it)" : ""}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {preview ? (
                    <img
                      src={preview}
                      alt=""
                      style={{
                        width: 110,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #eee",
                      }}
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handlePickImage}
                  />
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  App ke home screen par "Promo Codes" card me yahi image dikhti hai.
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Start Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.startDate}
                    onChange={(e) => set("startDate", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">End Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => set("endDate", e.target.value)}
                  />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#444" }}>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                />
                Active
              </label>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button className="btn btn-outline" onClick={() => setModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponList;
