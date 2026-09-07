import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StandaloneTabBar } from '../../routes/MyBottomTabs';
import { Colors } from '../../themes/Colors';
import { fetchWishlist, removeFromWishlist } from '../../service/wishService';
import { showToast } from '../../utils/toast';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const { width } = Dimensions.get('window');
const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Figma 55:5916 — 2 columns, side margin 16, beech me gap
const GRID_PADDING = scale(16);
const COLUMN_GAP = scale(24);
const CARD_WIDTH = (width - GRID_PADDING * 2 - COLUMN_GAP) / 2;

// Rating stars (figma me green/teal filled stars + count)
const Stars = ({ rating = 0, count = 0 }) => (
  <View style={styles.ratingRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <AntDesign
        key={i}
        name={i <= Math.round(rating) ? 'star' : 'staro'}
        size={moderateScale(10)}
        color={i <= Math.round(rating) ? '#2D9C8E' : '#C4C4C4'}
        style={styles.star}
      />
    ))}
    <Text style={styles.reviewCount}>({count})</Text>
  </View>
);

const WishlistScreen = ({ navigation }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadWishlist = () => {
    setLoading(true);
    fetchWishlist()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setWishlist(res.data);
          setError(null);
        } else {
          setWishlist([]);
          setError(res.message || 'Failed to load wishlist');
        }
      })
      .catch(() => {
        setWishlist([]);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadWishlist, []);

  // Heart tap — optimistic remove, fail par wapas
  const handleRemove = async (item) => {
    const prev = wishlist;
    setWishlist((list) => list.filter((w) => w._id !== item._id));
    const result = await removeFromWishlist({ productId: item.productId });
    if (!result.success) {
      setWishlist(prev);
      showToast(result.message || 'Failed to remove', 'error');
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('ProductDetailScreen', { productId: item.productId })
      }>
      <View style={styles.imageWrapper}>
        {item.productImage ? (
          <Image source={{ uri: item.productImage }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, styles.productImageEmpty]} />
        )}
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={() => handleRemove(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
          <AntDesign name="heart" size={moderateScale(14)} color={THEME_COLOR} />
        </TouchableOpacity>
      </View>
      <Text style={styles.productTitle} numberOfLines={1}>
        {item.productName}
      </Text>
      <Text style={styles.productPrice}>₹ {(item.discountPrice ?? item.price ?? 0).toFixed(2)}</Text>
      <Stars rating={item.rating} count={item.totalRatings} />
    </TouchableOpacity>
  );

  return (
    /* Navigator status bar area khud handle karta hai, isliye sirf bottom edge */
    /* Bottom inset tab bar khud sambhalta hai (figma: wishlist par bhi navbar) */
    <SafeAreaView style={styles.screen} edges={[]}>
      {/* Header */}
      <ScreenHeader style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          My Wishlist
        </Text>
      </ScreenHeader>

      {loading ? (
        <View style={styles.stateBox}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      ) : error ? (
        <View style={styles.stateBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadWishlist} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.grid}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.stateBox}>
              <Text style={styles.emptyText}>Wishlist abhi khaali hai</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
      {/* Profile se aaye hain, isliye Profile tab active */}
      <StandaloneTabBar activeName="Profile" />
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
  grid: {
    paddingHorizontal: GRID_PADDING,
    paddingTop: verticalScale(13),
    paddingBottom: verticalScale(24),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  /* ---------- PRODUCT CARD (figma 55:5880) ---------- */
  card: {
    width: CARD_WIDTH,
    marginBottom: verticalScale(20),
  },
  imageWrapper: {
    width: '100%',
    height: verticalScale(186),
    borderRadius: moderateScale(10),
    overflow: 'hidden',
    backgroundColor: '#F2F2F2',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImageEmpty: {
    backgroundColor: '#F2F2F2',
  },
  // White rounded-square heart button image ke top-right (figma Group347)
  heartBtn: {
    position: 'absolute',
    top: verticalScale(10),
    right: scale(10),
    width: moderateScale(27),
    height: moderateScale(27),
    borderRadius: moderateScale(9),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  productTitle: {
    ...F,
    fontSize: fontScale(12),
    color: '#1D1F22',
    marginTop: verticalScale(14),
    letterSpacing: -0.12,
  },
  productPrice: {
    ...F,
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#1D1F22',
    marginTop: verticalScale(6),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  star: {
    marginRight: scale(3),
  },
  reviewCount: {
    ...F,
    fontSize: fontScale(10),
    color: '#1D1F22',
    marginLeft: scale(3),
  },
  /* ---------- STATES ---------- */
  stateBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(24),
    marginTop: verticalScale(40),
  },
  emptyText: {
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

export default WishlistScreen;
