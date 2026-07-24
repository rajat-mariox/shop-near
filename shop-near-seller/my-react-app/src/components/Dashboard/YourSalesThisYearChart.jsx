import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getSellerOrders } from "../../api/sellerApi";
import { ShowAllCta } from "../common/FigmaIcon";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LegendChip = ({ color, label }) => (
  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
    <span style={{ width: 14, height: 14, background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 12, color: "#737373", lineHeight: 1.4, whiteSpace: "nowrap" }}>
      {label}
    </span>
  </span>
);

const YourSalesThisYearChart = () => {
  const [chartData, setChartData] = useState([]);
  const [totals, setTotals] = useState({ revenue: 0, orders: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    getSellerOrders({ limit: 500 })
      .then((res) => {
        const d = res.data?.data || res.data;
        const orders = d.orders || d || [];
        const byMonth = {};
        MONTH_NAMES.forEach((m) => {
          byMonth[m] = { name: m, revenue: 0, orders: 0 };
        });
        let totalRev = 0;
        let totalOrd = 0;
        orders.forEach((o) => {
          const dt = new Date(o.createdAt);
          if (dt.getFullYear() === new Date().getFullYear()) {
            const m = MONTH_NAMES[dt.getMonth()];
            const amt = o.grandTotal || o.totalAmount || 0;
            byMonth[m].revenue += amt;
            byMonth[m].orders += 1;
            totalRev += amt;
            totalOrd += 1;
          }
        });
        setChartData(MONTH_NAMES.map((m) => byMonth[m]));
        setTotals({ revenue: totalRev, orders: totalOrd });
      })
      .catch(() => {
        setChartData(
          MONTH_NAMES.map((m) => ({ name: m, revenue: 0, orders: 0 })),
        );
      });
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
        width: "100%",
        flex: 1,
        minHeight: 380,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <span style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3 }}>
            Your Sales this year
          </span>
          <span style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <LegendChip color="#23a149" label="Revenue" />
            <LegendChip color="#1a71f6" label="Orders" />
          </span>
        </div>
        <ShowAllCta onClick={() => navigate("/sales-report")} />
      </div>

      {/* Chart with floating summary cards */}
      <div style={{ position: "relative", flex: 1, minHeight: 240 }}>
        <div
          style={{
            position: "absolute",
            left: "24%",
            top: 8,
            zIndex: 2,
            border: "1px dashed #1a71f6",
            borderRadius: 12,
            padding: 8,
            background: "#fff",
          }}
        >
          <div style={{ fontSize: 10, color: "#888", lineHeight: 1.4 }}>Total Orders</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#454545", lineHeight: 1.5 }}>
            {totals.orders.toLocaleString("en-IN")}
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 8,
            zIndex: 2,
            background: "#23a149",
            borderRadius: 12,
            padding: 8,
            color: "#fff",
          }}
        >
          <div style={{ fontSize: 10, lineHeight: 1.4 }}>Total Revenue</div>
          <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.5 }}>
            ₹{totals.revenue.toLocaleString("en-IN")}
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%" minHeight={240}>
          <LineChart data={chartData} margin={{ top: 70, right: 8, left: 8, bottom: 0 }}>
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#737373" }}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 13 }}
              formatter={(v, name) =>
                name === "revenue" ? `₹${v.toLocaleString("en-IN")}` : v
              }
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#23a149"
              strokeWidth={3}
              dot={false}
              name="revenue"
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="orders"
              stroke="#1a71f6"
              strokeWidth={3}
              dot={false}
              name="orders"
              strokeDasharray="8 6"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YourSalesThisYearChart;
