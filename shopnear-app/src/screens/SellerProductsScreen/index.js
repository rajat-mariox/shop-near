import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import { fetchProductsByCategory, fetchProductsByBrand } from '../../service/productService';
import { imageSource } from '../../utils/media';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const { width } = Dimensions.get('window');
const THEME_COLOR = Colors.theme1;

const SellerProductsScreen = ({ route, navigation }) => {
  const sellerId = route?.params?.sellerId;
  // Brand mode: Home ke "Popular Brand" tile se aaye to us brand ke products
  const brandId = route?.params?.brandId;
  const shopName = route?.params?.shopName || route?.params?.brandName || 'Shop';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(() => {
    if (!sellerId && !brandId) {
      setError('Shop ki id nahi mili');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const request = brandId ? fetchProductsByBrand(brandId) : fetchProductsByCategory(sellerId);
    request
      .then(res => {
        if (res.success && Array.isArray(res.data?.products)) {
          setProducts(res.data.products);
        } else {
          setProducts([]);
          setError(res.message || 'Products load nahi ho paaye');
        }
      })
      .catch(() => {
        setProducts([]);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [sellerId, brandId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ProductDetailScreen', { productId: item._id })}>
      <View style={styles.imageWrapper}>
        <Image
          source={imageSource(item.productImage, AppImages.shirt)}
          style={styles.productImage}
        />
        {!item.inStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}
      </View>
      <Text style={styles.productTitle} numberOfLines={2}>{item.productName}</Text>
      {/* Price aur strike-through ek hi Text me hain — alag Text row me rakhne par
          Android unki width kam measure karke digits kaat deta hai */}
      <Text style={styles.productPrice}>
        ₹ {item.discountPrice || item.price}
        {item.discountPrice && item.discountPrice < item.price ? (
          <Text style={styles.strikePrice}>{'   '}₹ {item.price}</Text>
        ) : null}
      </Text>
      {item.discountPercent > 0 ? (
        <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
      ) : null}
    </TouchableOpacity>
  );

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      );
    }
    if (error) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.messageText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadProducts}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (products.length === 0) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.messageText}>
            {brandId ? 'Is brand ka abhi koi product nahi hai' : 'Is shop me abhi koi product nahi hai'}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={products}
        keyExtractor={item => item._id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ScreenHeader style={styles.headerWrapper}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation && navigation.goBack()}>
            <AntDesign name="arrowleft" size={moderateScale(24)} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{shopName}</Text>
          <View style={{ width: scale(40) }} />
        </View>
      </ScreenHeader>
      {renderBody()}
    </View>
  );
};

const CARD_WIDTH = (width - 48) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    position: 'relative',
    backgroundColor: THEME_COLOR,
      },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: verticalScale(120),
    opacity: 0.18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(14),
    zIndex: 2,
  },
  headerWave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: verticalScale(24),
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    zIndex: 1,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: fontScale(20),
    fontWeight: 'bold',
    marginLeft: scale(16),
    textAlign: 'center',
  },
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(24),
  },
  messageText: {
    color: Colors.BLACK4,
    fontSize: fontScale(14),
    textAlign: 'center',
    marginBottom: verticalScale(12),
  },
  retryBtn: {
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(22),
    paddingVertical: verticalScale(9),
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontScale(14),
  },
  grid: {
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(10),
  },
  card: {
    backgroundColor: '#F6F6F6',
    borderRadius: moderateScale(18),
    margin: moderateScale(8),
    width: CARD_WIDTH,
    paddingHorizontal: scale(10),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(14),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    minHeight: verticalScale(230),
    // 'flex-start' rakhne par Android text ki width kam measure karta hai
    // aur naam/price ke aakhri characters kat jaate hain
    alignItems: 'stretch',
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: moderateScale(14),
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: verticalScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: moderateScale(120),
    height: moderateScale(120),
    aspectRatio: 1,
    borderRadius: moderateScale(14),
    resizeMode: 'contain',
    backgroundColor: '#fff',
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingVertical: verticalScale(4),
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#fff',
    fontSize: fontScale(11),
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  productTitle: {
    fontSize: fontScale(14),
    color: '#222',
    fontWeight: '600',
    marginBottom: verticalScale(6),
    marginTop: verticalScale(2),
    letterSpacing: 0.1,
    alignSelf: 'stretch',
  },
  productPrice: {
    fontSize: fontScale(17),
    color: '#222',
    fontWeight: 'bold',
    alignSelf: 'stretch',
  },
  strikePrice: {
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    fontSize: fontScale(13),
  },
  discountText: {
    color: '#27AE60',
    fontSize: fontScale(12),
    fontWeight: '600',
    marginTop: verticalScale(2),
    alignSelf: 'stretch',
  },
});

export default SellerProductsScreen;
