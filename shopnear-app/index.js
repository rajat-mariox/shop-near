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
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
