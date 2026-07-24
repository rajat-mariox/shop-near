import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { fetchOrders, cancelOrder } from '../../service/orderService';
import { addToCart } from '../../service/cartService';
import { showToast } from '../../utils/toast';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Figma 351:9135 — iOS segmented control: Ongoing / Complete / Review
const TABS = [
  { key: 'ongoing', label: 'Ongoing' },
  { key: 'complete', label: 'Complete' },
  { key: 'review', label: 'Review' },
];

// Tab ke hisaab se empty state ka text (figma 351:9237)
const EMPTY_STATE = {
  ongoing: {
    title: 'No Ongoing Orders!',
    subtitle: 'You don’t have any ongoing orders at this time.',
  },
  complete: {
    title: 'No Completed Orders!',
    subtitle: 'You don’t have any completed orders at this time.',
  },
  review: {
    title: 'No Orders to Review!',
    subtitle: 'Delivered orders will show up here for review.',
  },
};

const OrderScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('ongoing');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reordering, setReordering] = useState(false);

  const fetchOrderList = async () => {
    setLoading(true);
    try {
      let status = '';
      // Ongoing me order ki saari active stages aati hain — COD order 'pending' se
      // shuru hota hai, isliye sirf 'confirmed' maangne par kuch dikhta hi nahi tha
      if (activeTab === 'ongoing') status = 'pending,confirmed,processing,shipped';
      // Complete me delivered ke saath cancelled/returned bhi — design me alag
      // Cancelled tab nahi hai, orders gum na ho jaayein
      else if (activeTab === 'complete') status = 'delivered,cancelled,returned';
      else if (activeTab === 'review') status = 'delivered';
      const result = await fetchOrders({ page: 1, limit: 20, status });
      if (result.success && result.data && Array.isArray(result.data.orders)) {
        setOrders(result.data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderList();
  }, [activeTab]);

  const handleCancelOrder = (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelOrder(orderId);
            if (result.success) {
              fetchOrderList();
            } else {
              showToast(result.message || 'Failed to cancel order', 'error');
            }
          },
        },
      ],
    );
  };

  // Complete tab ka "Order Again" — order ke saare items wapas cart me
  // daal ke Cart tab khol deta hai (figma 351:9533)
  const handleOrderAgain = async (order) => {
    if (reordering) return;
    setReordering(true);
    const products = order.products || [];
    let added = 0;
    for (const p of products) {
      const result = await addToCart({
        productId: p.productId,
        sellerId: p.sellerId,
        quantity: p.quantity || 1,
        selectedColor: p.color ? { name: p.color } : undefined,
        selectedSize: p.size || undefined,
      });
      if (result.success) added += 1;
    }
    setReordering(false);
    if (added > 0) {
      navigation.navigate('Cart');
    } else {
      showToast('Items cart me add nahi ho paaye', 'error');
    }
  };

  const renderOrder = ({ item }) => {
    // API order ke items `products` me bhejta hai aur amount `grandTotal` me
    const firstItem = item.products?.[0] || item.items?.[0] || item;
    const productImage = firstItem.product?.productImage || firstItem.productImage;
    const productName =
      firstItem.product?.productName || firstItem.productName || 'Order Item';
    const extraCount = (item.itemCount || item.products?.length || 1) - 1;
    const price =
      item.grandTotal || item.totalAmount || firstItem.totalPrice || 0;
    const meta =
      [
        firstItem.size ? `Size: ${firstItem.size}` : null,
        firstItem.color ? `Color: ${firstItem.color}` : null,
      ]
        .filter(Boolean)
        .join('  |  ') ||
      item.orderId ||
      `Order #${(item._id || '').slice(-6).toUpperCase()}`;

    // Tab ke hisaab se ek outline action button (figma 351:9434 / 351:9533)
    const action =
      activeTab === 'ongoing'
        ? {
            label: 'Track Order',
            color: '#01A337',
            onPress: () =>
              navigation.navigate('OrderTrackingScreen', { orderId: item._id }),
          }
        : activeTab === 'complete'
          ? {
              label: 'Order Again',
              color: '#01A337',
              onPress: () => handleOrderAgain(item),
            }
          : {
              label: 'Write a Review',
              color: '#6F83E5',
              onPress: () =>
                navigation.navigate('FeedbackScreen', {
                  orderId: item._id,
                  productId:
                    firstItem.product?.productId ||
                    firstItem.productId?._id ||
                    firstItem.productId,
                  productName,
                }),
            };

    return (
      /* Card tap = detail; ongoing me long-press par cancel ka option */
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('OrderTrackingScreen', { orderId: item._id })}
        onLongPress={() => activeTab === 'ongoing' && handleCancelOrder(item._id)}>
        <Image
          source={
            productImage
              ? { uri: productImage }
              : require('../../assets/images/sportswear.png')
          }
          style={styles.productImage}
        />
        <View style={styles.cardContent}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {productName}
            {extraCount > 0 ? ` +${extraCount} more` : ''}
          </Text>
          <Text style={styles.productPrice}>₹ {Number(price).toFixed(2)}</Text>
          <View style={styles.cardBottomRow}>
            <Text style={styles.productDetails} numberOfLines={1}>
              {meta}
            </Text>
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { borderColor: action.color },
                reordering && activeTab === 'complete' && styles.actionBtnDisabled,
              ]}
              disabled={reordering && activeTab === 'complete'}
              onPress={action.onPress}>
              <Text style={[styles.actionBtnText, { color: action.color }]}>
                {action.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);
  const emptyState = EMPTY_STATE[activeTab];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          My Orders
        </Text>
      </View>

      {/* iOS-style segmented control (figma 351:9233) */}
      <View style={styles.segmentBar}>
        {TABS.map((tab, idx) => {
          const isActive = tab.key === activeTab;
          // iOS jaisa: active segment ke bagal wale separators chhipte hain
          const showSeparator =
            idx < TABS.length - 1 && idx !== activeIndex && idx + 1 !== activeIndex;
          return (
            <React.Fragment key={tab.key}>
              <TouchableOpacity
                style={[styles.segment, isActive && styles.segmentActive]}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key)}>
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
              <View style={[styles.separator, !showSeparator && styles.separatorHidden]} />
            </React.Fragment>
          );
        })}
      </View>

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator
          style={{ marginTop: verticalScale(40) }}
          size="large"
          color={THEME_COLOR}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderOrder}
          contentContainerStyle={[
            styles.listContent,
            orders.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            /* Empty state (figma 351:9234) */
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons
                name="text-box-outline"
                size={moderateScale(64)}
                color="#323135"
              />
              <Text style={styles.emptyTitle}>{emptyState.title}</Text>
              <Text style={styles.emptySubtitle}>{emptyState.subtitle}</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
  /* ---------- SEGMENTED CONTROL (figma 351:9233) ---------- */
  segmentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: moderateScale(8),
    borderBottomRightRadius: moderateScale(8),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(7),
  },
  segmentActive: {
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.04)',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  // Centered parent me Android text ki width kam measure karta hai,
  // isliye har label ko poori width di gayi hai
  segmentText: {
    ...F,
    fontSize: fontScale(13),
    color: '#000',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  segmentTextActive: {
    fontWeight: '600',
  },
  separator: {
    width: 1,
    height: verticalScale(12),
    backgroundColor: '#8E8E93',
    opacity: 0.3,
  },
  separatorHidden: {
    opacity: 0,
  },
  /* ---------- LIST ---------- */
  listContent: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(24),
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  /* Figma 351:9338 — cart-item jaisa rounded-20 card, image left */
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    borderWidth: 0.5,
    borderColor: '#FBFBFB',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: verticalScale(20),
    overflow: 'hidden',
  },
  productImage: {
    width: moderateScale(98),
    height: moderateScale(99),
    borderTopLeftRadius: moderateScale(20),
    borderBottomLeftRadius: moderateScale(20),
    backgroundColor: '#FFFBF8',
    resizeMode: 'cover',
  },
  cardContent: {
    flex: 1,
    paddingLeft: scale(13),
    paddingRight: scale(12),
    paddingVertical: verticalScale(14),
    justifyContent: 'space-between',
  },
  productTitle: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#1D1F22',
  },
  productPrice: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#1D1F22',
    marginTop: verticalScale(6),
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: verticalScale(6),
  },
  productDetails: {
    ...F,
    flex: 1,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    marginRight: scale(8),
  },
  // Outline action pill (figma: border #01A337, radius 5, text 10)
  actionBtn: {
    borderWidth: 1,
    borderRadius: moderateScale(5),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
    backgroundColor: '#fff',
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    ...F,
    fontSize: fontScale(10),
    letterSpacing: -0.15,
    textAlign: 'center',
  },
  /* ---------- EMPTY STATE (figma 351:9234) ---------- */
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(40),
    paddingBottom: verticalScale(60),
  },
  emptyTitle: {
    ...F,
    fontSize: fontScale(20),
    fontWeight: '700',
    color: '#323135',
    textAlign: 'center',
    marginTop: verticalScale(24),
  },
  emptySubtitle: {
    ...F,
    fontSize: fontScale(15),
    color: '#68656E',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginTop: verticalScale(8),
    maxWidth: scale(252),
  },
});

export default OrderScreen;
