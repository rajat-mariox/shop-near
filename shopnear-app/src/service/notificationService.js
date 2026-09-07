import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';
import { navigateFromOutside } from '../routes/navigationRef';

// RNFB v26 = modular API only (getMessaging + free functions).
// Firebase native init tabhi hota hai jab android/app/google-services.json ho;
// bina uske getMessaging() throw karta hai — guard rakha hai taaki app na toote.
let fcm = null;
const getFcm = () => {
  if (fcm) return fcm;
  try {
    const mod = require('@react-native-firebase/messaging');
    fcm = { mod, messaging: mod.getMessaging() };
    return fcm;
  } catch (e) {
    console.warn('[FCM] messaging unavailable:', e?.message);
    return null;
  }
};

/**
 * Android 13+ par runtime POST_NOTIFICATIONS permission chahiye,
 * neeche wale versions par auto-granted hai.
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      );
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    const f = getFcm();
    if (!f) return false;
    const status = await f.mod.requestPermission(f.messaging);
    return (
      status === f.mod.AuthorizationStatus.AUTHORIZED ||
      status === f.mod.AuthorizationStatus.PROVISIONAL
    );
  } catch (e) {
    console.warn('[FCM] permission error:', e?.message);
    return false;
  }
};

/**
 * FCM token lo aur backend par save karo (PUT /user/device-token).
 * Home par aate hi call hota hai; token refresh par bhi.
 */
export const registerDeviceToken = async () => {
  try {
    const authToken = await getTokenStorage();
    if (!authToken) return false;

    const f = getFcm();
    if (!f) return false;

    await requestNotificationPermission();

    const fcmToken = await f.mod.getToken(f.messaging);
    if (!fcmToken) return false;

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.DEVICE_TOKEN}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ deviceToken: fcmToken, deviceType: Platform.OS }),
    });
    const data = await response.json();
    return data.code === 1;
  } catch (e) {
    console.warn('[FCM] registerDeviceToken failed:', e?.message);
    return false;
  }
};

// App band thi aur notification tap se khuli: Splash pehle token check karke Home
// par jaata hai (3s timer). Agar hum turant navigate karein to Splash ka
// navigate('Home') baad me aake tracking screen dhak deta hai. Isliye yahan
// pending rakhte hain aur Splash ke baad flushPendingNotification() kholta hai.
let pendingNotification = null;

export const flushPendingNotification = () => {
  const msg = pendingNotification;
  pendingNotification = null;
  if (msg) openFromNotification(msg);
};

const openFromNotification = (remoteMessage) => {
  const data = remoteMessage?.data || {};
  if (data.type === 'order' && data.orderId) {
    navigateFromOutside('OrderTrackingScreen', { orderId: data.orderId });
  }
};

/**
 * App.js se ek baar call hota hai — foreground message, notification tap
 * (background/quit) aur token refresh handle karta hai.
 * Return: cleanup function.
 */
export const setupNotificationListeners = () => {
  const f = getFcm();
  if (!f) return () => {};
  const { mod, messaging } = f;

  // Foreground: Android system tray me nahi dikhata, isliye in-app card (NotificationToast).
  // Delivery OTP body me hi hota hai; tap karke tracking screen khulti hai.
  const unsubMessage = mod.onMessage(messaging, async (remoteMessage) => {
    const title = remoteMessage?.notification?.title || 'Notification';
    const body = remoteMessage?.notification?.body || '';
    Toast.show({
      type: 'notification',
      topOffset: 48,
      text1: title,
      text2: body,
      visibilityTime: 6000,
      onPress: () => {
        Toast.hide();
        openFromNotification(remoteMessage);
      },
    });
  });

  // Background me app thi, user ne notification tap ki
  const unsubOpened = mod.onNotificationOpenedApp(messaging, openFromNotification);

  // App band thi, notification tap se khuli
  mod
    .getInitialNotification(messaging)
    .then((remoteMessage) => {
      if (remoteMessage) pendingNotification = remoteMessage;
    })
    .catch(() => {});

  const unsubToken = mod.onTokenRefresh(messaging, () => {
    registerDeviceToken();
  });

  return () => {
    unsubMessage();
    unsubOpened();
    unsubToken();
  };
};
