import React, { useEffect, useRef, useState } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Easing,
  Animated,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import Dashboard from '../screens/DashboardScreen';
import { NavIcon } from '../components/NavIcon';
import Alert from '../components/Modal/Alert';
import SearchScreen from '../screens/SearchScreen';
import CartScreen from '../screens/CartScreen';
import MyProfileScreen from '../screens/MyProfileScreen';
import OrderScreen from '../screens/OrderScreen';

import { getTokenStorage } from '../utils/tokenStorage';
import { Colors } from '../themes/Colors';
import { fontScale } from '../utils/responsive';

// route name -> NavIcon name (design ke hisaab se)
const ICON_NAME = {
  Home: 'home',
  Search: 'search',
  Order: 'order',
  Cart: 'cart',
  Profile: 'profile',
};

const Tab = createBottomTabNavigator();
const TAB_BG_COLOR = Colors.theme1;

const { width: SCREEN_W } = Dimensions.get('window');
// px = width-proportional (design 405 frame -> screen width), taaki har device
// par notch/circle ka ratio same rahe.
const px = (n) => (SCREEN_W / 405) * n;

const TAB_COUNT = 5;
const BAR_H = px(64);
// Chhota rakha hai — Home (pehla tab) ka notch corner curve se na takraye.
const CORNER_R = px(8);
const ICON_SIZE = px(21);

// Notch — active tab ke upar top edge me curve cut. Circle (BTN) isi me baitha hai.
const NOTCH_HALF = px(44); // notch ka aadha span
const NOTCH_DEPTH = px(30); // kitna neeche tak cut hai
const BTN = px(56); // raised circle ka diameter
const BTN_GAP = px(4); // circle aur notch curve ke beech ka gap

// Edge tabs (Home/Profile) ka notch top corner se na takraye, isliye row inset.
const ROW_PAD = px(16);
const SLOT_W = (SCREEN_W - ROW_PAD * 2) / TAB_COUNT;
// Har tab ke center ki x — notch aur circle dono isi par slide karte hain.
const CENTERS = Array.from({ length: TAB_COUNT }, (_, i) => ROW_PAD + (i + 0.5) * SLOT_W);

