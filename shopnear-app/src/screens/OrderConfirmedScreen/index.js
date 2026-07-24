import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SvgXml } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchOrderById } from '../../service/orderService';
import { SHARE_OFFER_SVG } from '../../assets/vector/shareOffer';
import { showToast } from '../../utils/toast';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
const RED = '#EE3E35';
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

const SHARE_MESSAGE =
  'Hey! Maine abhi ShopNear se order kiya — apne aas-paas ki shops se ghar baithe shopping karo. Try karo!';

// "November 5, 2020 | 12:20p" — figma format
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const formatOrderDate = (iso) => {
  if (!iso) return '-';
  const d = new Date(iso);
  if (isNaN(d)) return '-';
  const h24 = d.getHours();
  const h12 = h24 % 12 || 12;
  const mins = String(d.getMinutes()).padStart(2, '0');
  const ap = h24 >= 12 ? 'p' : 'a';
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} | ${h12}:${mins}${ap}`;
};

// Dashed divider — Android par dashed border ka trick (CartScreen jaisa)
const DashedLine = () => <View style={styles.dashedLine} />;

// Label bold + value regular ek hi line me (figma "Order Date: November 5...")
const InfoRow = ({ label, value }) => (
  <Text style={styles.infoText}>
    <Text style={styles.infoLabel}>{label}: </Text>
    {value}
  </Text>
);

// Order Confirmed — figma 54:1837. Screen puri tarah backend driven hai:
// sirf orderId param se aata hai, baaki sab GET /user/orders/:orderId se.
const OrderConfirmedScreen = ({ navigation, route }) => {
  const orderId = route?.params?.orderId || route?.params?.order?._id;
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

  // Order complete — back se payment flow par wapas nahi, seedha Home
  const goHome = () => navigation.navigate('Home');

  // Header ka phone icon — pehle seller ki shop ko call
  const sellerMobile = order?.products?.find((p) => p.seller?.mobile)?.seller.mobile;
  const handleCall = () => {
    if (!sellerMobile) {
      showToast('Shop ka number available nahi hai', 'error');
      return;
    }
    Linking.openURL(`tel:${sellerMobile}`).catch(() => {});
  };

  const handleWhatsapp = () => {
    Linking.openURL(`whatsapp://send?text=${encodeURIComponent(SHARE_MESSAGE)}`).catch(() =>
      // WhatsApp installed nahi to system share sheet
      Share.share({ message: SHARE_MESSAGE }).catch(() => {})
    );
  };
  const handleFacebookShare = () => {
    Share.share({ message: SHARE_MESSAGE }).catch(() => {});
  };

  const address = order?.deliveryAddress;
  const addressText = address
    ? [address.address, address.city, address.state].filter(Boolean).join(', ') +
      (address.pinCode ? ` - ${address.pinCode}` : '')
    : '-';
  const phoneText = address?.mobile || order?.customer?.phone || '-';
  const paymentText =
    order?.paymentMode === 'cod' ? 'Cash On Delivery' : 'Online (Paid)';

  return (
    /* Navigator status bar area khud handle karta hai, isliye sirf bottom edge */
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={goHome} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Order Confirmed
        </Text>
        <TouchableOpacity onPress={handleCall} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="phone-call" size={moderateScale(19)} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator color={THEME_COLOR} size="large" />
        </View>
      ) : error || !order ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>Order details load nahi ho paaye.</Text>
          <TouchableOpacity onPress={loadOrder} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Success card */}
          <View style={[styles.card, styles.successCard]}>
            <AntDesign name="checkcircleo" size={moderateScale(56)} color="#34C759" />
            <Text style={styles.successText}>Your Order is Successful</Text>
            <Text style={styles.orderIdText}>Order Id: #{order.orderId || order._id}</Text>
          </View>

          {/* Order Information */}
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Order Information</Text>
              <TouchableOpacity
                style={styles.trackBtn}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate('OrderTrackingScreen', { orderId: order._id })
                }>
                <Text style={styles.trackBtnText}>Track</Text>
              </TouchableOpacity>
            </View>
            <InfoRow label="Order Date" value={formatOrderDate(order.createdAt)} />
            <InfoRow label="Payment Method" value={paymentText} />
            <InfoRow label="Address" value={addressText} />
            <InfoRow label="Phone" value={phoneText} />
          </View>

          {/* Invoice Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Invoice Details</Text>
            <DashedLine />
            {(order.products || []).map((item) => (
              <View style={styles.invoiceRow} key={item._id}>
                <Text style={styles.invoiceName} numberOfLines={1}>
                  {item.productName}
                </Text>
                <Text style={styles.invoiceQty}>x {item.quantity}</Text>
                <Text style={styles.invoiceValue}>₹{(item.totalPrice || 0).toFixed(2)}</Text>
              </View>
            ))}
            <DashedLine />
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceName}>Subtotal</Text>
              <Text style={styles.invoiceValue}>₹{(order.subtotal || 0).toFixed(2)}</Text>
            </View>
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceName}>GST</Text>
              <Text style={styles.invoiceValue}>₹{(order.taxAmount || 0).toFixed(2)}</Text>
            </View>
            {order.shippingCost > 0 && (
              <View style={styles.invoiceRow}>
                <Text style={styles.invoiceName}>Delivery Charge</Text>
                <Text style={styles.invoiceValue}>₹{order.shippingCost.toFixed(2)}</Text>
              </View>
            )}
            <View style={styles.invoiceRow}>
              <Text style={styles.invoiceName}>Discount (-)</Text>
              <Text style={styles.invoiceValue}>
                - ₹{(order.couponDiscount || 0).toFixed(2)}
              </Text>
            </View>
            <DashedLine />
            <View style={styles.invoiceRow}>
              <Text style={styles.grandLabel}>Grand Total</Text>
              <Text style={styles.grandValue}>₹{(order.grandTotal || 0).toFixed(2)}</Text>
            </View>
          </View>

          {/* Share card — figma 53:5088 */}
          <View style={styles.shareCard}>
            <View style={styles.shareTextCol}>
              <Text style={styles.shareTitle}>
                Share with Friends and get exciting offers!
              </Text>
              <Text style={styles.shareText}>
                Help us spread the word by sharing our website with your friends and
                followers on social media!
              </Text>
            </View>
            <View style={styles.shareIllustration}>
              <SvgXml xml={SHARE_OFFER_SVG} width="100%" height="100%" />
            </View>
            <View style={styles.shareBtnRow}>
              <TouchableOpacity
                style={[styles.shareBtn, styles.facebookBtn]}
                onPress={handleFacebookShare}
                activeOpacity={0.85}>
                <FontAwesome name="facebook" size={moderateScale(20)} color="#fff" />
                <Text style={styles.shareBtnText}>Facebook</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareBtn, styles.whatsappBtn]}
                onPress={handleWhatsapp}
                activeOpacity={0.85}>
                <FontAwesome name="whatsapp" size={moderateScale(21)} color="#fff" />
                <Text style={styles.shareBtnText}>Whatsapp</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F2F2',
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
    padding: scale(16),
    paddingBottom: verticalScale(24),
  },
  /* ---------- CARDS ---------- */
  card: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(12),
    marginBottom: verticalScale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: verticalScale(24),
  },
  successText: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
    marginTop: verticalScale(14),
  },
  orderIdText: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: THEME_COLOR,
    marginTop: verticalScale(5),
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#334A4C',
    marginBottom: verticalScale(6),
  },
  trackBtn: {
    backgroundColor: RED,
    borderRadius: moderateScale(8),
    width: scale(76),
    height: verticalScale(31),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
  },
  trackBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  infoText: {
    ...F,
    fontSize: fontScale(12),
    lineHeight: fontScale(18),
    color: '#334A4C',
    marginTop: verticalScale(5),
  },
  infoLabel: {
    fontWeight: '700',
  },
  /* ---------- INVOICE ---------- */
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(4.5),
  },
  invoiceName: {
    ...F,
    flex: 1,
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#2B3233',
  },
  invoiceQty: {
    ...F,
    width: scale(50),
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#2B3233',
    textAlign: 'center',
  },
  invoiceValue: {
    ...F,
    minWidth: scale(70),
    fontSize: fontScale(11),
    fontWeight: '600',
    color: '#2B3233',
    textAlign: 'right',
  },
  grandLabel: {
    ...F,
    flex: 1,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#2B3233',
  },
  grandValue: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#2B3233',
  },
  dashedLine: {
    height: 1,
    borderWidth: 0.6,
    borderColor: '#E4E4E4',
    borderStyle: 'dashed',
    borderRadius: 1,
    marginVertical: verticalScale(6),
  },
  /* ---------- SHARE CARD (figma 53:5088) ---------- */
  shareCard: {
    backgroundColor: '#F6FAF8',
    borderRadius: moderateScale(10),
    padding: scale(15),
    marginBottom: verticalScale(10),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
  },
  shareTextCol: {
    paddingRight: scale(105),
  },
  shareTitle: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#233334',
  },
  shareText: {
    ...F,
    fontSize: fontScale(13),
    lineHeight: fontScale(20),
    color: '#2B3233',
    marginTop: verticalScale(8),
  },
  shareIllustration: {
    position: 'absolute',
    top: verticalScale(15),
    right: scale(10),
    width: moderateScale(99),
    height: moderateScale(99),
  },
  shareBtnRow: {
    flexDirection: 'row',
    gap: scale(12),
    marginTop: verticalScale(16),
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: verticalScale(50),
    borderRadius: moderateScale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  facebookBtn: {
    backgroundColor: '#4871C0',
  },
  whatsappBtn: {
    backgroundColor: '#25D366',
  },
  shareBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(15),
    fontWeight: '600',
    marginLeft: scale(10),
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

export default OrderConfirmedScreen;
