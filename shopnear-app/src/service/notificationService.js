import { PermissionsAndroid, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import { API_BASE_URL } from '../constants/api';
import { API_ENDPOINTS } from '../constants/api.endpoint';
import { getTokenStorage } from '../utils/tokenStorage';
import { navigateFromOutside } from '../routes/navigationRef';

// RNFB v26 = modular API only (getMessaging + free functions).
// Firebase native init tabhi hota hai jab android/app/google-services.json ho;
// bina uske getMessaging() throw karta hai — guard rakha hai taaki app na toote.
// Notifee: foreground me system-tray notification dikhane ke liye (Android FCM
// foreground me tray notification khud nahi dikhata). Native module hai, isliye
// same guard pattern - na mile to purana in-app toast fallback chalta hai.
let notifeeMod = null;
const getNotifee = () => {
  if (notifeeMod) return notifeeMod;
  try {
    const mod = require('@notifee/react-native');
    notifeeMod = { notifee: mod.default, EventType: mod.EventType, AndroidImportance: mod.AndroidImportance, AndroidStyle: mod.AndroidStyle };
    return notifeeMod;
  } catch (e) {
    console.warn('[Notifee] unavailable:', e?.message);
    return null;
  }
};

// Backend (android.notification.channelId) aur MainApplication.kt isi id par hain
export const ORDER_CHANNEL_ID = 'order_updates';

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
 * Foreground FCM message ko system notification (status bar + heads-up) ki
 * tarah dikhao - bilkul waise hi jaise app background me hone par Android dikhata hai.
 * Data payload saath jaata hai taaki tap par tracking screen khule.
 */
export const displaySystemNotification = async (remoteMessage) => {
  const n = getNotifee();
  if (!n) return false;
  const { notifee, AndroidImportance, AndroidStyle } = n;
  const title = remoteMessage?.notification?.title || 'Notification';
  const body = remoteMessage?.notification?.body || '';
  const data = remoteMessage?.data || {};
  // Idempotent: channel pehle se (MainApplication.kt) hai to settings hi sync hoti hain
  await notifee.createChannel({
    id: ORDER_CHANNEL_ID,
    name: 'Order Updates',
    description: 'Order status, delivery OTP and delivery updates',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
    lights: true,
    lightColor: '#FF6051',
  });
  await notifee.displayNotification({
    title,
    body,
    // Notifee data values string hone chahiye
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: {
      channelId: ORDER_CHANNEL_ID,
      smallIcon: 'ic_notification',
      color: '#FF6051',
      importance: AndroidImportance.HIGH,
      // Tap par app khule (background/killed dono me) aur press event mile
      pressAction: { id: 'default', launchActivity: 'default' },
      // Lambi body (delivery OTP wali) poori dikhe
      style: body.length > 40 ? { type: AndroidStyle.BIGTEXT, text: body } : undefined,
      showTimestamp: true,
    },
  });
  return true;
};

/**
 * Notifee notification tap (foreground/background event) -> tracking screen.
 * index.js ka onBackgroundEvent aur yahan ka onForegroundEvent dono isi ko call karte hain.
 */
export const handleNotifeeEvent = ({ type, detail }) => {
  const n = getNotifee();
  if (!n) return;
  if (type === n.EventType.PRESS) {
    openFromNotification({ data: detail?.notification?.data || {} });
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

  // Foreground: Android FCM ko system tray me khud nahi dikhata, isliye Notifee se
  // wahi notification tray me dikhate hain (background jaisa hi look/sound).
  // Notifee na ho (native rebuild pending) to purana in-app card fallback.
  const unsubMessage = mod.onMessage(messaging, async (remoteMessage) => {
    const shown = await displaySystemNotification(remoteMessage).catch((e) => {
      console.warn('[Notifee] display failed:', e?.message);
      return false;
    });
    if (shown) return;
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

  // Notifee (foreground me dikhayi gayi) notification ka tap
  const n = getNotifee();
  const unsubNotifee = n ? n.notifee.onForegroundEvent(handleNotifeeEvent) : () => {};
  // App band thi aur Notifee wali notification tap se khuli
  if (n) {
    n.notifee
      .getInitialNotification()
      .then((initial) => {
        if (initial?.notification) {
          pendingNotification = { data: initial.notification.data || {} };
        }
      })
      .catch(() => {});
  }

  return () => {
    unsubMessage();
    unsubOpened();
    unsubToken();
    unsubNotifee();
  };
};
