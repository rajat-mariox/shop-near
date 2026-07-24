import React, { useState, useEffect, useRef } from "react";
import {
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand as deleteBrandApi,
  toggleBrandStatus,
} from "../../api/adminApi";

const BrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [brandName, setBrandName] = useState("");
  const [offerText, setOfferText] = useState("");
  // App ke home screen par brand card ke border aur offer badge ka rang
  const [themeColor, setThemeColor] = useState("#B11116");
  const [isActive, setIsActive] = useState(true);
  const fileRef = useRef(null);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const res = await getBrands();
      const d = res.data?.data || res.data;
      setBrands(d.brands || d.data || d || []);
    } catch (err) {
      console.error("Failed to fetch brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setBrandName("");
    setOfferText("");
    setThemeColor("#B11116");
    setIsActive(true);
    setModal(true);
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setBrandName(b.brand || "");
    setOfferText(b.offerText || "");
    setThemeColor(b.themeColor || "#B11116");
    setIsActive(b.isActive !== false);
    setModal(true);
  };

  const handleSave = async () => {
    if (!brandName) return alert("Please enter a brand name");
    const fd = new FormData();
    fd.append("brand", brandName);
    fd.append("offerText", offerText);
    fd.append("themeColor", themeColor);
    fd.append("isActive", isActive);
    if (fileRef.current?.files?.[0]) {
      fd.append("image", fileRef.current.files[0]);
    }
    try {
      if (editing) {
        await updateBrand(editing, fd);
      } else {
        if (!fileRef.current?.files?.[0]) return alert("Please select a logo image");
        await createBrand(fd);
      }
      setModal(false);
      fetchBrands();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save brand");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this brand?")) return;
    try {
      await deleteBrandApi(id);
      fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await toggleBrandStatus(id);
      fetchBrands();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Brands
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Brand
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#888", gridColumn: "1 / -1" }}>
              Loading...
            </div>
          ) : brands.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#888", gridColumn: "1 / -1" }}>
              No brands found
            </div>
          ) : (
            brands.map((b) => (
              <div
                key={b._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {b.image && (
                  <img
                    src={b.image}
                    alt={b.brand}
                    style={{ width: "100%", height: 110, objectFit: "contain", background: "#fafafa" }}
                  />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {b.brand || "Untitled"}
                  </div>
                  {b.offerText ? (
                    <div style={{ fontSize: 12, color: "#E53935", fontWeight: 600, marginBottom: 6 }}>
                      {b.offerText}
                    </div>
                  ) : null}
                  <span className={`badge ${b.isActive ? "badge-green" : "badge-grey"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>
                      Edit
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleToggleStatus(b._id)}>
                      {b.isActive ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(b._id)}
                      style={{ color: "red" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 20 }}>
              {editing ? "Edit Brand" : "Add Brand"}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Brand Name</label>
                <input
                  className="form-input"
                  placeholder="e.g. Nike"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Offer Text</label>
                <input
                  className="form-input"
                  placeholder="e.g. 30% OFF"
                  value={offerText}
                  onChange={(e) => setOfferText(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Card Colour</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    style={{
                      width: 46,
                      height: 34,
                      padding: 0,
                      border: "1px solid #ddd",
                      borderRadius: 6,
                      background: "none",
                    }}
                  />
                  <input
                    className="form-input"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    placeholder="#B11116"
                  />
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
                  App me brand card ka border aur offer badge isi rang ka banta hai.
                </div>
              </div>
              <div>
                <label className="form-label">Logo Image</label>
                <input type="file" accept="image/*" ref={fileRef} />
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#444" }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
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

export default BrandList;
