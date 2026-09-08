import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from './styles';
import AddCardModal from '../../components/AddCardModal';
import { getSavedCards, removeSavedCard } from '../../utils/savedCards';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import {
  createOrder,
  initiatePayment,
  verifyPayment,
  cancelOrder,
} from '../../service/orderService';
import { showToast } from '../../utils/toast';
import { StandaloneTabBar } from '../../routes/MyBottomTabs';
import RazorpayCheckout from 'react-native-razorpay';
import ScreenHeader from '../../components/ScreenHeader';

const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;

// Wallet brands ke logo assets nahi hain — wordmark styled text se banta hai
const BrandMark = ({ type }) => {
  switch (type) {
    case 'paytm':
      return <Text style={[styles.brandText, { color: '#00B9F1' }]}>paytm</Text>;
    case 'phonepe':
      return <Text style={[styles.brandText, { color: '#5F259F' }]}>PhonePe</Text>;
    case 'amazonpay':
      return (
        <Text style={[styles.brandText, styles.brandTextSmall, { color: '#232F3E' }]}>
          amazon <Text style={{ color: '#F90' }}>pay</Text>
        </Text>
      );
    case 'freecharge':
      return (
        <Text style={[styles.brandText, styles.brandTextSmall, { color: '#F7A800' }]}>
          freecharge
        </Text>
      );
    default:
      return null;
  }
};

const WALLETS = [
  { key: 'paytm', label: 'Paytm Wallet & UPI' },
  { key: 'phonepe', label: 'PhonePe' },
  { key: 'amazonpay', label: 'Amazon Pay' },
  { key: 'freecharge', label: 'Freecharge' },
];

