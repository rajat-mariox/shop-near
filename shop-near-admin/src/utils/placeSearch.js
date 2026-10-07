/**
 * Shop location search (address / shop name -> lat/lng). Poora free.
 *
 * Provider:
 *  - Default: Photon (OpenStreetMap) — free, koi key/signup nahi.
 *  - VITE_OLA_MAPS_API_KEY set ho to Ola Maps — India ka apna map data, chhoti
 *    dukaanein OSM se zyada milti hain. Key free signup se milti hai
 *    (maps.olakrutrim.com). Key fail ho to apne aap Photon par wapas.
 *
 * Kisi bhi search me dukaan na mile to seller map par tap karke pin laga sakta hai
 * (LocationPicker), isliye search sirf shortcut hai, zaroori nahi.
 *
 * Plain fetch use hota hai — axios client ka Authorization token bahar ke API
 * par nahi jaana chahiye.
 */

const OLA_KEY = import.meta.env.VITE_OLA_MAPS_API_KEY || "";
const OLA = "https://api.olamaps.io/places/v1";
const PHOTON = "https://photon.komoot.io";

export const placeProvider = OLA_KEY ? "ola" : "osm";

const uniqJoin = (parts) =>
  parts
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .join(", ");

const validNear = (near) =>
  near && Number.isFinite(Number(near.lat)) && Number.isFinite(Number(near.lng));

/* ------------------------------ Ola Maps ------------------------------ */

const olaSearch = async (query, near) => {
  let url = `${OLA}/autocomplete?input=${encodeURIComponent(query)}&api_key=${encodeURIComponent(OLA_KEY)}`;
  if (validNear(near)) url += `&location=${Number(near.lat)},${Number(near.lng)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ola search failed (${res.status})`);
  const json = await res.json();
  return (json.predictions || [])
    .map((p) => {
      const loc = p.geometry?.location || {};
      return {
        id: p.place_id || p.reference || p.description,
        placeId: p.place_id || p.reference || "",
        title: p.structured_formatting?.main_text || p.description || "",
        subtitle: p.structured_formatting?.secondary_text || "",
        label: p.description || "",
        lat: Number.isFinite(Number(loc.lat)) ? Number(loc.lat) : undefined,
        lng: Number.isFinite(Number(loc.lng)) ? Number(loc.lng) : undefined,
      };
    })
    .filter((s) => s.label);
};

const olaResolve = async (s) => {
  if (s.lat && s.lng) return { lat: s.lat, lng: s.lng, label: s.label, city: "", pincode: "" };
  const url = `${OLA}/details?place_id=${encodeURIComponent(s.placeId)}&api_key=${encodeURIComponent(OLA_KEY)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ola place lookup failed (${res.status})`);
  const r = (await res.json()).result || {};
  const comp = (type) =>
    (r.address_components || []).find((c) => (c.types || []).includes(type))?.long_name || "";
  return {
    lat: r.geometry?.location?.lat,
    lng: r.geometry?.location?.lng,
    label: s.label || r.formatted_address || "",
    city: comp("locality") || comp("administrative_area_level_2"),
    pincode: comp("postal_code"),
  };
};

/* ------------------------------ Photon (OSM) ------------------------------ */

const photonItem = (f) => {
  const p = f.properties || {};
  const street = uniqJoin([p.housenumber, p.street]);
  const title = p.name || street || p.district || p.city || "";
  const subtitle = uniqJoin(
    [p.name ? street : "", p.district, p.city, p.state, p.postcode].filter(
      (v) => v !== title,
    ),
  );
  return {
    id: `${p.osm_type || ""}${p.osm_id || ""}-${f.geometry?.coordinates?.join(",")}`,
    title,
    subtitle,
    label: uniqJoin([title, subtitle]),
    city: p.city || p.district || "",
    pincode: p.postcode || "",
    lat: f.geometry?.coordinates?.[1],
    lng: f.geometry?.coordinates?.[0],
    country: p.countrycode,
  };
};

const photonSearch = async (query, near) => {
  let url =
    `${PHOTON}/api/?limit=10&lang=en&bbox=68.1,6.5,97.4,35.7&q=` +
    encodeURIComponent(query);
  // Paas wale results pehle (seller ki current location ke aas-paas)
  if (validNear(near)) url += `&lat=${Number(near.lat)}&lon=${Number(near.lng)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const json = await res.json();
  return (json.features || [])
    .map(photonItem)
    // bbox rectangle me Pakistan/Nepal/Bangladesh bhi aate hain — sirf India
    .filter((s) => s.title && s.lat && s.lng && (!s.country || s.country === "IN"))
    .slice(0, 8);
};

/* ------------------------------ Public API ------------------------------ */

/** Suggestions dhundo. `near` = {lat,lng} ho to paas wale pehle aate hain. */
export const searchPlaces = async (query, near) => {
  const q = (query || "").trim();
  if (q.length < 3) return [];
  if (OLA_KEY) {
    try {
      const items = await olaSearch(q, near);
      if (items.length) return items;
    } catch {
      // key galat / limit khatam — free OSM search par wapas
    }
  }
  return photonSearch(q, near);
};

/** Chuni hui suggestion ka exact {lat, lng, label, city, pincode}. */
export const resolvePlace = async (s) => {
  if (s.placeId && OLA_KEY) return olaResolve(s);
  return { lat: s.lat, lng: s.lng, label: s.label, city: s.city, pincode: s.pincode };
};

/**
 * Pin (lat/lng) ka approximate address — map par tap ya GPS ke baad address
 * khaali ho to bhar dene ke liye. Free (Photon reverse), fail ho to null.
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(`${PHOTON}/reverse?lang=en&lat=${lat}&lon=${lng}`);
    if (!res.ok) return null;
    const json = await res.json();
    const f = (json.features || [])[0];
    if (!f) return null;
    const s = photonItem(f);
    return { label: s.label, city: s.city, pincode: s.pincode };
  } catch {
    return null;
  }
};

/**
 * Browser location sirf tab lo jab permission pehle se di hui ho — typing ke
 * beech achanak permission popup na aaye. Na mile to null.
 */
export const getKnownPosition = async () => {
  try {
    if (!navigator.geolocation || !navigator.permissions) return null;
    const perm = await navigator.permissions.query({ name: "geolocation" });
    if (perm.state !== "granted") return null;
    return await new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { maximumAge: 10 * 60 * 1000, timeout: 8000 },
      ),
    );
  } catch {
    return null;
  }
};
