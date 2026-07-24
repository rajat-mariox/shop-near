import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, toggleUserStatus } from "../../api/adminApi";

const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({ page, limit, search: search || undefined });
      const d = res.data?.data || res.data;
      setUsers(d.user || d.users || []);
      setTotal(d.total_user || d.total || 0);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleToggle = async (id) => {
    try {
      await toggleUserStatus(id);
      fetchUsers();
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
        Users
      </div>

      <div className="card">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <input
            className="search-input"
            placeholder="Search user by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="btn btn-outline btn-sm" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{ textAlign: "center", padding: 32, color: "#888" }}
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => navigate(`/users/${u._id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <img
                          src={
                            u.profileImages ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName || "U")}&background=FF6051&color=fff`
                          }
                          alt=""
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>
                            {u.fullName || "—"}
                          </div>
                          <div style={{ fontSize: 12, color: "#888" }}>
                            {u.email || ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {u.countryCode} {u.mobileNumber}
                    </td>
                    <td>{u.gender || "—"}</td>
                    <td>
                      <span
                        className={`badge ${u.isActive ? "badge-green" : "badge-grey"}`}
                      >
                        {u.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td>
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <label
                        className="toggle"
                        title={u.isActive ? "Block" : "Unblock"}
                      >
                        <input
                          type="checkbox"
                          checked={u.isActive}
                          onChange={() => handleToggle(u._id)}
                        />
                        <span className="slider" />
                      </label>
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

export default UserList;
