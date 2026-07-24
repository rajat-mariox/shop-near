import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { fetchCartList, removeFromCart, updateCartItemQty } from '../../service/cartService';
import { applyCoupon, removeCoupon } from '../../service/couponService';
import { listUserAddresses } from '../../service/userAddress';
import PromoModal from './PromoModal';
import AppliedCouponModal from './AppliedCouponModal';
import { showToast } from '../../utils/toast';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../themes/Colors';
import { fontScale, moderateScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
// Figma frame 402dp (node 50:650 "Your Cart")
const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;
// OEM system fonts par shrink-wrap text ke kate hue characters ka fix
const F = { fontFamily: 'sans-serif' };

// Dashed divider — Android par dashed line ke liye border+radius ka trick
const DashedLine = () => <View style={styles.dashedLine} />;

// Figma: rounded-20 card, image left, naam + ₹price + size/color, qty pill
const CartItem = ({ item, onQtyChange, onRemove }) => (
  <View style={styles.cartItem}>
    {item?.image ? (
      <Image source={{ uri: item.image }} style={styles.cartItemImage} />
    ) : (
      <View style={[styles.cartItemImage, styles.cartItemImageEmpty]} />
    )}
    <View style={styles.cartItemInfo}>
      <Text numberOfLines={1} style={styles.cartItemName}>
        {item.name}
      </Text>
      <Text style={styles.cartItemPrice}>₹ {item.price.toFixed(2)}</Text>
      <Text numberOfLines={1} style={styles.cartItemMeta}>
        {[item.size ? `Size: ${item.size}` : null, item.color ? `Color: ${item.color}` : null]
          .filter(Boolean)
          .join('  |  ') || ' '}
      </Text>
    </View>
    <View style={styles.cartItemRight}>
      <TouchableOpacity
        onPress={() => onRemove(item.id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Feather name="trash-2" size={moderateScale(15)} color="#C5C5C5" />
      </TouchableOpacity>
      <View style={styles.qtyPill}>
        <TouchableOpacity
          onPress={() => onQtyChange(item.id, -1)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={styles.qtySign}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.qty}</Text>
        <TouchableOpacity
          onPress={() => onQtyChange(item.id, 1)}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
          <Text style={styles.qtySign}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const CartScreen = ({ navigation }) => {
  const [items, setItems] = useState([]);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartError, setCartError] = useState(false);
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [promoVisible, setPromoVisible] = useState(false);
  const [applying, setApplying] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  // Focus listener stale closure rakhta hai, isliye ref se track hota hai
  // ki pehla load ho chuka ya nahi
  const hasLoadedRef = React.useRef(false);

  const loadCart = () => {
    // Loading sirf pehli baar dikhta hai — focus par wapas aane par purana
    // data dikhta rehta hai aur naya chupchap update ho jaata hai (no flash)
    setLoading(!hasLoadedRef.current);
    setCartError(false);
    fetchCartList()
      .then(res => {
        if (res.success && res.data && Array.isArray(res.data.items)) {
          // Purane cart items me color/size object ho sakte hain — naam nikaal lo
          const asText = (v) =>
            v && typeof v === 'object' ? v.name || v.label || v.code || '' : v || '';
          const apiItems = res.data.items.map(item => ({
            id: item._id,
            name: item.product?.productName || 'Product',
            price: item.discountPrice || item.price || 0,
            size: asText(item.selectedSize),
            color: asText(item.selectedColor),
            image: item.product?.productImage || '',
            qty: item.quantity || 1,
          }));
          setItems(apiItems);
          hasLoadedRef.current = true;
        } else if (!res.success) {
          setCartError(true);
        }
      })
      .catch(() => setCartError(true))
      .finally(() => setLoading(false));
  };

  const loadAddress = () => {
    // Address card par "Loading..." sirf pehli baar — switch/change ke baad
    // purana address dikhta rehta hai jab tak naya nahi aa jaata
    listUserAddresses()
      .then(res => {
        if (res.success && Array.isArray(res.addresses)) {
          const selected = res.addresses.find(a => a.isSelected);
          // Selected nahi to pehla address hi dikha do
          setAddress(selected || res.addresses[0] || null);
        }
      })
      .catch(() => {})
      .finally(() => setAddressLoading(false));
  };

  useEffect(() => {
    loadCart();
    loadAddress();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCart();
      loadAddress();
    });
    return () => unsubscribe && unsubscribe();
  }, [navigation]);

  const handleQtyChange = async (id, delta) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.qty + delta);
    setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: newQty } : i)));
    const result = await updateCartItemQty(id, newQty);
    if (!result.success) {
      setItems(prev => prev.map(i => (i.id === id ? { ...i, qty: item.qty } : i)));
      showToast(result.message || 'Failed to update', 'error');
    }
  };

  const handleRemove = async (id) => {
    const result = await removeFromCart(id);
    if (result.success) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      showToast(result.message || 'Failed to remove', 'error');
    }
  };

  const handleApplyCoupon = async (code) => {
    setApplying(true);
    const result = await applyCoupon(code);
    setApplying(false);
    if (result.success) {
      setAppliedCoupon(code);
      // Backend discountAmount naam se bhejta hai (CartService.applyCoupon)
      setDiscount(result.data?.discountAmount || 0);
      setPromoVisible(false);
      // Toast ki jagah figma wala "Applied Coupons" success popup
      setSuccessVisible(true);
    } else {
      showToast(result.message || 'Invalid coupon', 'error');
    }
  };

  const handleRemoveCoupon = async () => {
    const result = await removeCoupon();
    if (result.success) {
      setAppliedCoupon(null);
      setDiscount(0);
    }
  };

  const handleCheckout = () => {
    // Address nahi hai to pehle address bharwao (SavedAddress khaali list par
    // seedha add-address form khol deta hai)
    if (!address) {
      showToast('Pehle delivery address add karo', 'error');
      navigation.navigate('SavedAddress', { from: 'cart' });
      return;
    }
    navigation.navigate('PaymentMethod', {
      cartItems: items,
      subTotal,
      gst,
      discount,
      total: grandTotal,
      address,
    });
  };

  const subTotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const gst = +(subTotal * 0.18).toFixed(2);
  const grandTotal = subTotal + gst - discount;

  // Address card — figma: coral border, check icon, "Delivery at (Home)", Change
  const addressCard = (
    <View style={styles.addressCard}>
      {addressLoading ? (
        <Text style={styles.addressText}>Loading address...</Text>
      ) : address ? (
        <>
          <View style={styles.addressTopRow}>
            <AntDesign name="checkcircleo" size={moderateScale(17)} color={THEME_COLOR} />
            <Text style={styles.addressTitle}>
              Delivery at ({address.addressType || 'Home'})
            </Text>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => navigation.navigate('SavedAddress', { from: 'cart' })}>
              <Feather name="edit-2" size={moderateScale(12)} color={THEME_COLOR} />
              <Text style={styles.changeText}> Change</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.addressText}>
            {address.address}, {address.city}, {address.state} - {address.pinCode}.
            {address.mobile ? `  +91 ${address.mobile}` : ''}
          </Text>
        </>
      ) : (
        <View style={styles.addressTopRow}>
          <Feather name="map-pin" size={moderateScale(16)} color={THEME_COLOR} />
          <Text style={styles.addressTitle}>No delivery address</Text>
          <TouchableOpacity
            style={styles.changeBtn}
            onPress={() => navigation.navigate('SavedAddress', { from: 'cart' })}>
            <Text style={styles.changeText}>Add Address</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Offers + bill — list ke footer me, taaki sab ek saath scroll ho
  const listFooter = (
    <>
      <Text style={styles.offersLabel}>Offers</Text>
      <View style={styles.offerBox}>
        {appliedCoupon ? (
          <>
            <Text style={styles.offerApplied} numberOfLines={1}>
              {appliedCoupon} applied {discount > 0 ? `(−₹${discount.toFixed(2)})` : ''}
            </Text>
            <TouchableOpacity onPress={handleRemoveCoupon}>
              <Text style={styles.offerLink}>Remove</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.offerPlaceholder}>Select a promo code</Text>
            <TouchableOpacity onPress={() => setPromoVisible(true)}>
              <Text style={styles.offerLink}>View Offers/Apply</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.billCard}>
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Sub Total</Text>
          <Text style={styles.billValue}>₹ {subTotal.toFixed(2)}</Text>
        </View>
        <DashedLine />
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>GST (18%)</Text>
          <Text style={styles.billValue}>₹ {gst.toFixed(2)}</Text>
        </View>
        <DashedLine />
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Offer / Coupon</Text>
          <Text style={[styles.billValue, discount > 0 && styles.billDiscount]}>
            {discount > 0 ? `−₹ ${discount.toFixed(2)}` : '₹ 00.00'}
          </Text>
        </View>
        <DashedLine />
        <View style={styles.billRow}>
          <Text style={styles.grandLabel}>Grand Total</Text>
          <Text style={styles.grandValue}>₹ {grandTotal.toFixed(2)}</Text>
        </View>
      </View>
    </>
  );

  return (
    /* Navigator upar status bar ki jagah khud bhar deta hai, isliye sirf bottom edge */
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Your Cart
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
          <AntDesign name="hearto" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateText}>Loading cart...</Text>
        </View>
      ) : cartError ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>
            Couldn't load your cart. Please check your connection.
          </Text>
          <TouchableOpacity onPress={loadCart} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <CartItem item={item} onQtyChange={handleQtyChange} onRemove={handleRemove} />
          )}
          ListHeaderComponent={addressCard}
          ListFooterComponent={items.length > 0 ? listFooter : null}
          ListEmptyComponent={
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>Your cart is empty</Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Confirm & Checkout */}
      <TouchableOpacity
        style={[styles.checkoutBtn, items.length === 0 && styles.checkoutBtnDisabled]}
        disabled={items.length === 0}
        onPress={handleCheckout}
        activeOpacity={0.85}>
        <Text style={styles.checkoutText}>Confirm & Checkout</Text>
      </TouchableOpacity>

      <PromoModal
        visible={promoVisible}
        onClose={() => setPromoVisible(false)}
        onApply={handleApplyCoupon}
        applying={applying}
      />

      <AppliedCouponModal
        visible={successVisible}
        onClose={() => setSuccessVisible(false)}
        code={appliedCoupon}
        discount={discount}
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
    paddingHorizontal: px(14),
    paddingVertical: px(14),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: px(10),
  },
  iconButton: {
    marginLeft: px(14),
  },
  listContent: {
    paddingHorizontal: px(16),
    paddingTop: px(12),
    paddingBottom: px(16),
  },
  /* ---------- ADDRESS CARD (figma 53:6223) ---------- */
  addressCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: px(10),
    paddingHorizontal: px(12),
    paddingVertical: px(10),
    marginBottom: px(12),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  addressTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#334A4C',
    marginLeft: px(9),
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeText: {
    ...F,
    color: THEME_COLOR,
    fontSize: fontScale(12),
    fontWeight: '600',
  },
  addressText: {
    ...F,
    fontSize: fontScale(11),
    lineHeight: fontScale(16),
    color: '#334A4C',
    marginTop: px(6),
  },
  /* ---------- CART ITEM (figma 52:4374) ---------- */
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: px(20),
    borderWidth: 0.5,
    borderColor: '#FBFBFB',
    marginBottom: px(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  cartItemImage: {
    width: px(98),
    height: px(99),
    borderTopLeftRadius: px(20),
    borderBottomLeftRadius: px(20),
    resizeMode: 'cover',
  },
  cartItemImageEmpty: {
    backgroundColor: '#FFFBF8',
  },
  cartItemInfo: {
    flex: 1,
    paddingLeft: px(13),
    paddingVertical: px(14),
  },
  cartItemName: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#1D1F22',
  },
  cartItemPrice: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#1D1F22',
    marginTop: px(7),
  },
  cartItemMeta: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    marginTop: px(8),
  },
  cartItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: px(12),
    paddingRight: px(14),
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    borderRadius: px(20),
    paddingHorizontal: px(9),
    paddingVertical: px(2),
  },
  qtySign: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: 'rgba(0,0,0,0.55)',
    paddingHorizontal: px(2),
  },
  qtyText: {
    ...F,
    fontSize: fontScale(12),
    fontWeight: '700',
    color: 'rgba(0,0,0,0.6)',
    marginHorizontal: px(9),
  },
  /* ---------- OFFERS (figma 53:6240) ---------- */
  offersLabel: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#334A4C',
    marginTop: px(10),
    marginBottom: px(6),
  },
  offerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7E5',
    borderWidth: 1,
    borderColor: '#FFAC00',
    borderRadius: px(10),
    paddingHorizontal: px(16),
    paddingVertical: px(15),
    marginBottom: px(12),
  },
  offerPlaceholder: {
    ...F,
    fontSize: fontScale(13),
    color: 'rgba(43, 50, 51, 0.5)',
  },
  offerApplied: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#1DBF73',
    marginRight: px(8),
  },
  offerLink: {
    ...F,
    fontSize: fontScale(12),
    color: '#EE3E35',
  },
  /* ---------- BILL (figma 53:4425) ---------- */
  billCard: {
    backgroundColor: '#fff',
    borderRadius: px(10),
    paddingHorizontal: px(16),
    paddingVertical: px(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
    marginBottom: px(8),
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(10),
  },
  billLabel: {
    ...F,
    fontSize: fontScale(13),
    color: '#2B3233',
  },
  billValue: {
    ...F,
    fontSize: fontScale(13),
    color: '#2B3233',
  },
  billDiscount: {
    color: '#1DBF73',
    fontWeight: '600',
  },
  grandLabel: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#2B3233',
  },
  grandValue: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#2B3233',
  },
  dashedLine: {
    height: 1,
    borderWidth: 0.6,
    borderColor: '#E4E4E4',
    borderStyle: 'dashed',
    borderRadius: 1,
  },
  /* ---------- CHECKOUT ---------- */
  checkoutBtn: {
    backgroundColor: THEME_COLOR,
    borderRadius: px(8),
    marginHorizontal: px(16),
    marginBottom: px(12),
    paddingVertical: px(13),
    alignItems: 'center',
  },
  checkoutBtnDisabled: {
    opacity: 0.5,
  },
  checkoutText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
  /* ---------- STATES ---------- */
  stateBox: {
    alignItems: 'center',
    marginTop: px(40),
    paddingHorizontal: px(24),
  },
  stateText: {
    ...F,
    color: '#888',
    fontSize: fontScale(13),
  },
  errorText: {
    ...F,
    color: '#FF4444',
    fontWeight: '700',
    fontSize: fontScale(13),
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: px(14),
    paddingHorizontal: px(20),
    paddingVertical: px(10),
    backgroundColor: THEME_COLOR,
    borderRadius: px(8),
  },
  retryText: {
    ...F,
    color: '#fff',
    fontWeight: '700',
  },
});

export default CartScreen;
