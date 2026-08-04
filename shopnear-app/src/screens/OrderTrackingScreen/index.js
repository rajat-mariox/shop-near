import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../themes/Colors';
import { fetchOrderById } from '../../service/orderService';
import { showToast } from '../../utils/toast';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Figma 55:2287 — 3-step timeline. Backend statuses ka mapping:
// pending/confirmed/processing => Order Picking, shipped => On the way,
// delivered => Delivered
const stepIndexForStatus = (status) => {
  if (status === 'delivered') return 2;
  if (status === 'shipped') return 1;
  return 0;
};
const CLOSED_STATUS_LABELS = {
  cancelled: 'Order Cancelled',
  returned: 'Order Returned',
};

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d)) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' });
};

const OrderTrackingScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadOrder = () => {
    if (!orderId) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);
    fetchOrderById(orderId)
      .then((res) => {
        if (res.success && res.data) setOrder(res.data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(loadOrder, [orderId]);

  // Shipped hone par backend delivery OTP generate karta hai —
  // customer ye OTP delivery par shop/delivery partner ko batata hai,
  // seller apne panel me enter karta hai, tab order complete hota hai.
  const deliveryOtpEntry = (order?.sellerOrderStatus || []).find(
    (s) => s.otp && !s.otpVerified,
  );

  // Tracking seller ke status se chalti hai (wahi jo seller panel me dikhta hai) —
  // main order.status sirf fallback hai
  const trackingStatus =
    order?.sellerOrderStatus?.[0]?.status || order?.status;

  // Auto-refresh (silent poll) — seller status update kare to bina refresh ke dikhe.
  // Order close (delivered/cancelled/returned) hone par polling band.
  const isFinal =
    trackingStatus === 'delivered' || !!CLOSED_STATUS_LABELS[trackingStatus];
  useEffect(() => {
    if (!orderId || isFinal) return;
    const t = setInterval(() => {
      fetchOrderById(orderId)
        .then((res) => {
          if (res.success && res.data) setOrder(res.data);
        })
        .catch(() => {});
    }, 3000);
    return () => clearInterval(t);
  }, [orderId, isFinal]);

  // Seller ne delivery agent assign kiya ho to wahi contact point hai,
  // warna fallback me shop se hi baat hoti hai
  const seller = order?.products?.find((p) => p.seller?.shopName)?.seller;
  const agent = order?.deliveryAgent?.name ? order.deliveryAgent : null;
  const contactName = agent?.name || seller?.shopName || 'Delivery Partner';
  const contactRole = agent ? 'Delivery Agent' : seller?.shopName ? 'Seller' : 'Delivery boy';
  const contactMobile = agent?.mobile || seller?.mobile;
  const handleCall = () => {
    if (!contactMobile) {
      showToast('Contact number available nahi hai', 'error');
      return;
    }
    Linking.openURL(`tel:${contactMobile}`).catch(() => {});
  };

  const address = order?.deliveryAddress;
  const addressText = address
    ? [address.address, address.city].filter(Boolean).join(', ') +
      (address.pinCode ? ` - ${address.pinCode}` : '')
    : 'Address, House, Street etc';

  const isClosed = !!(order && CLOSED_STATUS_LABELS[trackingStatus]);
  const currentStep = order ? stepIndexForStatus(trackingStatus) : 0;

  const etaText = formatDate(order?.estimatedDeliveryDate);
  const STEPS = [
    {
      key: 'picking',
      icon: 'moped',
      title: 'Order Picking',
      subtitle: order?.createdAt ? `Placed on ${formatDate(order.createdAt)}` : ' ',
    },
    {
      key: 'ontheway',
      icon: 'truck-delivery-outline',
      title: 'On the way',
      subtitle: etaText ? `Estimated delivery: ${etaText}` : 'Estimated time will update soon',
    },
    {
      key: 'delivered',
      icon: 'map-marker',
      title: 'Delivered',
      subtitle: addressText,
    },
  ];

  return (
    /* Navigator status bar area khud handle karta hai, isliye sirf bottom edge */
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Order Tracking
        </Text>
        <TouchableOpacity onPress={handleCall} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="phone-call" size={moderateScale(19)} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      ) : error || !order ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Order details load nahi ho paaye.</Text>
          <TouchableOpacity onPress={loadOrder} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Delivery OTP — shipped hote hi customer ko sabse upar compact strip me dikhta hai;
                delivery par ye OTP shop/delivery partner ko batana hai */}
            {trackingStatus === 'shipped' && deliveryOtpEntry && (
              <View style={styles.otpBox}>
                <View style={styles.otpTextCol}>
                  <Text style={styles.otpTitle}>Delivery OTP</Text>
                  <Text style={styles.otpHint} numberOfLines={2}>
                    Delivery ke time ye OTP delivery partner / shop ko batayein.
                  </Text>
                </View>
                <Text style={styles.otpValue}>{String(deliveryOtpEntry.otp).split('').join(' ')}</Text>
              </View>
            )}

            {/* Delivery partner pill (figma 55:2440) */}
            <View style={styles.partnerPill}>
              <View style={styles.partnerAvatar}>
                <Image
                  source={require('../../assets/images/delivery-boy.png')}
                  style={styles.partnerAvatarImg}
                />
              </View>
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName} numberOfLines={1}>
                  {contactName}
                </Text>
                <Text style={styles.partnerRole}>{contactRole}</Text>
              </View>
              <TouchableOpacity
                onPress={handleCall}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Feather name="phone" size={moderateScale(22)} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Status timeline (figma 55:2501) */}
            {isClosed ? (
              <View style={styles.closedBanner}>
                <MaterialCommunityIcons
                  name="close-circle-outline"
                  size={moderateScale(22)}
                  color={THEME_COLOR}
                />
                <Text style={styles.closedText}>{CLOSED_STATUS_LABELS[trackingStatus]}</Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {STEPS.map((step, idx) => {
                  const active = idx <= currentStep;
                  return (
                    <View key={step.key}>
                      <View style={styles.stepRow}>
                        <View style={[styles.stepIconBox, !active && styles.stepIconBoxInactive]}>
                          <MaterialCommunityIcons
                            name={step.icon}
                            size={moderateScale(24)}
                            color="#fff"
                          />
                        </View>
                        <View style={styles.stepTextCol}>
                          <Text style={[styles.stepTitle, !active && styles.stepTitleInactive]}>
                            {step.title}
                          </Text>
                          <Text style={styles.stepSubtitle} numberOfLines={2}>
                            {step.subtitle}
                          </Text>
                        </View>
                      </View>
                      {idx < STEPS.length - 1 && (
                        <View
                          style={[styles.stepConnector, idx < currentStep && styles.stepConnectorActive]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            )}

          </ScrollView>

          {/* Fixed footer — Grand Total (figma 55:2503) */}
          <View style={styles.footer}>
            <Text style={styles.footerLabel}>Grand Total</Text>
            <Text style={styles.footerValue}>₹{(order.grandTotal || 0).toFixed(2)}</Text>
          </View>
        </>
      )}
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
  scrollContent: {
    paddingBottom: verticalScale(16),
  },
  /* ---------- DELIVERY PARTNER PILL ---------- */
  partnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(20),
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
    paddingHorizontal: scale(10),
    height: verticalScale(63),
  },
  partnerAvatar: {
    width: moderateScale(47),
    height: moderateScale(47),
    borderRadius: moderateScale(24),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  partnerAvatarImg: {
    width: '86%',
    height: '86%',
    resizeMode: 'contain',
  },
  partnerInfo: {
    flex: 1,
    marginLeft: scale(14),
    marginRight: scale(8),
  },
  partnerName: {
    ...F,
    color: '#fff',
    fontSize: fontScale(15),
    fontWeight: '600',
  },
  partnerRole: {
    ...F,
    color: '#fff',
    fontSize: fontScale(11),
    opacity: 0.9,
    marginTop: verticalScale(1),
  },
  /* ---------- TIMELINE ---------- */
  timeline: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(16),
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconBox: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(10),
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIconBoxInactive: {
    backgroundColor: '#D0D0D0',
  },
  stepTextCol: {
    flex: 1,
    marginLeft: scale(16),
  },
  stepTitle: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#000',
  },
  stepTitleInactive: {
    color: 'rgba(0,0,0,0.4)',
  },
  stepSubtitle: {
    ...F,
    fontSize: fontScale(10),
    color: 'rgba(0,0,0,0.65)',
    marginTop: verticalScale(2),
  },
  stepConnector: {
    width: 0,
    height: verticalScale(38),
    marginLeft: moderateScale(19),
    marginVertical: verticalScale(3),
    borderLeftWidth: 2,
    borderColor: '#D0D0D0',
    borderStyle: 'dashed',
  },
  stepConnectorActive: {
    borderColor: THEME_COLOR,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(16),
    padding: scale(14),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: THEME_COLOR,
    backgroundColor: '#FFF5F4',
  },
  closedText: {
    ...F,
    marginLeft: scale(10),
    fontSize: fontScale(14),
    fontWeight: '700',
    color: THEME_COLOR,
  },
  /* ---------- OTP ---------- */
  otpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(12),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    backgroundColor: '#FFF5F4',
    borderRadius: moderateScale(10),
    borderWidth: 1,
    borderColor: THEME_COLOR,
  },
  otpTextCol: {
    flex: 1,
    marginRight: scale(10),
  },
  otpTitle: {
    ...F,
    fontSize: fontScale(12),
    fontWeight: '600',
    color: '#334A4C',
  },
  otpHint: {
    ...F,
    fontSize: fontScale(10),
    color: 'rgba(0,0,0,0.65)',
    marginTop: verticalScale(2),
  },
  otpValue: {
    ...F,
    fontSize: fontScale(16),
    fontWeight: '700',
    letterSpacing: 1,
    color: THEME_COLOR,
  },
  /* ---------- FOOTER ---------- */
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(11),
    borderTopWidth: 1,
    borderTopColor: '#E4E4E4',
    backgroundColor: '#fff',
  },
  footerLabel: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#2B3233',
  },
  footerValue: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#2B3233',
  },
  /* ---------- STATES ---------- */
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
  },
  errorText: {
    ...F,
    color: '#FF4444',
    fontWeight: '700',
    fontSize: fontScale(13),
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: verticalScale(14),
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(10),
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(8),
  },
  retryText: {
    ...F,
    color: '#fff',
    fontWeight: '700',
  },
});

export default OrderTrackingScreen;
