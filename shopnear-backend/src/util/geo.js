/**
 * Geo helpers — shop/user distance ke liye ek hi jagah
 * (HomeScreen nearby shops + order ke waqt radius check dono yahi use karte hain)
 */
const toRad = (deg) => (deg * Math.PI) / 180;

/** Do coordinates ke beech Haversine distance, km me */
const distanceKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Valid lat/lng pair hai ya nahi (0,0 ko bhi invalid maante hain — default junk) */
const isValidCoords = (lat, lng) => {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return false;
  if (la === 0 && ln === 0) return false;
  return la >= -90 && la <= 90 && ln >= -180 && ln <= 180;
};

/** lat/lng se Mongo GeoJSON Point — 2dsphere index ke liye [lng, lat] order zaroori hai */
const toPoint = (lat, lng) => ({
  type: "Point",
  coordinates: [Number(lng), Number(lat)],
});

/** "1.2 km" / "850 m" jaisa label */
const formatDistance = (km) => {
  if (!Number.isFinite(km)) return null;
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
};

module.exports = { distanceKm, isValidCoords, toPoint, formatDistance };
