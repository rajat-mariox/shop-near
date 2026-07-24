import React from "react";
import shoeA from "../../assets/figma/shoe-a.svg";
import shoeB from "../../assets/figma/shoe-b.svg";

const IncreaseSalesCard = () => (
  <div
    style={{
      background: "#FF6051",
      borderRadius: 20,
      padding: 24,
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      position: "relative",
      overflow: "hidden",
      width: "100%",
      flex: 1,
    }}
  >
    <img
      src={shoeA}
      alt=""
      style={{
        position: "absolute",
        right: -46,
        top: -70,
        width: 167,
        height: 206,
        transform: "rotate(20.53deg)",
        pointerEvents: "none",
      }}
    />
    <img
      src={shoeB}
      alt=""
      style={{
        position: "absolute",
        left: -60,
        bottom: -130,
        width: 167,
        height: 206,
        transform: "rotate(20.53deg)",
        pointerEvents: "none",
        opacity: 0.6,
      }}
    />
    <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontWeight: 600, fontSize: 30, lineHeight: 1.3 }}>
        Increase your sales
      </div>
      <div style={{ fontSize: 14, lineHeight: 1.5, maxWidth: 420 }}>
        Discover the Proven Methods to Skyrocket Your Sales! Unleash the
        Potential of Your Business and Achieve Remarkable Growth. Whether
        you're a seasoned entrepreneur or just starting out
      </div>
    </div>
    <button
      style={{
        position: "relative",
        background: "#fff",
        color: "#FF6051",
        border: "none",
        borderRadius: 12,
        padding: "12px 24px",
        fontWeight: 700,
        fontSize: 14,
        alignSelf: "flex-start",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      Learn More
    </button>
  </div>
);

export default IncreaseSalesCard;
