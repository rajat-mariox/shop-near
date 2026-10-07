import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationPicker.css";

/**
 * Map par shop ka exact pin: tap karo ya pin ko drag karo. Search me dukaan
 * na mile tab bhi seller apni location khud laga sakta hai.
 *
 * Props: value {lat,lng}|null, onChange({lat,lng}), height (px)
 */

const INDIA_CENTER = [22.6, 79.0];

const pinIcon = L.divIcon({
  className: "lp-pin",
  html: '<span class="lp-pin-dot"></span>',
  iconSize: [30, 42],
  iconAnchor: [15, 40],
});

const isValid = (v) =>
  v && Number.isFinite(Number(v.lat)) && Number.isFinite(Number(v.lng));

/** Bahar se (search/GPS) pin aaye to wahan le jao; drag/tap par map mat hilao. */
function FollowValue({ value }) {
  const map = useMap();
  const lat = value?.lat;
  const lng = value?.lng;
  useEffect(() => {
    if (!isValid({ lat, lng })) return;
    const pt = L.latLng(Number(lat), Number(lng));
    const inView = map.getBounds().pad(-0.1).contains(pt);
    if (!inView || map.getZoom() < 15) {
      map.flyTo(pt, Math.max(map.getZoom(), 17), { duration: 0.6 });
    }
  }, [map, lat, lng]);
  return null;
}

function ClickToPin({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Container ka size baad me bane (form/tab) to tiles adhoore na rahein */
function FixSize() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationPicker({ value, onChange, height = 280 }) {
  const markerRef = useRef(null);
  const [locating, setLocating] = useState(false);
  const [locError, setLocError] = useState("");

  const has = isValid(value);
  const initialCenter = useMemo(
    () => (has ? [Number(value.lat), Number(value.lng)] : INDIA_CENTER),
    // sirf pehli baar ke liye
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const markerHandlers = useMemo(
    () => ({
      dragend() {
        const m = markerRef.current;
        if (!m) return;
        const p = m.getLatLng();
        onChange({ lat: p.lat, lng: p.lng });
      },
    }),
    [onChange],
  );

  const locateMe = () => {
    if (!navigator.geolocation) {
      setLocError("Is browser me location support nahi hai");
      return;
    }
    setLocating(true);
    setLocError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        setLocating(false);
        setLocError("Location nahi mil payi. Browser me location allow karein.");
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <div className="lp-wrap" style={{ height }}>
      <MapContainer
        center={initialCenter}
        zoom={has ? 17 : 5}
        scrollWheelZoom
        className="lp-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <FixSize />
        <ClickToPin onChange={onChange} />
        <FollowValue value={value} />
        {has && (
          <Marker
            position={[Number(value.lat), Number(value.lng)]}
            icon={pinIcon}
            draggable
            eventHandlers={markerHandlers}
            ref={markerRef}
          />
        )}
      </MapContainer>

      <button
        type="button"
        className="lp-locate"
        onClick={locateMe}
        disabled={locating}
        title="Meri current location"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 2v3M12 19v3M2 12h3M19 12h3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span>{locating ? "Locating..." : "My location"}</span>
      </button>

      <div className={`lp-hint ${has ? "set" : ""}`}>
        {locError
          ? locError
          : has
            ? "Pin ko drag karke bilkul dukaan ke upar rakhein"
            : "Map par apni dukaan ki jagah tap karein"}
      </div>
    </div>
  );
}
