import React, { useState, useEffect } from "react";
import {
  getProducts,
  getSellers,
  toggleProductStatus,
  deleteProduct as deleteProductApi,
} from "../../api/adminApi";
import useCategoryStore from "../../store/categoryStore";

const formatCurrency = (v) => `₹${(v || 0).toLocaleString()}`;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const limit = 10;

  // Filters
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    fetchCategories();
    getSellers({ limit: 200 })
      .then((res) => {
        const d = res.data?.data || res.data;
        setSellers(d.sellers || d || []);
      })
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search: search || undefined };
      if (categoryFilter) params.category = categoryFilter;
      if (sellerFilter) params.seller = sellerFilter;
      if (statusFilter) params.isActive = statusFilter;

      const res = await getProducts(params);
      const d = res.data?.data || res.data;
      setProducts(d.products || []);
      setTotal(d.total || 0);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, sellerFilter, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleClearFilters = () => {
    setCategoryFilter("");
    setSellerFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const activeFilterCount = [categoryFilter, sellerFilter, statusFilter].filter(Boolean).length;

  const handleToggle = async (id) => {
    try {
      await toggleProductStatus(id);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProductApi(id);
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="page-content">
      <div
        style={{
          fontSize: 24,
          fontWeight: 600,
          marginBottom: 4,
          color: "#2A2A2A",
        }}
      >
        Products
      </div>

      <div className="card">
        {/* Search + Filter toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <input
            className="search-input"
            placeholder="Search product by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            style={{ flex: "1 1 250px" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={handleSearch}>
              Search
            </button>
            <button
              className="btn btn-sm"
              onClick={() => setShowFilters(!showFilters)}
              style={{
                background: showFilters ? "#FFF0EE" : "#f7f7fa",
                border: showFilters ? "1px solid #FF6051" : "1px solid #ddd",
                color: showFilters ? "#FF6051" : "#555",
                fontWeight: 600,
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span
                  style={{
                    background: "#FF6051",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div
            style={{
              background: "#fafbfc",
              border: "1px solid #ececec",
              borderRadius: 10,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: "#333" }}>
                Filter Products
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#FF6051",
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Clear all
                </button>
              )}
            </div>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {/* Category */}
              <div style={{ flex: "1 1 180px" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                  Category
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#333",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.categoryName || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Seller */}
              <div style={{ flex: "1 1 180px" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                  Seller
                </label>
                <select
                  value={sellerFilter}
                  onChange={(e) => { setSellerFilter(e.target.value); setPage(1); }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#333",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Sellers</option>
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.shopName || s.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div style={{ flex: "1 1 150px" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#666", display: "block", marginBottom: 4 }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#333",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        {p.productImages?.[0]?.url ? (
                          <img
                            src={p.productImages[0].url}
                            alt=""
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: "#f0f0f0",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 14,
                            }}
                          >
                            📦
                          </div>
                        )}
                        <div>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 14,
                              maxWidth: 200,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {p.productName}
                          </div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            {p.brand || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{p.categoryId?.categoryName || "—"}</td>
                    <td>{p.shopId?.shopName || p.shopId?.fullName || "—"}</td>
                    <td>
                      <div>{formatCurrency(p.discountPrice || p.price)}</div>
                      {p.discountPrice && p.price !== p.discountPrice && (
                        <div
                          style={{
                            fontSize: 11,
                            color: "#888",
                            textDecoration: "line-through",
                          }}
                        >
                          {formatCurrency(p.price)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          color: p.stock > 0 ? "#09DE13" : "#e74c3c",
                          fontWeight: 600,
                        }}
                      >
                        {p.stock > 0 ? p.stock : "Out"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${p.isActive ? "badge-green" : "badge-grey"}`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="action-icons">
                        <label
                          className="toggle"
                          title={p.isActive ? "Deactivate" : "Activate"}
                        >
                          <input
                            type="checkbox"
                            checked={p.isActive}
                            onChange={() => handleToggle(p._id)}
                          />
                          <span className="slider" />
                        </label>
                        <div
                          className="action-icon"
                          title="Delete"
                          onClick={() => handleDelete(p._id)}
                        >
                          <svg
                            width="16"
                            height="16"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <path
                              d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"
                              stroke="#e74c3c"
                              strokeWidth="1.5"
                            />
                          </svg>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ←
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
            (p) => (
              <button
                key={p}
                className={p === page ? "active" : ""}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ),
          )}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
