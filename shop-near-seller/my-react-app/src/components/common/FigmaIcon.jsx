import React from "react";
import arrowUrA from "../../assets/figma/arrow-ur-a.svg";
import arrowUrB from "../../assets/figma/arrow-ur-b.svg";
import arrowUrWhiteA from "../../assets/figma/arrow-ur-white-a.svg";
import arrowUrWhiteB from "../../assets/figma/arrow-ur-white-b.svg";

// The design's icon/arrow-up-right is two stacked vectors inside a 24px box.
export const ArrowUpRight = ({ white = false, size = 24 }) => {
  const inset = Math.round(size * 0.29);
  const [a, b] = white ? [arrowUrWhiteA, arrowUrWhiteB] : [arrowUrA, arrowUrB];
  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-block",
        flexShrink: 0,
      }}
    >
      <img alt="" src={a} style={{ position: "absolute", inset, width: size - inset * 2, height: size - inset * 2 }} />
      <img alt="" src={b} style={{ position: "absolute", inset, width: size - inset * 2, height: size - inset * 2 }} />
    </span>
  );
};

// "Show All ↗" call-to-action used on every dashboard card header.
export const ShowAllCta = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      background: "none",
      border: "none",
      padding: 0,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      fontWeight: 600,
      fontSize: 12,
      color: "#3d3d3d",
    }}
  >
    Show All
    <ArrowUpRight />
  </button>
);

