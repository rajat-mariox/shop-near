import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const runSearch = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/sellers?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "12px 32px",
        background: "#fff",
        borderBottom: "1px solid #ececec",
      }}
    >
      <input
        className="search-input"
        placeholder="Search sellers..."
        style={{ width: 300 }}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && runSearch()}
      />
    </header>
  );
};

export default Header;
