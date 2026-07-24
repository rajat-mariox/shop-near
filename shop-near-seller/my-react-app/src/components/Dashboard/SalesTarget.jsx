import React, { useEffect, useState } from "react";
import { getSellerOrderStats } from "../../api/sellerApi";

const fmtCurrency = (n) => `₹${(n || 0).toLocaleString("en-IN")}`;

const SalesTarget = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getSellerOrderStats()
      .then((res) => setStats(res.data?.data || res.data))
      .catch(() => {});
  }, []);

  const revenue = stats?.totalRevenue || stats?.revenue || 0;
  // Configurable monthly target – default 500000
  const target = stats?.salesTarget || 500000;
  const pct =
    target > 0 ? Math.min(Math.round((revenue / target) * 100), 100) : 0;

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e7e7e7",
        borderRadius: 24,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        width: "100%",
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3 }}>
        Sales Target
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ color: "#737373", fontSize: 12, lineHeight: 1.4 }}>In Progress</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3, marginTop: 4 }}>
            {fmtCurrency(revenue)}
          </div>
        </div>
        <div>
          <div style={{ color: "#737373", fontSize: 12, lineHeight: 1.4 }}>Sales Target</div>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3, marginTop: 4 }}>
            {fmtCurrency(target)}
          </div>
        </div>
      </div>
      {/* Progress bar with knob, as in the design's Grap graphic */}
      <div style={{ padding: "8px 0" }}>
        <div
          style={{
            position: "relative",
            height: 20,
            borderRadius: 30,
            background: "#e7e7e7",
          }}
        >
          <div
            style={{
              width: `${pct}%`,
              height: "100%",
              borderRadius: 10,
              background: "#FF6051",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: `calc(max(${pct}%, 36px) - 26px)`,
              top: -8,
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "#cccccc",
              minWidth: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SalesTarget;
