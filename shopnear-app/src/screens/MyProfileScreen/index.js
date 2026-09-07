import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../themes/Colors';
import { clearStorage } from '../../utils/tokenStorage';
import { clearWishlistStore } from '../../utils/wishlistStore';
import { fetchUserProfile, deleteAccount } from '../../service/userProfile';
import { applyCoupon } from '../../service/couponService';
import { showToast } from '../../utils/toast';
import PromoModal from '../CartScreen/PromoModal';
import DeleteAccountModal from './DeleteAccountModal';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };
// Figma 55:5119 — menu icons grey filled (Neutrals/5)
const ICON_GREY = '#B1B5C3';

const menu = [
  { key: 'address', label: 'Address', icon: <MaterialCommunityIcons name="map-marker" size={moderateScale(21)} color={ICON_GREY} /> },
  { key: 'payment', label: 'Payment method', icon: <MaterialCommunityIcons name="wallet" size={moderateScale(21)} color={ICON_GREY} /> },
  { key: 'voucher', label: 'Voucher', icon: <MaterialCommunityIcons name="ticket-confirmation" size={moderateScale(21)} color={ICON_GREY} /> },
  { key: 'wishlist', label: 'My Wishlist', icon: <MaterialCommunityIcons name="heart" size={moderateScale(21)} color={ICON_GREY} /> },
  { key: 'rate', label: 'Rate this app', icon: <MaterialCommunityIcons name="star" size={moderateScale(22)} color={ICON_GREY} /> },
  { key: 'logout', label: 'Log out', icon: <MaterialCommunityIcons name="logout" size={moderateScale(21)} color={ICON_GREY} /> },
  { key: 'delete', label: 'Delete account', icon: <MaterialCommunityIcons name="trash-can-outline" size={moderateScale(21)} color="#EE3E35" /> },
];

const MyProfileScreen = ({ navigation }) => {
  // Logout handler
  const handleLogout = async () => {
    await clearStorage();
    clearWishlistStore();
    if (navigation && navigation.replace) {
      navigation.replace('Login');
    }
  };

  const [userProfile, setUserProfile] = useState(null);
  const [voucherVisible, setVoucherVisible] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete request backend par 7-din grace period schedule karta hai;
  // success par logout karke Login par bhej dete hain
  const handleDeleteAccount = async (reason) => {
    setDeleting(true);
    const result = await deleteAccount(reason);
    setDeleting(false);
    if (result.success) {
      setDeleteVisible(false);
      await clearStorage();
      showToast(
        'Your account will be permanently deleted after 7 days. Log in within 7 days to recover it.',
        'success',
      );
      if (navigation && navigation.replace) {
        navigation.replace('Login');
      }
    } else {
      showToast(result.message, 'error');
    }
  };

  // Coupon cart par apply hota hai — success par Cart tab me discount dikhega
  const handleApplyCoupon = async (code) => {
    setApplyingCoupon(true);
    const result = await applyCoupon(code);
    setApplyingCoupon(false);
    showToast(result.message, result.success ? 'success' : 'error');
    if (result.success) setVoucherVisible(false);
  };

  // Fetch user profile on mount
  useEffect(() => {
    const getProfile = async () => {
      const result = await fetchUserProfile();
      if (result.success) {
        setUserProfile(result.data);
      }
    };
    getProfile();
  }, []);

  // Menu item handler
  const handleMenuPress = (item) => {
    if (item.key === 'wishlist') {
      navigation && navigation.navigate('Wishlist');
    } else if (item.key === 'address') {
      navigation && navigation.navigate('SavedAddress', { from: 'address' });
    } else if (item.key === 'payment') {
      navigation && navigation.navigate('PaymentMethod');
    } else if (item.key === 'rate') {
      navigation && navigation.navigate('FeedbackScreen');
    } else if (item.key === 'logout') {
      handleLogout();
    } else if (item.key === 'voucher') {
      setVoucherVisible(true);
    } else if (item.key === 'delete') {
      setDeleteVisible(true);
    }
  };

  return (
    /* Navigator status bar area khud handle karta hai, isliye sirf bottom edge */
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      {/* Header */}
      <ScreenHeader style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Profile
        </Text>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Wishlist')}>
          <AntDesign name="hearto" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate('Search')}>
          <AntDesign name="search1" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* User row (figma 55:5531) — avatar, naam/email, Edit pill */}
        <View style={styles.userRow}>
          {userProfile?.profileImages ? (
            <Image source={{ uri: userProfile.profileImages }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <FontAwesome name="user-o" size={moderateScale(28)} color={THEME_COLOR} />
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
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ProfileSetting')}>
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Menu card (figma 55:5530) */}
        <View style={styles.menuCard}>
          {menu.map((item, idx) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuItem, idx < menu.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item)}>
              <View style={styles.menuIcon}>{item.icon}</View>
              <Text numberOfLines={1} style={styles.menuLabel}>
                {item.label}
              </Text>
              {item.key !== 'logout' && (
                <Feather name="chevron-right" size={moderateScale(20)} color="#33302E" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <PromoModal
        visible={voucherVisible}
        onClose={() => setVoucherVisible(false)}
        onApply={handleApplyCoupon}
        applying={applyingCoupon}
      />
      <DeleteAccountModal
        visible={deleteVisible}
        onClose={() => setDeleteVisible(false)}
        onConfirm={handleDeleteAccount}
        deleting={deleting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: scale(10),
  },
  iconButton: {
    marginLeft: scale(16),
  },
  scrollContent: {
    paddingBottom: verticalScale(110),
  },
  /* ---------- USER ROW (figma 55:5531) ---------- */
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    marginTop: verticalScale(20),
  },
  avatar: {
    width: moderateScale(68),
    height: moderateScale(68),
    borderRadius: moderateScale(34),
    backgroundColor: '#FFECE9',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: scale(18),
    marginRight: scale(10),
  },
  userName: {
    ...F,
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#000',
  },
  userEmail: {
    ...F,
    fontSize: fontScale(12),
    color: '#000',
    marginTop: verticalScale(6),
  },
  editBtn: {
    borderWidth: 1,
    borderColor: '#FF6051',
    borderRadius: moderateScale(20),
    height: verticalScale(28),
    paddingHorizontal: scale(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    ...F,
    color: '#FE6051',
    fontSize: fontScale(12),
    fontWeight: '500',
  },
  /* ---------- MENU CARD (figma 55:5530) ---------- */
  menuCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F2F2F2',
    borderRadius: moderateScale(15),
    marginHorizontal: scale(16),
    marginTop: verticalScale(26),
    paddingHorizontal: scale(7),
    elevation: 4,
    shadowColor: '#0F0F0F',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    paddingHorizontal: scale(6),
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  menuIcon: {
    width: scale(26),
    alignItems: 'center',
  },
  // flex:1 zaroori hai — warna Android row me text ki width kam measure karke
  // aakhri shabd kaat deta hai ("Address" -> "Addres")
  menuLabel: {
    ...F,
    flex: 1,
    fontSize: fontScale(14),
    color: '#33302E',
    fontWeight: '500',
    marginLeft: scale(10),
  },
});

export default MyProfileScreen;
