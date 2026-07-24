import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { fetchAvailableCoupons } from '../../service/couponService';
import { Colors } from '../../themes/Colors';
import { fontScale, moderateScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
const RED = '#EE3E35';
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;

// Bina image wale coupons ke discount-tiles in colors me cycle hote hain
// (mockup: red, photo, black)
const TILE_COLORS = ['#D90000', '#1A1A1A'];

// "6 days remaining" — endDate se; na ho to kuch nahi dikhta
const daysRemaining = (endDate) => {
  if (!endDate) return '';
  const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  if (days < 0) return '';
  if (days === 0) return 'Expires today';
  return `${days} day${days === 1 ? '' : 's'} remaining`;
};

// Left wala discount tile — "10% off" / "₹100 off"; image ho to photo ke
// upar white text overlay hota hai
const DiscountTile = ({ coupon, index }) => {
  const isPercent = coupon.discountType === 'percentage';
  const valueText = isPercent ? `${coupon.discountValue}` : `₹${coupon.discountValue}`;
  const content = (
    <View style={styles.tileTextWrap}>
      <Text style={styles.tileValue}>
        {valueText}
        {isPercent ? <Text style={styles.tilePercent}>%</Text> : null}
      </Text>
      <Text style={styles.tileOff}>off</Text>
    </View>
  );
  if (coupon.image) {
    return (
      <View style={styles.tile}>
        <Image source={{ uri: coupon.image }} style={styles.tileImage} />
        <View style={styles.tileImageShade} />
        {content}
      </View>
    );
  }
  return (
    <View style={[styles.tile, { backgroundColor: TILE_COLORS[index % TILE_COLORS.length] }]}>
      {content}
    </View>
  );
};

// "View Offers/Apply" se khulta hai — promo bottom sheet (mockup: drag handle,
// rounded input + black arrow, "Your Promo Codes" cards with discount tiles)
const PromoModal = ({ visible, onClose, onApply, applying }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualCode, setManualCode] = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    fetchAvailableCoupons()
      .then((result) => {
        setCoupons(result.success ? result.data?.coupons || [] : []);
      })
      .finally(() => setLoading(false));
  }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        {/* Sheet ke bahar tap karne par band */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {/* Manual code — rounded input, right me black circular arrow */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Enter your promo code"
              placeholderTextColor="#B2B9C1"
              autoCapitalize="characters"
              value={manualCode}
              onChangeText={setManualCode}
              onSubmitEditing={() => manualCode.trim() && onApply(manualCode.trim())}
              returnKeyType="go"
            />
            <TouchableOpacity
              style={styles.arrowBtn}
              onPress={() => manualCode.trim() && onApply(manualCode.trim())}
              disabled={applying}
              activeOpacity={0.85}>
              {applying ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <AntDesign name="arrowright" size={moderateScale(16)} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Your Promo Codes</Text>

          {loading ? (
            <ActivityIndicator color={THEME_COLOR} style={styles.loader} />
          ) : (
            <FlatList
              data={coupons}
              keyExtractor={(item) => item._id || item.code}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Abhi koi offer available nahi hai</Text>
              }
              renderItem={({ item, index }) => {
                const remaining = daysRemaining(item.endDate);
                return (
                  <View style={styles.couponCard}>
                    <DiscountTile coupon={item} index={index} />
                    <View style={styles.couponInfo}>
                      <Text style={styles.couponTitle} numberOfLines={1}>
                        {item.title || 'Special offer'}
                      </Text>
                      <Text style={styles.couponCode} numberOfLines={1}>
                        {item.code?.toLowerCase()}
                      </Text>
                      {item.minOrderValue ? (
                        <Text style={styles.couponCondition} numberOfLines={1}>
                          Min order ₹{item.minOrderValue}
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.couponRight}>
                      {remaining ? (
                        <Text style={styles.remainingText}>{remaining}</Text>
                      ) : (
                        <View style={styles.remainingSpacer} />
                      )}
                      <TouchableOpacity
                        style={styles.applyBtn}
                        onPress={() => onApply(item.code)}
                        disabled={applying}
                        activeOpacity={0.85}>
                        <Text style={styles.applyBtnText}>Apply</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: px(24),
    borderTopRightRadius: px(24),
    paddingHorizontal: px(16),
    paddingBottom: px(16),
    maxHeight: '80%',
    elevation: 12,
    shadowColor: '#3F4256',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dragHandle: {
    alignSelf: 'center',
    width: px(44),
    height: px(4),
    borderRadius: px(2),
    backgroundColor: '#D9D9D9',
    marginTop: px(10),
    marginBottom: px(16),
  },
  /* Rounded input + black circular arrow (mockup style) */
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: px(24),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    paddingLeft: px(16),
    paddingRight: px(5),
    height: px(46),
    marginBottom: px(20),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  input: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    color: '#383F4E',
    paddingVertical: 0,
  },
  arrowBtn: {
    width: px(36),
    height: px(36),
    borderRadius: px(18),
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
    marginBottom: px(14),
  },
  loader: {
    marginVertical: px(24),
  },
  emptyText: {
    ...F,
    color: '#888',
    textAlign: 'center',
    marginVertical: px(20),
    fontSize: fontScale(12),
  },
  /* Coupon card — left tile, beech me title/code, right me remaining + Apply */
  couponCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F6',
    borderRadius: px(12),
    padding: px(10),
    marginBottom: px(12),
  },
  tile: {
    width: px(78),
    height: px(78),
    borderRadius: px(8),
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
  },
  tileImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: 'cover',
  },
  tileImageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  tileTextWrap: {
    padding: px(8),
  },
  tileValue: {
    ...F,
    color: '#fff',
    fontSize: fontScale(24),
    fontWeight: '800',
    lineHeight: fontScale(26),
  },
  tilePercent: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '800',
  },
  tileOff: {
    ...F,
    color: '#fff',
    fontSize: fontScale(11),
    fontWeight: '600',
    marginTop: -px(2),
  },
  couponInfo: {
    flex: 1,
    paddingHorizontal: px(12),
  },
  couponTitle: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#1D1F22',
  },
  couponCode: {
    ...F,
    fontSize: fontScale(11),
    color: '#8A8A8F',
    marginTop: px(3),
  },
  couponCondition: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    marginTop: px(2),
  },
  couponRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: px(2),
  },
  remainingText: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
  },
  remainingSpacer: {
    height: px(12),
  },
  applyBtn: {
    backgroundColor: RED,
    borderRadius: px(17),
    paddingHorizontal: px(22),
    height: px(34),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  applyBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(12.5),
    fontWeight: '700',
  },
});

export default PromoModal;
