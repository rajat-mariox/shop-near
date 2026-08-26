import React, { useEffect } from 'react';
import { setupNotificationListeners } from './src/service/notificationService';
import { Colors } from './src/themes/Colors';
import Navigator from './src/routes/Navigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, View } from 'react-native';
import Toast from 'react-native-toast-message';

const AppContent = () => {
  // FCM: foreground toast + notification tap → order tracking
  useEffect(() => setupNotificationListeners(), []);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.theme1} />
      <Navigator />
      <Toast />
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
