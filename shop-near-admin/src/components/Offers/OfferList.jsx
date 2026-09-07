import React, { useState, useEffect, useRef } from "react";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer as deleteOfferApi,
  toggleOfferStatus,
} from "../../api/adminApi";

const EMPTY = {
  title: "",
  description: "",
  offerType: "general",
  priceStartsAt: "",
  discountPercentage: "",
  discountAmount: "",
  bgColor: "#FFE9C6",
  // Khaali chhodne par card flat bgColor ka banta hai, warna gradient
  bgColorEnd: "",
  startDate: "",
  endDate: "",
  isActive: true,
  displayOnHome: true,
};

const OfferList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const fileRef = useRef(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await getOffers();
      const d = res.data?.data || res.data;
      setOffers(d.offers || d.data || d || []);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY);
    setModal(true);
  };

  const openEdit = (o) => {
    setEditing(o._id);
    setForm({
      title: o.title || "",
      description: o.description || "",
      offerType: o.offerType || "general",
      priceStartsAt: o.priceStartsAt ?? "",
      discountPercentage: o.discountPercentage ?? "",
      discountAmount: o.discountAmount ?? "",
      bgColor: o.bgColor || "#FFE9C6",
      bgColorEnd: o.bgColorEnd || "",
      startDate: o.startDate ? o.startDate.slice(0, 10) : "",
      endDate: o.endDate ? o.endDate.slice(0, 10) : "",
      isActive: o.isActive !== false,
      displayOnHome: o.displayOnHome !== false,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert("Title is required");
    if (form.priceStartsAt === "") return alert("Price starts at is required");
    if (!form.startDate || !form.endDate) return alert("Start and end date are required");
    if (!editing && !fileRef.current?.files?.[0]) return alert("Please select an image");

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("offerType", form.offerType);
    fd.append("priceStartsAt", form.priceStartsAt);
    if (form.discountPercentage !== "") fd.append("discountPercentage", form.discountPercentage);
    if (form.discountAmount !== "") fd.append("discountAmount", form.discountAmount);
    fd.append("bgColor", form.bgColor);
    fd.append("bgColorEnd", form.bgColorEnd || "");
    fd.append("startDate", form.startDate);
    fd.append("endDate", form.endDate);
    fd.append("isActive", form.isActive);
    fd.append("displayOnHome", form.displayOnHome);
    if (fileRef.current?.files?.[0]) {
      fd.append("image", fileRef.current.files[0]);
    }

    try {
      if (editing) {
        await updateOffer(editing, fd);
      } else {
        await createOffer(fd);
      }
      setModal(false);
      fetchOffers();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save offer");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this offer?")) return;
    try {
      await deleteOfferApi(id);
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleOfferStatus(id);
      fetchOffers();
    } catch (err) {
      console.error(err);
    }
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Offers
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Offer
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Starts At</th>
                <th>Home Page</th>
                <th>Status</th>
                <th>Validity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                    Loading...
                  </td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "#888" }}>
                    No offers found
                  </td>
                </tr>
              ) : (
                offers.map((o) => (
                  <tr key={o._id}>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td>{o.offerType}</td>
                    <td>₹{o.priceStartsAt}</td>
                    <td>{o.displayOnHome ? "Yes" : "No"}</td>
                    <td>
                      {/* App sirf wahi offers dikhata hai jo active hon AUR aaj validity ke andar hon */}
                      {(() => {
                        const now = new Date();
                        const expired = o.endDate && new Date(o.endDate) < now;
                        const scheduled = o.startDate && new Date(o.startDate) > now;
                        const label = !o.isActive
                          ? "Inactive"
                          : expired
                          ? "Expired"
                          : scheduled
                          ? "Scheduled"
                          : "Active";
                        const cls =
                          label === "Active" ? "badge-green" : label === "Scheduled" ? "badge-blue" : "badge-grey";
                        return (
                          <span className={`badge ${cls}`} title={expired ? "Validity khatam, app me nahi dikhega" : ""}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {o.startDate ? new Date(o.startDate).toLocaleDateString() : "—"} →{" "}
                      {o.endDate ? new Date(o.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td>
                      <div className="action-icons">
                        <label className="toggle" title={o.isActive ? "Deactivate" : "Activate"}>
                          <input
                            type="checkbox"
                            checked={o.isActive}
                            onChange={() => handleToggle(o._id)}
                          />
                          <span className="slider" />
                        </label>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => openEdit(o)}
                          style={{ marginRight: 6 }}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => handleDelete(o._id)}
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
              {editing ? "Edit Offer" : "Add Offer"}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Save up to 50%"
                  value={form.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Offer Type</label>
                  <select
                    className="form-input"
                    value={form.offerType}
                    onChange={(e) => set("offerType", e.target.value)}
                  >
                    <option value="general">General</option>
                    <option value="category">Category</option>
                    <option value="brand">Brand</option>
                    <option value="product">Product</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Price Starts At (₹) *</label>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="e.g. 150"
                    value={form.priceStartsAt}
                    onChange={(e) => set("priceStartsAt", e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Discount % (optional)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.discountPercentage}
                    onChange={(e) => set("discountPercentage", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Discount ₹ (optional)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.discountAmount}
                    onChange={(e) => set("discountAmount", e.target.value)}
                  />
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
              <div style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
                <div>
                  <label className="form-label">Card Color</label>
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => set("bgColor", e.target.value)}
                    style={{ width: 44, height: 42, padding: 2, border: "1px solid #b0b0b0", borderRadius: 8, cursor: "pointer" }}
                  />
                </div>
                <div>
                  <label className="form-label">Gradient End</label>
                  <input
                    type="color"
                    value={form.bgColorEnd || form.bgColor}
                    onChange={(e) => set("bgColorEnd", e.target.value)}
                    style={{ width: 44, height: 42, padding: 2, border: "1px solid #b0b0b0", borderRadius: 8, cursor: "pointer" }}
                  />
                  {form.bgColorEnd ? (
                    <div
                      onClick={() => set("bgColorEnd", "")}
                      style={{ fontSize: 11, color: "#2f80ed", cursor: "pointer", marginTop: 4 }}
                    >
                      Clear
                    </div>
                  ) : null}
                </div>
                <div
                  style={{
                    width: 90,
                    height: 42,
                    borderRadius: 8,
                    border: "1px solid #eee",
                    background: form.bgColorEnd
                      ? `linear-gradient(135deg, ${form.bgColor}, ${form.bgColorEnd})`
                      : form.bgColor,
                  }}
                  title="Card preview"
                />
                <div style={{ flex: 1 }}>
                  <label className="form-label">
                    Image {editing ? "(leave empty to keep current)" : "*"}
                  </label>
                  <input type="file" accept="image/*" ref={fileRef} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 20 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#444" }}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                  />
                  Active
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#444" }}>
                  <input
                    type="checkbox"
                    checked={form.displayOnHome}
                    onChange={(e) => set("displayOnHome", e.target.checked)}
                  />
                  Display on Home
                </label>
              </div>
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

export default OfferList;
