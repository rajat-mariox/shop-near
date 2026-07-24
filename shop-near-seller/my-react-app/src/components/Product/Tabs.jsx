import React, { useState } from "react";

const tabContainerStyle = {
  display: "flex",
  background: "#FFFFFF",
  borderRadius: "8px",
  border: "1px solid #D1D1D1",
  padding: "6px",
  width: "100%",
  justifyContent: "space-between",
  alignItems: "center",
  boxSizing: "border-box",
};

const tabStyle = {
  flex: 1,
  textAlign: "center",
  padding: "8px 0",
  borderRadius: "8px",
  fontWeight: 700,
  fontFamily: "inherit",
  fontSize: "14px",
  cursor: "pointer",
  transition: "background 0.2s, color 0.2s",
  background: "none",
  color: "#444",
  border: "none",
};

const activeTabStyle = {
  ...tabStyle,
  background: "#FFF3F0",
  color: "#FF4D29",
};

export default function Tabs({ tabs, initial = 0, onChange }) {
  const [active, setActive] = useState(initial);

  const handleTabClick = (idx) => {
    setActive(idx);
    if (onChange) onChange(idx);
  };

  return (
    <div style={tabContainerStyle}>
      {tabs.map((tab, idx) => (
        <button
          key={tab.label}
          style={active === idx ? activeTabStyle : tabStyle}
          onClick={() => handleTabClick(idx)}
        >
          {tab.label} ({tab.count})
        </button>
      ))}
    </div>
  );
}