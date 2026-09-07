/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';

// Background / killed state me aaye FCM messages ke liye handler zaroori hai.
// System tray notification Android khud dikhata hai; yahan kuch aur nahi karna.
try {
  const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
  setBackgroundMessageHandler(getMessaging(), async () => {});
} catch (e) {
  // google-services.json na ho to Firebase init nahi hota — app phir bhi chale
}
// Notifee notification (foreground me dikhayi gayi) ko app background me tap kiya:
// launchActivity se app aage aati hai, yahan se tracking screen par navigate.
try {
  const notifee = require('@notifee/react-native').default;
  const { handleNotifeeEvent } = require('./src/service/notificationService');
  notifee.onBackgroundEvent(async (event) => handleNotifeeEvent(event));
} catch (e) {
  // Notifee native module na ho (purana build) to skip
}
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