// Bar ka shape, notch center cx par. Har cx ke liye commands ka structure same
// rehta hai, isliye Animated string interpolation se path smoothly slide hota hai.
const barPath = (cx) => {
  const W = SCREEN_W;
  const H = BAR_H;
  const r = CORNER_R;
  const s = NOTCH_HALF;
  const d = NOTCH_DEPTH;
  const c1 = px(20); // notch ke bahar wale curve ka control inset
  const c2 = px(27); // notch ke andar (bottom) wale curve ka control inset
  return [
    `M0,${H}`,
    `L0,${r}`,
    `Q0,0 ${r},0`,
    `L${cx - s},0`,
    `C${cx - s + c1},0 ${cx - c2},${d} ${cx},${d}`,
    `C${cx + c2},${d} ${cx + s - c1},0 ${cx + s},0`,
    `L${W - r},0`,
    `Q${W},0 ${W},${r}`,
    `L${W},${H}`,
    'Z',
  ].join(' ');
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CustomTabBar = ({ state, descriptors, navigation, bottomInset = 0 }) => {
  // Sirf safe-area inset use karo. Dimensions-wala fallback double-count karta
  // tha: non-edge-to-edge devices par window pehle hi system bar ke upar khatam
  // hoti hai, phir bhi fallback ~40dp nikaal deta tha — navbar lamba dikhta tha
  // aur icons upar shift ho jaate the.
  const sysBottom = bottomInset;
  const activeIndex = state.index;
  const activeName = state.routes[activeIndex]?.name;

  // slide: notch + circle ko active tab tak le jaata hai. Path ka `d` string
  // interpolate hota hai isliye native driver nahi chal sakta.
  const slide = useRef(new Animated.Value(activeIndex)).current;
  // pop: naya icon circle me chhota se bada hota hai — "khulne" wali feel.
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(slide, {
      toValue: activeIndex,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
    pop.setValue(0.3);
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, slide, pop]);

  const indexes = CENTERS.map((_, i) => i);
  const animatedD = slide.interpolate({
    inputRange: indexes,
    outputRange: CENTERS.map(barPath),
  });
  const circleX = slide.interpolate({
    inputRange: indexes,
    outputRange: CENTERS.map((c) => c - BTN / 2),
  });

  const handleTabPress = async (routeName) => {
    if (routeName === 'Cart' || routeName === 'Profile') {
      const token = await getTokenStorage();
      if (!token) {
        navigation.navigate('Login');
        return;
      }
    }
    navigation.navigate(routeName);
  };

  const iconFor = (routeName, size) => (
    <NavIcon
      name={ICON_NAME[routeName]}
      size={size}
      color="#fff"
      // Home pentagon ke andar ka "smile" coral (bar ka rang) me dikhta hai
      cutColor={routeName === 'Home' ? TAB_BG_COLOR : undefined}
    />
  );

  const labelOf = (route) => {
    // Standalone use (stack screens) me descriptors nahi hote
    const options = descriptors[route.key]?.options || {};
    return options.tabBarLabel ?? options.title ?? route.name;
  };

  return (
    <View
      style={[
        styles.container,
        {
          // Edge-to-edge me window physical bottom tak jaati hai: upar BAR_H =
          // coral navbar (icons ke saath), niche sysBottom = coral filler jo
          // system bar/gesture area ke piche baithta hai. Navbar bottom edge
          // par flush dikhta hai, koi patti nahi.
          height: BAR_H + sysBottom,
        },
      ]}
    >
      {/* Coral bar — notch active tab ke neeche, tab badalne par slide karta hai */}
      <Svg
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: BAR_H }}
        width={SCREEN_W}
        height={BAR_H}
        viewBox={`0 0 ${SCREEN_W} ${BAR_H}`}
      >
        <AnimatedPath d={animatedD} fill={TAB_BG_COLOR} />
      </Svg>

      {/* System nav bar wali jagah bhi coral — navbar bottom edge tak aligned dikhe */}
      {sysBottom > 0 ? (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: sysBottom + 1,
            backgroundColor: TAB_BG_COLOR,
          }}
        />
      ) : null}

      {/* Paanchon tabs — active tab ka icon row me chhup jaata hai (circle me hai) */}
      <View style={[styles.row, { marginBottom: sysBottom }]}>
        {state.routes.map((route, i) => {
          const isActive = i === activeIndex;
          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => handleTabPress(route.name)}
              style={styles.tabButton}
              activeOpacity={0.8}
            >
              <View style={{ opacity: isActive ? 0 : 1 }}>
                {iconFor(route.name, ICON_SIZE)}
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {labelOf(route)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Raised circle — notch ke saath active tab par slide karta hai */}
      <Animated.View
        pointerEvents="none"
        style={[styles.circleWrap, { transform: [{ translateX: circleX }] }]}
      >
        <View style={styles.circleButton}>
          <Animated.View style={{ transform: [{ scale: pop }] }}>
            {iconFor(activeName, px(24))}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const MyBottomTabs = () => {
  const [modalAlert, setModalAlert] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} bottomInset={insets.bottom} />}
        // Tab badalne par screen shift+fade hoti hai (default v7 me koi animation nahi).
        // Default 150ms bahut tez lagti hai, isliye 280ms rakha taaki saaf dikhe.
        screenOptions={{
          headerShown: false,
          animation: 'shift',
          transitionSpec: {
            animation: 'timing',
            config: { duration: 280, easing: Easing.inOut(Easing.ease) },
          },
        }}
      >
        {/* Order design se: Home, Search, Order, Cart, Profile */}
        <Tab.Screen name="Home" component={Dashboard} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Order" component={OrderScreen} />
        <Tab.Screen name="Cart" component={CartScreen} />
        <Tab.Screen name="Profile" component={MyProfileScreen} />
      </Tab.Navigator>
      <Alert modalAlert={modalAlert} setModalAlert={setModalAlert} />
    </>
  );
};

/**
 * Wahi coral tab bar, stack screens (Wishlist etc.) ke bottom par dikhane ke liye.
 * Tab tap par tabs navigator ke andar wali tab khulti hai.
 */
const TAB_NAMES = ['Home', 'Search', 'Order', 'Cart', 'Profile'];
export const StandaloneTabBar = ({ activeName = 'Profile' }) => {
  const rootNav = useNavigation();
  const insets = useSafeAreaInsets();
  const index = Math.max(0, TAB_NAMES.indexOf(activeName));
  const state = {
    index,
    routes: TAB_NAMES.map((name) => ({ key: name, name })),
  };
  const navigation = {
    navigate: (name) =>
      TAB_NAMES.includes(name)
        ? rootNav.navigate('Home', { screen: name })
        : rootNav.navigate(name),
  };
  return (
    <CustomTabBar
      state={state}
      descriptors={{}}
      navigation={navigation}
      bottomInset={insets.bottom}
    />
  );
};

export default MyBottomTabs;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_H,
    paddingHorizontal: ROW_PAD,
    paddingBottom: px(8),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  tabLabel: {
    color: '#fff',
    fontSize: fontScale(11),
    marginTop: px(3),
    fontWeight: '500',
    // Android centered parent me text ki width kam measure karta hai
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  circleWrap: {
    position: 'absolute',
    left: 0,
    // Circle notch me baithe: bottom = NOTCH_DEPTH - GAP, upar utna hi pop kare.
    top: -(BTN - NOTCH_DEPTH + BTN_GAP),
    width: BTN,
    alignItems: 'center',
  },
  circleButton: {
    width: BTN,
    height: BTN,
    backgroundColor: TAB_BG_COLOR,
    borderRadius: BTN / 2,
    borderColor: '#fff',
    borderWidth: px(4),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
