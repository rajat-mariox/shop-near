import React, { useState, useEffect, useRef } from "react";
import {
  getBanners,
  createBanner,
  updateBanner,
  deleteBanner as deleteBannerApi,
  getHomeHeaderBg,
  updateHomeHeaderBg,
  removeHomeHeaderBg,
} from "../../api/adminApi";

// App ke home header (delivery + search + banner area) ka background —
// upload/remove yahi se hota hai
const HeaderBgSection = () => {
  const [current, setCurrent] = useState({ url: "", type: "" });
  const [preview, setPreview] = useState(null);
  const [previewType, setPreviewType] = useState("");
  const [saving, setSaving] = useState(false);
  // App me background ke upar festive lights dikhani hain ya nahi
  const [showLights, setShowLights] = useState(true);
  const fileRef = useRef(null);

  const load = async () => {
    try {
      const res = await getHomeHeaderBg();
      const d = res.data?.data || {};
      setCurrent({ url: d.homeHeaderBg || "", type: d.homeHeaderBgType || "" });
      setPreview(d.homeHeaderBg || null);
      setPreviewType(d.homeHeaderBgType || "");
      setShowLights(d.homeHeaderLights !== false);
    } catch (err) {
      console.error("Failed to fetch header bg:", err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setPreviewType(file.type.startsWith("video/") ? "video" : "image");
    }
  };

  const handleSave = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return alert("Please select an image or video first");
    const fd = new FormData();
    fd.append("bgMedia", file);
    fd.append("showLights", showLights);
    setSaving(true);
    try {
      await updateHomeHeaderBg(fd);
      alert("Home header background updated");
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to update background");
    } finally {
      setSaving(false);
    }
  };

  // Lights toggle turant save (bina nayi file ke)
  const handleLightsToggle = async (checked) => {
    setShowLights(checked);
    try {
      const fd = new FormData();
      fd.append("showLights", checked);
      await updateHomeHeaderBg(fd);
    } catch (err) {
      console.error(err);
      setShowLights(!checked);
      alert(err?.response?.data?.message || "Failed to update lights setting");
    }
  };

  const handleRemove = async () => {
    if (!confirm("Remove background? App will show its default design.")) return;
    setSaving(true);
    try {
      await removeHomeHeaderBg();
      if (fileRef.current) fileRef.current.value = "";
      load();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to remove background");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
        Home Header Background
      </div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12 }}>
        App ke home screen par upar wale poore area (delivery, search aur banner
        ke peeche) ka background. Image ya video dono chalega.
        <br />
        <b>Recommended size: 1080 × 950 px</b> (ratio ~8:7). Video ho to 5-10
        sec, compressed.
      </div>
      <input
        type="file"
        accept="image/*,video/*"
        ref={fileRef}
        onChange={handleFileChange}
      />
      {preview &&
        (previewType === "video" ? (
          <video
            src={preview}
            controls
            muted
            loop
            style={{
              display: "block",
              width: 320,
              maxHeight: 280,
              background: "#f7f7f7",
              borderRadius: 8,
              marginTop: 10,
              border: "1px solid #eee",
            }}
          />
        ) : (
          <div style={{ position: "relative", width: 320, marginTop: 10 }}>
            <img
              src={preview}
              alt="Header background preview"
              style={{
                display: "block",
                width: 320,
                maxHeight: 280,
                objectFit: "contain",
                background: "#f7f7f7",
                borderRadius: 8,
                border: "1px solid #eee",
              }}
            />
            {showLights && (
              <img
                src="/header-lights.png"
                alt=""
                style={{
                  position: "absolute",
                  top: 6,
                  left: 0,
                  width: "100%",
                  pointerEvents: "none",
                }}
              />
            )}
          </div>
        ))}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginTop: 12,
          fontSize: 13,
          color: "#444",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={showLights}
          onChange={(e) => handleLightsToggle(e.target.checked)}
        />
        Background ke upar festive lights dikhao (app ke header me jo lights wali line hai)
      </label>
      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Background"}
        </button>
        {current.url && (
          <button
            className="btn btn-outline btn-sm"
            onClick={handleRemove}
            disabled={saving}
            style={{ color: "red" }}>
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

const BannerList = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [link, setLink] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [preview, setPreview] = useState(null);
  // Banner slide ka background (image ya video) — app me slide ke peeche dikhta hai
  const [bgPreview, setBgPreview] = useState(null);
  const [bgPreviewType, setBgPreviewType] = useState("");
  const fileRef = useRef(null);
  const bgFileRef = useRef(null);

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
    setSubtitle("");
    setLink("");
    setIsActive(true);
    setPreview(null);
    setBgPreview(null);
    setBgPreviewType("");
    setModal(true);
  };

  const openEdit = (b) => {
    setEditing(b._id);
    setTitle(b.title || "");
    setSubtitle(b.subtitle || "");
    setLink(b.link || "");
    setIsActive(b.isActive !== false);
    setPreview(b.image || b.imageUrl || null);
    setBgPreview(b.bgMedia || null);
    setBgPreviewType(b.bgMediaType || "");
    setModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleBgFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setBgPreview(URL.createObjectURL(file));
      setBgPreviewType(file.type.startsWith("video/") ? "video" : "image");
    }
  };

  const handleSave = async () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("subtitle", subtitle);
    fd.append("link", link);
    fd.append("isActive", isActive);
    if (fileRef.current?.files?.[0]) {
      fd.append("image", fileRef.current.files[0]);
    }
    if (bgFileRef.current?.files?.[0]) {
      fd.append("bgMedia", bgFileRef.current.files[0]);
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
      alert(err?.response?.data?.message || "Failed to delete banner");
    }
  };

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Banners
      </div>

      <HeaderBgSection />

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
                {(b.image || b.imageUrl) && (
                  <img
                    src={b.image || b.imageUrl}
                    alt={b.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "contain",
                      background: "#f7f7f7",
                    }}
                  />
                )}
                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>
                    {b.title || "Untitled"}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                    {b.subtitle || ""}
                  </div>
                  <span className={`badge ${b.isActive ? "badge-green" : "badge-grey"}`}>
                    {b.isActive ? "Active" : "Inactive"}
                  </span>
                  {b.bgMedia && (
                    <span className="badge badge-grey" style={{ marginLeft: 6 }}>
                      BG: {b.bgMediaType || "image"}
                    </span>
                  )}
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
                <label className="form-label">Subtitle (optional)</label>
                <input
                  className="form-input"
                  placeholder="e.g. Up to 40% Off on Gadgets"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
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
                <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                  Slide ke left side dikhta hai. Recommended: <b>420 × 370 px</b>,
                  transparent PNG best rahega.
                </div>
                <input type="file" accept="image/*" ref={fileRef} onChange={handleFileChange} />
                {preview && (
                  <img
                    src={preview}
                    alt="Banner preview"
                    style={{
                      width: "100%",
                      maxHeight: 300,
                      objectFit: "contain",
                      background: "#f7f7f7",
                      borderRadius: 8,
                      marginTop: 10,
                      border: "1px solid #eee",
                    }}
                  />
                )}
              </div>
              <div>
                <label className="form-label">
                  Background (image or video, optional)
                </label>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                  App me banner slide ke peeche full-size dikhega. Recommended:{" "}
                  <b>1080 × 330 px</b>. Video ho to 5-10 sec, compressed.
                </div>
                <input
                  type="file"
                  accept="image/*,video/*"
                  ref={bgFileRef}
                  onChange={handleBgFileChange}
                />
                {bgPreview &&
                  (bgPreviewType === "video" ? (
                    <video
                      src={bgPreview}
                      controls
                      muted
                      loop
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        background: "#f7f7f7",
                        borderRadius: 8,
                        marginTop: 10,
                        border: "1px solid #eee",
                      }}
                    />
                  ) : (
                    <img
                      src={bgPreview}
                      alt="Background preview"
                      style={{
                        width: "100%",
                        maxHeight: 300,
                        objectFit: "contain",
                        background: "#f7f7f7",
                        borderRadius: 8,
                        marginTop: 10,
                        border: "1px solid #eee",
                      }}
                    />
                  ))}
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
