import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerOrders } from "../../api/sellerApi";
import { ShowAllCta } from "../common/FigmaIcon";
import mapImg from "../../assets/figma/map.png";
import pinGreen from "../../assets/figma/pin-red.svg";
import pinBlue from "../../assets/figma/pin-blue.svg";
import pinDark from "../../assets/figma/pin-dark.svg";

const DOT_COLORS = ["#23a149", "#1a71f6", "#184190"];
const PINS = [pinGreen, pinBlue, pinDark];
// Static pin spots matching the design's map markers
const PIN_POS = [
  { left: "18%", top: "82%" },
  { left: "43%", top: "88%" },
  { left: "36%", top: "34%" },
];

const CustomerGrowthMap = () => {
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSellerOrders({ limit: 100, page: 1 })
      .then((res) => {
        const d = res.data?.data || res.data;
        const orders = d.orders || d || [];
        const byCity = {};
        let total = 0;
        orders.forEach((o) => {
          const city = o.addressId?.city?.trim();
          if (!city) return;
          byCity[city] = (byCity[city] || 0) + 1;
          total += 1;
        });
        const top = Object.entries(byCity)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name, count]) => ({
            name,
            pct: total ? Math.round((count / total) * 100) : 0,
          }));
        setCities(top);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e7e7e7",
        borderRadius: 24,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 24,
        minWidth: 0,
        flex: "1 1 320px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3 }}>
            Customer Growth
            <br />
            {cities.length > 0 ? `${cities.length} ${cities.length === 1 ? "City" : "Cities"}` : "By City"}
          </div>
          <ShowAllCta onClick={() => navigate("/customer")} />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {cities.length === 0 ? (
            <span style={{ fontSize: 12, color: "#b0b0b0" }}>No customer data yet</span>
          ) : (
            cities.map((c, i) => (
              <span key={c.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: DOT_COLORS[i],
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 12, color: "#737373", lineHeight: 1.4 }}>
                  {c.name}{" "}
                  <b style={{ color: "#454545" }}>({c.pct}%)</b>
                </span>
              </span>
            ))
          )}
        </div>
      </div>
      <div
        style={{
          position: "relative",
          borderRadius: 16,
          overflow: "hidden",
          height: 249,
          flex: 1,
        }}
      >
        <img
          src={mapImg}
          alt="Customer locations map"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {cities.map((c, i) => (
          <img
            key={c.name}
            src={PINS[i]}
            alt=""
            title={c.name}
            style={{
              position: "absolute",
              width: 16,
              height: 16,
              ...PIN_POS[i],
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CustomerGrowthMap;
