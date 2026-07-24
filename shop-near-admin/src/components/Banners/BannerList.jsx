import React, { useState, useEffect, useRef } from "react";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner as deleteBannerApi,
} from "../../api/adminApi";

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const fileRef = useRef(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await getBanners();
      const d = res.data?.data || res.data;
      setBanners(d.banners || d.data || d || []);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setTitle("");
    setLink("");
    setIsActive(true);
    setModal(true);
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setTitle(b.title || "");
    setLink(b.link || "");
    setIsActive(b.isActive !== false);
    setModal(true);
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("link", link);
    fd.append("isActive", isActive);
    if (fileRef.current?.files?.[0]) {
      fd.append("image", fileRef.current.files[0]);
    }
    try {
      if (editing) {
        await updateBanner(editing, fd);
      } else {
        if (!fileRef.current?.files?.[0]) return alert("Please select an image");
        await createBanner(fd);
      }
      setModal(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save banner");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await deleteBannerApi(id);
      fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Banners
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>
            + Add Banner
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 20,
          }}
        >
          {loading ? (
            <div style={{ textAlign: "center", padding: 32, color: "#888", gridColumn: "1 / -1" }}>
              Loading...
            </div>
          ) : banners.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#888", gridColumn: "1 / -1" }}>
              No banners found
            </div>
          ) : (
            banners.map((b) => (
              <div
                key={b._id}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{ width: "100%", height: 160, objectFit: "cover" }}
                  />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {b.title || "Untitled"}
                  </div>
                  <span className={`badge ${b.isActive ? "badge-green" : "badge-grey"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(b)}>
                      Edit
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
              {editing ? "Edit Banner" : "Add Banner"}
            </div>
            <div style={{ display: "grid", gap: 16 }}>
              <div>
                <label className="form-label">Banner Title</label>
                <input
                  className="form-input"
                  placeholder="e.g. Festive Fashion Specials"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Link (optional)</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Image</label>
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

export default BannerList;
