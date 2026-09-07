import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getSellerCustomerCities } from "../../api/sellerApi";
import { ShowAllCta } from "../common/FigmaIcon";

const DOT_COLORS = ["#23a149", "#1a71f6", "#184190", "#FF6051", "#f5a623"];
// India center: koi data na ho to yahi dikhega
const INDIA_CENTER = [22.5, 79];

/**
 * City ka lat/lng address me saved na ho to OpenStreetMap Nominatim se geocode
 * (free, no key). Result localStorage me cache hota hai taaki baar-baar call na ho.
 */
const geocodeCity = async (city, state) => {
  const key = `geo:${(city || "").toLowerCase()},${(state || "").toLowerCase()}`;
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch {
    /* ignore */
  }
  const q = encodeURIComponent([city, state, "India"].filter(Boolean).join(", "));
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`, {
    headers: { Accept: "application/json" },
  });
  const rows = await res.json();
  if (!rows.length) return null;
  const pos = { lat: parseFloat(rows[0].lat), lng: parseFloat(rows[0].lon) };
  try {
    localStorage.setItem(key, JSON.stringify(pos));
  } catch {
    /* ignore */
  }
  return pos;
};

// Markers ke hisaab se map ko fit karo
const FitToCities = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 10);
      return;
    }
    map.fitBounds(
      points.map((p) => [p.lat, p.lng]),
      { padding: [30, 30], maxZoom: 11 },
    );
  }, [points, map]);
  return null;
};

const CustomerGrowthMap = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getSellerCustomerCities();
        const d = res.data?.data || res.data || {};
        let list = d.cities || [];
        // Jin cities ka lat/lng nahi hai unhe geocode karo (ek-ek karke, Nominatim rate limit)
        const out = [];
        for (const c of list) {
          if (c.lat && c.lng) {
            out.push(c);
            continue;
          }
          try {
            const pos = await geocodeCity(c.city, c.state);
            out.push(pos ? { ...c, ...pos } : c);
          } catch {
            out.push(c);
          }
          if (!alive) return;
        }
        if (alive) setCities(out);
      } catch {
        if (alive) setCities([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const points = useMemo(() => cities.filter((c) => c.lat && c.lng), [cities]);
  const maxOrders = Math.max(1, ...cities.map((c) => c.orders || 0));

  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e7e7e7",
        borderRadius: 24,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 20,
        minWidth: 0,
        flex: "1 1 320px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 16, color: "#454545", lineHeight: 1.3 }}>
            Customer Growth
          </div>
          <div style={{ fontSize: 14, color: "#737373", marginTop: 2 }}>
            {cities.length} {cities.length === 1 ? "City" : "Cities"}
          </div>
        </div>
        <ShowAllCta onClick={() => navigate("/customer")} />
      </div>

      {/* City legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
        {cities.length === 0 && !loading ? (
          <span style={{ fontSize: 13, color: "#aaa" }}>Abhi koi order nahi, cities yahan dikhengi.</span>
        ) : null}
        {cities.slice(0, 5).map((c, i) => (
          <div key={c.city + i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: DOT_COLORS[i % DOT_COLORS.length],
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#454545" }}>{c.city}</span>
            <span style={{ color: "#454545", fontWeight: 700 }}>({c.pct}%)</span>
            <span style={{ color: "#999", fontSize: 12 }}>
              {c.customers} customer{c.customers > 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Real map (OpenStreetMap) */}
      <div style={{ borderRadius: 16, overflow: "hidden", height: 300, background: "#f3f3f3" }}>
        <MapContainer
          center={INDIA_CENTER}
          zoom={4}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToCities points={points} />
          {points.map((c, i) => {
            const idx = cities.indexOf(c);
            const color = DOT_COLORS[idx % DOT_COLORS.length];
            const radius = 8 + Math.round((c.orders / maxOrders) * 14);
            return (
              <CircleMarker
                key={c.city + i}
                center={[c.lat, c.lng]}
                radius={radius}
                pathOptions={{ color: "#fff", weight: 2, fillColor: color, fillOpacity: 0.85 }}
              >
                <Popup>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 13 }}>
                    <div style={{ fontWeight: 700 }}>
                      {c.city}
                      {c.state ? `, ${c.state}` : ""}
                    </div>
                    <div>{c.customers} customer{c.customers > 1 ? "s" : ""}</div>
                    <div>
                      {c.orders} order{c.orders > 1 ? "s" : ""} ({c.pct}%)
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default CustomerGrowthMap;
