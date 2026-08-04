import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDeliveryAgents,
  createDeliveryAgent,
  updateDeliveryAgent,
  deleteDeliveryAgent,
} from "../../api/sellerApi";

import icCrumbArrow from "../../assets/figma/ic-crumb-arrow.svg";

const FONT = "'Plus Jakarta Sans', sans-serif";

const thStyle = {
  padding: 14,
  background: "#F6F6F6",
  borderBottom: "1px solid #E7E7E7",
  textAlign: "left",
  fontWeight: 500,
  fontSize: 14,
  color: "#454545",
  whiteSpace: "nowrap",
  lineHeight: 1.5,
};

const tdStyle = {
  padding: 12,
  borderBottom: "1px solid #E7E7E7",
  fontSize: 14,
  color: "#454545",
  verticalAlign: "middle",
  lineHeight: 1.5,
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #D1D1D1",
  fontSize: 14,
  marginBottom: 10,
  fontFamily: FONT,
  boxSizing: "border-box",
  outline: "none",
};

const primaryBtn = (enabled = true) => ({
  background: enabled ? "#FF6051" : "#ccc",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 20px",
  fontWeight: 600,
  cursor: enabled ? "pointer" : "default",
  fontFamily: FONT,
});

const outlineBtn = {
  background: "#fff",
  color: "#FF6051",
  border: "1px solid #FF6051",
  borderRadius: 8,
  padding: "8px 20px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
};

const chipBtn = (bg, color) => ({
  background: bg,
  color,
  border: "none",
  borderRadius: 6,
  padding: "4px 10px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: FONT,
  whiteSpace: "nowrap",
});

const EMPTY_FORM = { name: "", mobile: "", vehicleNumber: "", notes: "" };

const Agents = () => {
  const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // { type: "add" } | { type: "edit", agent } | { type: "delete", agent }
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDeliveryAgents();
      const d = res.data?.rData || res.data?.data || res.data;
      setAgents(d.agents || []);
    } catch (e) {
      console.error("Failed to fetch agents", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setModal({ type: "add" });
  };

  const openEdit = (agent) => {
    setForm({
      name: agent.name || "",
      mobile: agent.mobile || "",
      vehicleNumber: agent.vehicleNumber || "",
      notes: agent.notes || "",
    });
    setModal({ type: "edit", agent });
  };

  const formValid =
    form.name.trim().length > 0 && form.mobile.trim().length >= 10;

  const handleSave = async () => {
    if (!formValid || saving) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        vehicleNumber: form.vehicleNumber.trim(),
        notes: form.notes.trim(),
      };
      if (modal.type === "add") {
        await createDeliveryAgent(payload);
      } else {
        await updateDeliveryAgent(modal.agent._id, payload);
      }
      setModal(null);
      fetchAgents();
    } catch (e) {
      const msg = e.response?.data?.msg || e.response?.data?.message || "";
      alert(
        msg === "agent_mobile_already_exists"
          ? "Is mobile number ka agent pehle se added hai"
          : msg || "Failed to save agent"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (agent) => {
    try {
      await updateDeliveryAgent(agent._id, { isActive: !agent.isActive });
      fetchAgents();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to update agent");
    }
  };

  const handleDelete = async () => {
    if (!modal?.agent) return;
    try {
      await deleteDeliveryAgent(modal.agent._id);
      setModal(null);
      fetchAgents();
    } catch (e) {
      alert(e.response?.data?.msg || "Failed to delete agent");
    }
  };

  return (
    <div style={{ padding: 32, fontFamily: FONT }}>
      {/* Header + breadcrumbs */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#2A2A2A", lineHeight: 1.3 }}>
            Delivery Agents
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
              Delivery Agents
            </span>
          </div>
        </div>
        <button onClick={openAdd} style={primaryBtn()}>
          + Add Agent
        </button>
      </div>

      {/* Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          border: "1px solid #E7E7E7",
          padding: 24,
        }}
      >
        <p style={{ fontSize: 13, color: "#888", marginTop: 0, marginBottom: 20, lineHeight: 1.6 }}>
          Yahan apne shop ke delivery agents (servants) add karein. Order "Shipped"
          hone par aap order ko agent assign kar sakte hain — customer phir directly
          agent se call par connect hota hai, aapko manage nahi karna padta.
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
            Loading agents...
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, borderTopLeftRadius: 16, minWidth: 160 }}>Name</th>
                  <th style={{ ...thStyle, minWidth: 130 }}>Mobile</th>
                  <th style={{ ...thStyle, minWidth: 120 }}>Vehicle No.</th>
                  <th style={{ ...thStyle, minWidth: 150 }}>Notes</th>
                  <th style={{ ...thStyle, minWidth: 90 }}>Status</th>
                  <th style={{ ...thStyle, minWidth: 180, borderTopRightRadius: 16 }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{ ...tdStyle, textAlign: "center", padding: 32, color: "#B0B0B0" }}
                    >
                      Abhi koi agent added nahi hai — "+ Add Agent" se add karein
                    </td>
                  </tr>
                )}
                {agents.map((agent) => (
                  <tr key={agent._id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{agent.name}</td>
                    <td style={tdStyle}>{agent.mobile}</td>
                    <td style={tdStyle}>{agent.vehicleNumber || "-"}</td>
                    <td style={tdStyle}>{agent.notes || "-"}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 8px",
                          borderRadius: 10,
                          background: agent.isActive ? "#E6FF96" : "#FFD6D6",
                          color: agent.isActive ? "#00B809" : "#EB2B0B",
                          fontSize: 12,
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {agent.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <button
                          onClick={() => openEdit(agent)}
                          style={chipBtn("#DCD2FF", "#7F27FF")}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(agent)}
                          style={chipBtn(
                            agent.isActive ? "#FFF5C5" : "#E6FF96",
                            agent.isActive ? "#E27D00" : "#00B809"
                          )}
                        >
                          {agent.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", agent })}
                          style={chipBtn("#FEC6AA", "#EB2B0B")}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modal && (modal.type === "add" || modal.type === "edit") && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 380,
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 14, color: "#2A2A2A" }}>
              {modal.type === "add" ? "Add Delivery Agent" : "Edit Delivery Agent"}
            </h3>
            <input
              placeholder="Agent Name *"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Mobile Number *"
              value={form.mobile}
              maxLength={15}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobile: e.target.value.replace(/[^\d+]/g, "") }))
              }
              style={inputStyle}
            />
            <input
              placeholder="Vehicle Number (optional)"
              value={form.vehicleNumber}
              onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
              style={inputStyle}
            />
            <input
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              style={{ ...inputStyle, marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSave} disabled={!formValid || saving} style={primaryBtn(formValid && !saving)}>
                {saving ? "Saving..." : modal.type === "add" ? "Add Agent" : "Save Changes"}
              </button>
              <button onClick={() => setModal(null)} style={outlineBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {modal && modal.type === "delete" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 360,
              fontFamily: FONT,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0, marginBottom: 12, color: "#2A2A2A" }}>Delete Agent</h3>
            <p style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
              Kya aap <strong>{modal.agent.name}</strong> ({modal.agent.mobile}) ko
              delete karna chahte hain? Pehle se assigned orders par iski details
              save rahengi.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleDelete} style={primaryBtn()}>
                Yes, Delete
              </button>
              <button onClick={() => setModal(null)} style={outlineBtn}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agents;
