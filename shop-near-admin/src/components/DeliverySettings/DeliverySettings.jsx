import React, { useState, useEffect } from "react";
import { getDeliverySettings, updateDeliverySettings } from "../../api/adminApi";

const DeliverySettings = () => {
  const [form, setForm] = useState({
    estimatedDeliveryTime: "",
    deliveryCharge: "",
    location: "",
    freeDeliveryAbove: "",
    maxDeliveryRadius: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getDeliverySettings();
      const d = res.data?.data || res.data;
      setForm({
        estimatedDeliveryTime: d.estimatedDeliveryTime ?? "",
        deliveryCharge: d.deliveryCharge ?? "",
        location: d.location ?? "",
        freeDeliveryAbove: d.freeDeliveryAbove ?? "",
        maxDeliveryRadius: d.maxDeliveryRadius ?? "",
      });
    } catch (err) {
      console.error("Failed to fetch delivery settings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const set = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await updateDeliverySettings({
        estimatedDeliveryTime: Number(form.estimatedDeliveryTime) || 0,
        deliveryCharge: Number(form.deliveryCharge) || 0,
        location: form.location,
        freeDeliveryAbove: Number(form.freeDeliveryAbove) || 0,
        maxDeliveryRadius: Number(form.maxDeliveryRadius) || 0,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save delivery settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content">
      <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 4, color: "#2A2A2A" }}>
        Delivery Settings
      </div>
      <div style={{ color: "#888", fontSize: 14, marginBottom: 20 }}>
        Controls the delivery time, charge, and service radius shown to customers.
      </div>

      <div className="card" style={{ maxWidth: 480 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 32, color: "#888" }}>Loading...</div>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div>
              <label className="form-label">Estimated Delivery Time (minutes)</label>
              <input
                className="form-input"
                type="number"
                value={form.estimatedDeliveryTime}
                onChange={(e) => set("estimatedDeliveryTime", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Delivery Charge (₹)</label>
              <input
                className="form-input"
                type="number"
                value={form.deliveryCharge}
                onChange={(e) => set("deliveryCharge", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Free Delivery Above (₹)</label>
              <input
                className="form-input"
                type="number"
                value={form.freeDeliveryAbove}
                onChange={(e) => set("freeDeliveryAbove", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Max Delivery Radius (km)</label>
              <input
                className="form-input"
                type="number"
                value={form.maxDeliveryRadius}
                onChange={(e) => set("maxDeliveryRadius", e.target.value)}
              />
            </div>
            <div>
              <label className="form-label">Service Location Label</label>
              <input
                className="form-input"
                placeholder="e.g. Home - Sultan Bhag, Erraga"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, alignItems: "center" }}>
              {saved && (
                <span style={{ color: "#09DE13", fontWeight: 600 }}>Saved!</span>
              )}
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverySettings;