export default function PaymentMethodScreen({ navigation, route }) {
  const [loading, setLoading] = useState(false);
  // 'cod' ya online variants ('paytm'/'phonepe'/'amazonpay'/'freecharge'/'card')
  // — cod ke alawa sab Razorpay checkout kholte hain
  // Saved card chunne par 'card:<id>' (device par masked details save hoti hain)
  const [selected, setSelected] = useState('cod');
  const [savedCards, setSavedCards] = useState([]);
  const [addCardVisible, setAddCardVisible] = useState(false);
  const total = route?.params?.total || 0;
  const address = route?.params?.address || null;

  useEffect(() => {
    getSavedCards().then(setSavedCards);
  }, []);

  const isCardMethod = (method) => method === 'card' || String(method).startsWith('card:');
  const savedCardFor = (method) =>
    String(method).startsWith('card:')
      ? savedCards.find((c) => `card:${c.id}` === method)
      : null;

  // Naya card save hote hi list me aa jaata hai aur select ho jaata hai —
  // user seedha Continue dabake Razorpay ke card page par jaa sakta hai
  const handleCardSaved = (card, cards) => {
    setSavedCards(cards);
    setSelected(`card:${card.id}`);
  };

  const handleRemoveCard = (card) => {
    Alert.alert('Remove card', `Remove ${card.brand} card ending ${card.last4}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const next = await removeSavedCard(card.id);
          setSavedCards(next);
          if (selected === `card:${card.id}`) setSelected('card');
        },
      },
    ]);
  };

  // Razorpay checkout ko chune hue option par khol do (card form / wallet).
  // Saved card ke liye sirf naam prefill hota hai — number/CVV store nahi
  // hote, wo user Razorpay ke secure page par bharta hai.
  const razorpayPrefillFor = (method) => {
    if (isCardMethod(method)) {
      const saved = savedCardFor(method);
      return saved ? { method: 'card', name: saved.name } : { method: 'card' };
    }
    if (['paytm', 'phonepe', 'amazonpay', 'freecharge'].includes(method)) {
      return { method: 'wallet', wallet: method };
    }
    return {};
  };

  const handleRazorpayPayment = async (order, method = selected) => {
    // Payment fail/cancel hone par pending order cancel — warna bina payment
    // ke order "placed" dikhta rehta hai (cart backend par intact rehta hai)
    // message null ho to chupchap (user ne khud cancel kiya, popup ki zaroorat nahi)
    const abandonOrder = async (message) => {
      await cancelOrder(order._id);
      if (message) showToast(message, 'error');
    };
    try {
      const paymentResult = await initiatePayment(order._id);
      if (!paymentResult.success) {
        await abandonOrder(paymentResult.message || 'Payment initiation failed');
        return;
      }
      const { razorpayOrderId, amount, currency, keyId } = paymentResult.data;

      const options = {
        description: 'ShopNear Order Payment',
        currency: currency || 'INR',
        key: keyId,
        amount: amount,
        order_id: razorpayOrderId,
        name: 'ShopNear',
        prefill: {
          contact: address?.phone || '',
          ...razorpayPrefillFor(method),
        },
        theme: { color: Colors.theme1 },
        // Cancel/fail hone par Razorpay khud checkout dobara khol deta hai
        // (LAUNCH_MULTIPLE loop) — isi se app band hui jaisi lagti thi
        retry: { enabled: false },
      };

      const paymentData = await RazorpayCheckout.open(options);

      const verifyResult = await verifyPayment({
        razorpayOrderId: paymentData.razorpay_order_id,
        razorpayPaymentId: paymentData.razorpay_payment_id,
        razorpaySignature: paymentData.razorpay_signature,
        orderId: order._id,
      });

      if (verifyResult.success) {
        navigation.navigate('OrderConfirmedScreen', { orderId: order._id });
      } else {
        await abandonOrder(verifyResult.message || 'Payment verification failed');
      }
    } catch (error) {
      // Razorpay dismiss (user cancel) par koi popup nahi; asli failure par chhota saaf message.
      // Razorpay ka raw description JSON jaisa aata hai, use kabhi mat dikhao.
      const text = String(error?.description || error?.message || '').toLowerCase();
      const userCancelled = error?.code === 2 || error?.code === 0 || text.includes('cancel');
      await abandonOrder(userCancelled ? null : 'Payment failed. Please try again.');
    }
  };

  const handleContinue = async (method = selected) => {
    if (loading) return;
    if (!address || !address._id) {
      showToast('Please select a delivery address.', 'error');
      return;
    }
    const paymentMethod = method === 'cod' ? 'cod' : 'online';
    setLoading(true);
    try {
      const result = await createOrder({ addressId: address._id, paymentMethod });
      if (result.success) {
        if (paymentMethod === 'online') {
          await handleRazorpayPayment(result.data, method);
        } else {
          navigation.navigate('OrderConfirmedScreen', { orderId: result.data._id });
        }
      } else {
        showToast(result.message || 'Could not place order.', 'error');
      }
    } catch (e) {
      showToast(e.message || 'Unknown error', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Coral header: pattern + scallop edge ScreenHeader se */}
      <ScreenHeader style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation && navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={px(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Payment Method</Text>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Bill total */}
        <View style={styles.billRow}>
          <Text style={styles.billLabel}>Bill Total</Text>
          <Text style={styles.billValue}>₹{total.toFixed(2)}</Text>
        </View>

        {/* Pay on Delivery */}
        <Text style={styles.sectionTitle}>Pay on Delivery</Text>
        <TouchableOpacity
          style={[styles.codBox, selected === 'cod' && styles.boxSelected]}
          activeOpacity={0.8}
          onPress={() => setSelected('cod')}>
          <Image source={AppImages.cod} style={styles.codIcon} />
          <View style={styles.boxInfo}>
            <Text style={styles.codTitle}>Cash on Delivery (COD)</Text>
            <Text style={styles.codDesc}>
              Online payment recommended to reduce contact between you and
              delivery partner
            </Text>
          </View>
        </TouchableOpacity>

        {/* Wallet */}
        <Text style={styles.sectionTitle}>Wallet</Text>
        {WALLETS.map((wallet) => (
          <TouchableOpacity
            key={wallet.key}
            style={[styles.walletBox, selected === wallet.key && styles.boxSelected]}
            activeOpacity={0.8}
            onPress={() => setSelected(wallet.key)}>
            <View style={styles.walletLogoArea}>
              <BrandMark type={wallet.key} />
            </View>
            <Text style={styles.walletName}>{wallet.label}</Text>
          </TouchableOpacity>
        ))}

        {/* Credit / Debit Cards */}
        <View style={styles.cardsHeaderRow}>
          <Text style={[styles.sectionTitle, styles.sectionTitleInline]}>
            Credit / Debit Cards
          </Text>
          {/* Add Card: form modal kholta hai (number/expiry/CVV/name) — payment
              nahi, sirf card save; payment Continue par Razorpay se hoti hai */}
          <TouchableOpacity
            onPress={() => setAddCardVisible(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.addCard}>+ Add Card</Text>
          </TouchableOpacity>
        </View>

        {/* Saved cards (device par masked details) */}
        {savedCards.map((card) => {
          const key = `card:${card.id}`;
          return (
            <TouchableOpacity
              key={key}
              style={[styles.cardBox, selected === key && styles.boxSelected]}
              activeOpacity={0.8}
              onPress={() => setSelected(key)}>
              <Image source={AppImages.card} style={styles.cardLogo} />
              <View style={styles.boxInfo}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardType}>
                    {card.brand} {'••••'} {card.last4}
                  </Text>
                  <View style={styles.cardExpiryChip}>
                    <Text style={styles.cardExpiryText}>{card.expiry}</Text>
                  </View>
                </View>
                <Text style={styles.cardHolder}>{card.name}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveCard(card)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.cardDeleteBtn}>
                <MaterialIcons name="delete-outline" size={px(20)} color="#B0B0B0" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.cardBox, selected === 'card' && styles.boxSelected]}
          activeOpacity={0.8}
          onPress={() => setSelected('card')}>
          <Image source={AppImages.card} style={styles.cardLogo} />
          <View style={styles.boxInfo}>
            <Text style={styles.cardType}>
              {savedCards.length ? 'Other Credit / Debit Card' : 'Credit / Debit Card'}
            </Text>
            <Text style={styles.cardHolder}>
              Card details agle step par secure Razorpay page me bharein
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      <AddCardModal
        visible={addCardVisible}
        onClose={() => setAddCardVisible(false)}
        onSaved={handleCardSaved}
      />

      {/* Continue */}
      <TouchableOpacity
        style={styles.continueBtn}
        onPress={() => handleContinue()}
        disabled={loading}
        activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.continueBtnText}>Continue</Text>
        )}
      </TouchableOpacity>
      {/* Checkout flow (Cart se aaye) me Cart, Profile se aaye to Profile tab active */}
      <StandaloneTabBar activeName={route?.params?.cartItems ? 'Cart' : 'Profile'} />
    </View>
  );
}
