import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

/**
 * Live location helpers - Home screen ("Shops Near You") ke liye.
 * AddAddressScreen wala hi pattern: permission -> network fix -> GPS fallback.
 */

const requestPermission = async () => {
  if (Platform.OS !== 'android') return true;
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'ShopNear needs your location to show shops near you',
        buttonPositive: 'OK',
      },
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
};

const getPosition = (options) =>
  new Promise((resolve, reject) =>
    Geolocation.getCurrentPosition(resolve, reject, options),
  );

/**
 * @returns {Promise<{lat:number,lng:number}|null>} null = permission denied / location nahi mili
 */
export const getCurrentLocation = async () => {
  const ok = await requestPermission();
  if (!ok) return null;
  try {
    // Pehle network-based (indoors bhi turant), na mile to GPS high-accuracy
    let pos;
    try {
      pos = await getPosition({ enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
    } catch {
      pos = await getPosition({ enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
    }
    return { lat: pos.coords.latitude, lng: pos.coords.longitude };
  } catch {
    return null;
  }
};

/**
 * Coords se chhota label, e.g. "Sector 15, Gurugram" - header me dikhane ke liye.
 * Fail ho to null (caller backend ka address label dikhata hai).
 */
export const reverseGeocodeLabel = async ({ lat, lng }) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      { headers: { 'User-Agent': 'ShopNearApp/1.0' } },
    );
    const data = await res.json();
    const a = data.address || {};
    const area = a.suburb || a.neighbourhood || a.village || a.road || '';
    const city = a.city || a.town || a.county || a.state_district || '';
    const label = [area, city]
      .filter(Boolean)
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(', ');
    return label || null;
  } catch {
    return null;
  }
};
