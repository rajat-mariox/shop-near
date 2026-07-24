import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSellerProducts } from "../../api/sellerApi";
import { ShowAllCta } from "../common/FigmaIcon";
import caretUp from "../../assets/figma/caret-up.svg";
import caretDown from "../../assets/figma/caret-down.svg";
import icFilter from "../../assets/figma/ic-filter.svg";

const Sorter = () => (
  <span
    style={{
      display: "inline-flex",
      flexDirection: "column",
      gap: 2,
      marginLeft: 4,
      verticalAlign: "middle",
    }}
  >
    <img src={caretUp} alt="" style={{ width: 9, height: 5 }} />
    <img src={caretDown} alt="" style={{ width: 9, height: 5 }} />
  </span>
);

const thStyle = {
  padding: 12,
  fontWeight: 700,
  fontSize: 12,
  color: "#2a2a2a",
  textAlign: "left",
  lineHeight: 1.4,
  whiteSpace: "nowrap",
};

const ProductPopularTable = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getSellerProducts({ limit: 5, sortBy: "rating", order: "desc" })
      .then((res) => {
        const d = res.data?.data || res.data;
        setProducts(d.products || d || []);
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
        flex: "1.8 1 480px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3 }}>
          Product Popular
        </div>
        <ShowAllCta onClick={() => navigate("/product")} />
      </div>

      <div
        className="table-wrap"
        style={{ border: "1px solid #e7e7e7", borderRadius: 16, overflow: "hidden" }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
          <thead>
            <tr style={{ background: "#f6f6f6", borderBottom: "1px solid #e7e7e7" }}>
              <th style={{ ...thStyle, width: "40%" }}>
                Product <Sorter />
              </th>
              <th style={thStyle}>
                Price <Sorter />
              </th>
              <th style={thStyle}>
                Stock <img src={icFilter} alt="" style={{ width: 10, height: 9, marginLeft: 4 }} />
              </th>
              <th style={thStyle}>
                Status <img src={icFilter} alt="" style={{ width: 10, height: 9, marginLeft: 4 }} />
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: 24, color: "#b0b0b0", textAlign: "center" }}>
                  No products yet
                </td>
              </tr>
            )}
            {products.map((p, idx) => {
              const img = p.productImages?.[0]?.url || "";
              return (
                <tr key={p._id || idx} style={{ borderTop: idx === 0 ? "none" : "1px solid #e7e7e7" }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                      {img ? (
                        <img
                          src={img}
                          alt=""
                          style={{
                            width: 41,
                            height: 36,
                            borderRadius: 4,
                            objectFit: "cover",
                            background: "#eee",
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 41,
                            height: 36,
                            borderRadius: 4,
                            background: "#eee",
                            flexShrink: 0,
                          }}
                        />
                      )}
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, color: "#454545", lineHeight: 1.4 }}>
                          {p.brand || (p._id ? p._id.slice(-6) : "")}
                        </div>
                        <div
                          style={{
                            fontFamily: "'Manrope', sans-serif",
                            fontWeight: 600,
                            fontSize: 14,
                            color: "#454545",
                            lineHeight: "20px",
                            letterSpacing: 0.14,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {p.productName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#323130",
                      letterSpacing: 0.14,
                      whiteSpace: "nowrap",
                    }}
                  >
                    ₹{(p.discountPrice || p.price || 0).toLocaleString("en-IN")}
                  </td>
                  <td
                    style={{
                      padding: 12,
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#323130",
                      letterSpacing: 0.14,
                    }}
                  >
                    {p.stock ?? "-"}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span
                      style={{
                        display: "inline-block",
                        background: p.isActive ? "#23a149" : "#ea3030",
                        color: "#fff",
                        borderRadius: 10,
                        padding: "6px 8px",
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.4,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductPopularTable;
