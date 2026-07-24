import { enableScreens } from 'react-native-screens';
enableScreens();
import * as React from 'react';
import { View } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppScreens } from '../constants/app.screens';
import { Colors } from '../themes/Colors';

const Stack = createNativeStackNavigator();

// Full-bleed screens draw their own content behind the status bar,
// so they skip the theme-colored strip that fills the status bar area.
// Login pads its own white top via SafeAreaView.
const FULL_BLEED_ROUTES = ['Splash', 'Landing', 'Login', 'Home', 'ProfileScreen'];

const Navigator = () => {
  // Edge-to-edge: keep screen content above the system navigation bar.
  // Splash (full-bleed) and Home (tab bar pads itself) opt out.
  const insets = useSafeAreaInsets();
  const navigationRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = React.useState('Splash');
  const syncRoute = () => setCurrentRoute(navigationRef.getCurrentRoute()?.name);
  return (
    <View style={{ flex: 1 }}>
      {!FULL_BLEED_ROUTES.includes(currentRoute) && (
        <View style={{ height: insets.top, backgroundColor: Colors.theme1 }} />
      )}
      <NavigationContainer ref={navigationRef} onReady={syncRoute} onStateChange={syncRoute}>
        <Stack.Navigator
        initialRouteName={'Splash'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#fff', paddingBottom: insets.bottom },
        }}
      >
        <Stack.Screen
          name="Splash"
          component={AppScreens.SplashScreen}
          options={{ headerShown: false, contentStyle: { paddingBottom: 0 } }}
        />
        <Stack.Screen
          name="Login"
          component={AppScreens.LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Landing"
          component={AppScreens.LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={AppScreens.MyBottomTabs}
          options={{ headerShown: false, contentStyle: { paddingBottom: 0 } }}
        />
        <Stack.Screen
          name="MyProfile"
          component={AppScreens.MyProfileScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileScreen"
          component={AppScreens.ProfileScreen}
          options={{
            headerShown: false,
            // Sidebar drawer — Home peeche dim hoke dikhti hai, slide-in
            // animation screen khud karti hai
            presentation: 'transparentModal',
            animation: 'none',
            contentStyle: { backgroundColor: 'transparent', paddingBottom: 0 },
          }}
        />
        <Stack.Screen
          name="Wishlist"
          component={AppScreens.WishlistScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SavedAddress"
          component={AppScreens.SavedAddressScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PaymentMethod"
          component={AppScreens.PaymentMethodScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProfileSetting"
          component={AppScreens.ProfileSettingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="FeedbackScreen"
          component={AppScreens.FeedbackScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderConfirmedScreen"
          component={AppScreens.OrderConfirmedScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="OrderTrackingScreen"
          component={AppScreens.OrderTrackingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ProductDetailScreen"
          component={AppScreens.ProductDetailScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="SellerProductsScreen"
          component={AppScreens.SellerProductsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
};

export default Navigator;
