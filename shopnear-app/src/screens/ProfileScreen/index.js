import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { Colors } from '../../themes/Colors';
import { fetchUserProfile } from '../../service/userProfile';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Figma me sidebar 293/402 chaudi hai — screen ka ~73%
const SIDEBAR_WIDTH = Math.round(SCREEN_WIDTH * 0.73);

// Icons color prop ke saath render hote hain taaki active item black
// aur baaki grey (#777E90) dikhein, design ki tarah
const MENU = [
  {
    key: 'homepage',
    label: 'Homepage',
    icon: (color) => <Feather name="home" size={moderateScale(19)} color={color} />,
  },
  {
    key: 'discover',
    label: 'Discover',
    icon: (color) => <Feather name="search" size={moderateScale(19)} color={color} />,
  },
  {
    key: 'order',
    label: 'My Order',
    icon: (color) => <Feather name="shopping-bag" size={moderateScale(19)} color={color} />,
  },
  {
    key: 'profile',
    label: 'My profile',
    icon: (color) => <AntDesign name="user" size={moderateScale(19)} color={color} />,
  },
];

const OTHER_MENU = [
  {
    key: 'setting',
    label: 'Setting',
    icon: (color) => <Feather name="settings" size={moderateScale(19)} color={color} />,
  },
  {
    key: 'support',
    label: 'Support',
    icon: (color) => <Feather name="mail" size={moderateScale(19)} color={color} />,
  },
  {
    key: 'about',
    label: 'About us',
    icon: (color) => <Feather name="info" size={moderateScale(19)} color={color} />,
  },
];

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState(null);
  // Drawer left se slide hota hai, peeche Home dim hota hai
  const slide = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const dim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUserProfile().then((result) => {
      if (result.success) setUserProfile(result.data);
    });
    Animated.parallel([
      Animated.timing(slide, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dim, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [slide, dim]);

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slide, {
        toValue: -SIDEBAR_WIDTH,
        duration: 180,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(dim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(() => navigation.goBack());
  };

  const onMenuPress = (key) => {
    // Home-tab targets par navigate karne se ye transparent modal khud pop ho
    // jaata hai; baaki screens drawer ke upar push hoti hain (back par drawer
    // wapas khula milta hai)
    if (key === 'homepage') closeDrawer();
    else if (key === 'discover') navigation.navigate('Home', { screen: 'Search' });
    else if (key === 'order') navigation.navigate('Home', { screen: 'Order' });
    else if (key === 'profile') navigation.navigate('MyProfile');
    else if (key === 'setting') navigation.navigate('ProfileSetting');
    else if (key === 'support') navigation.navigate('FeedbackScreen');
    // 'about' ke liye abhi koi screen nahi hai
  };

  const renderItem = (item, isActive) => {
    const color = isActive ? '#0A130F' : '#777E90';
    return (
      <TouchableOpacity
        key={item.key}
        style={[styles.menuItem, isActive && styles.menuItemActive]}
        activeOpacity={0.7}
        onPress={() => onMenuPress(item.key)}>
        <View style={styles.menuIcon}>{item.icon(color)}</View>
        <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dim ki hui Home peeche dikhti hai, bahar tap karne par drawer band */}
      <TouchableWithoutFeedback onPress={() => closeDrawer()}>
        <Animated.View style={[styles.dimOverlay, { opacity: dim }]} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.sidebar,
          { paddingTop: insets.top + verticalScale(28), transform: [{ translateX: slide }] },
        ]}>
        <View style={styles.userSection}>
          {userProfile?.profileImages ? (
            <Image source={{ uri: userProfile.profileImages }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <FontAwesome name="user-o" size={moderateScale(24)} color={Colors.theme1} />
            </View>
          )}
          <View style={styles.userInfo}>
            <Text numberOfLines={1} style={styles.userName}>
              {userProfile?.fullName || 'Hey User'}
            </Text>
            {userProfile?.email ? (
              <Text numberOfLines={1} style={styles.userEmail}>
                {userProfile.email}
              </Text>
            ) : null}
          </View>
        </View>

        <View style={styles.menuSection}>
          {MENU.map((item) => renderItem(item, item.key === 'homepage'))}
        </View>

        <Text style={styles.otherLabel}>OTHER</Text>
        <View style={styles.otherSection}>{OTHER_MENU.map((item) => renderItem(item, false))}</View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dimOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: '#fff',
    borderTopRightRadius: moderateScale(30),
    borderBottomRightRadius: moderateScale(30),
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    marginTop: verticalScale(16),
  },
  avatar: {
    width: moderateScale(52),
    height: moderateScale(52),
    borderRadius: moderateScale(26),
    backgroundColor: '#FFECE9',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: scale(16),
  },
  userName: {
    fontFamily: 'sans-serif',
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#0A130F',
  },
  userEmail: {
    fontFamily: 'sans-serif',
    fontSize: fontScale(12),
    color: '#777E90',
    marginTop: verticalScale(4),
  },
  menuSection: {
    marginTop: verticalScale(36),
  },
  otherSection: {
    marginTop: verticalScale(8),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(13),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    borderRadius: moderateScale(10),
  },
  menuItemActive: {
    backgroundColor: '#F4F5F6',
  },
  menuIcon: {
    width: scale(24),
    alignItems: 'center',
  },
  menuLabel: {
    fontFamily: 'sans-serif',
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#777E90',
    marginLeft: scale(14),
  },
  menuLabelActive: {
    color: '#0A130F',
  },
  otherLabel: {
    fontFamily: 'sans-serif',
    marginTop: verticalScale(28),
    marginLeft: scale(33),
    fontSize: fontScale(13),
    color: '#777E90',
    letterSpacing: 1,
  },
});

export default ProfileScreen;
