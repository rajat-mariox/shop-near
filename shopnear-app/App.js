import React, { useEffect } from 'react';
import { setupNotificationListeners } from './src/service/notificationService';
import { Colors } from './src/themes/Colors';
import Navigator from './src/routes/Navigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import Toast from 'react-native-toast-message';
import NotificationToast from './src/components/NotificationToast';

// FCM foreground notification ka custom card; success/error toasts default hi rehte hain
const toastConfig = {
  notification: (props) => <NotificationToast {...props} />,
};

const AppContent = () => {
  // FCM: foreground toast + notification tap → order tracking
  useEffect(() => setupNotificationListeners(), []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.theme1} />
      <Navigator />
      <Toast config={toastConfig} />
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
export default App;
