import React, { useEffect, useState } from "react";
import { getSellerOrderStats, getSellerProducts } from "../../api/sellerApi";
import { ArrowUpRight } from "../common/FigmaIcon";
import trendUpWhite from "../../assets/figma/trend-up-white.svg";
import trendUpGreen from "../../assets/figma/trend-up-green.svg";

const fmt = (n) => {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const StatCard = ({ title, value, sub, subLabel, primary = false }) => (
  <div
    style={{
      background: primary ? "#FF6051" : "#fff",
      border: "1px solid #e7e7e7",
      borderRadius: 20,
      padding: primary ? 16 : "16px 20px",
      height: 151,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minWidth: 0,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
      <span
        style={{
          fontWeight: 600,
          fontSize: 16,
          lineHeight: 1.3,
          color: primary ? "#fff" : "#454545",
          whiteSpace: "nowrap",
        }}
      >
        {title}
      </span>
      <ArrowUpRight white={primary} />
    </div>
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
      <span
        style={{
          fontWeight: 600,
          fontSize: 30,
          lineHeight: 1.3,
          color: primary ? "#fff" : "#FF6051",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {value}
      </span>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <img
            src={primary ? trendUpWhite : trendUpGreen}
            alt=""
            style={{ width: 16, height: 8 }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: 12,
              lineHeight: 1.4,
              color: primary ? "#fff" : "#04910c",
            }}
          >
            {sub}
          </span>
        </span>
        <span
          style={{
            fontSize: 12,
            lineHeight: 1.4,
            color: primary ? "#f6f6f6" : "#737373",
          }}
        >
          {subLabel}
        </span>
      </div>
    </div>
  </div>
);

const StatsCards = () => {
  const [stats, setStats] = useState(null);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    getSellerOrderStats()
      .then((res) => setStats(res.data?.data || res.data))
      .catch(() => {});
    getSellerProducts({ page: 1, limit: 1 })
      .then((res) => {
        const d = res.data?.data || res.data;
        setProductCount(
          d.total || d.totalProducts || (d.products || []).length || 0,
        );
      })
      .catch(() => {});
  }, []);

  const revenue = stats?.totalRevenue || stats?.revenue || 0;
  const totalOrders = stats?.totalOrders || 0;
  const customers = stats?.uniqueCustomers || stats?.totalCustomers || 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 16,
        width: "100%",
      }}
    >
      <StatCard
        title="Total Revenue"
        value={fmt(revenue)}
        sub="All-time"
        subLabel="Total earnings"
        primary
      />
      <StatCard
        title="Total Customer"
        value={customers.toLocaleString("en-IN")}
        sub="Unique"
        subLabel="From all orders"
      />
      <StatCard
        title="Total Transactions"
        value={totalOrders.toLocaleString("en-IN")}
        sub="All orders"
        subLabel="Lifetime count"
      />
      <StatCard
        title="Total Product"
        value={productCount.toLocaleString("en-IN")}
        sub="In store"
        subLabel="Listed products"
      />
    </div>
  );
};

export default StatsCards;
