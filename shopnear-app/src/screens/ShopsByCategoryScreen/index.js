import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import { fetchShopsByCategory } from '../../service/sellerService';
import { imageSource } from '../../utils/media';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const THEME_COLOR = Colors.theme1;

const ShopsByCategoryScreen = ({ route, navigation }) => {
  const categoryId = route?.params?.categoryId;
  const categoryName = route?.params?.categoryName || 'Shops';

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadShops = useCallback(() => {
    if (!categoryId) {
      setError('Category ki id nahi mili');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchShopsByCategory(categoryId)
      .then(res => {
        if (res.success && Array.isArray(res.data?.sellers)) {
          setShops(res.data.sellers);
        } else {
          setShops([]);
          setError(res.message || 'Shops load nahi ho paaye');
        }
      })
      .catch(() => {
        setShops([]);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [categoryId]);

  useEffect(() => {
    loadShops();
  }, [loadShops]);

  const renderShop = ({ item }) => (
    <TouchableOpacity
      style={styles.shopCard}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('SellerProductsScreen', {
          sellerId: item._id,
          shopName: item.shopName,
        })
      }>
      <View style={styles.shopTopRow}>
        <Image
          source={imageSource(item.shopLogo, AppImages.shop)}
          style={styles.shopImage}
        />
        <View style={styles.shopInfo}>
          <View style={styles.shopNameRow}>
            <Text numberOfLines={1} style={styles.shopName}>
              {item.shopName}
            </Text>
            {item.isVerified ? (
              <AntDesign name="checkcircle" size={moderateScale(13)} color="#2ecc71" />
            ) : null}
          </View>
          <View style={styles.shopMetaRow}>
            <Text style={styles.shopMeta}>{item.deliveryTime || '--'}</Text>
            <View style={styles.metaDivider} />
            <Text numberOfLines={1} style={[styles.shopMeta, styles.shopMetaCity]}>
              {item.city || '--'}
            </Text>
            <View style={styles.metaDivider} />
            <MaterialIcons name="local-shipping" size={moderateScale(14)} color="#2F2F2F" />
            <Text style={styles.shopMeta}>
              {' '}
              {item.deliveryCharge ? `₹${item.deliveryCharge}` : 'FREE'}
            </Text>
          </View>
          {item.offerText ? (
            <View style={styles.offerStrip}>
              <Image source={AppImages.dicount} style={styles.offerIcon} />
              <Text numberOfLines={1} style={styles.offerStripText}>
                {item.offerText}
              </Text>
            </View>
          ) : null}
          <View style={styles.shopRatingRow}>
            <AntDesign name="star" size={moderateScale(14)} color="#FFC107" />
            <Text style={styles.shopRatingText}>
              {item.rating || 0}(By {item.totalRatings || 0}+)
            </Text>
          </View>
        </View>
      </View>
      {item.shopDescription || item.address ? (
        <View style={styles.highlightChip}>
          <Text numberOfLines={1} style={styles.highlightChipText}>
            {item.shopDescription || item.address}
          </Text>
        </View>
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
          <TouchableOpacity style={styles.retryBtn} onPress={loadShops}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (shops.length === 0) {
      return (
        <View style={styles.centerBox}>
          <Text style={styles.messageText}>Is category me abhi koi shop nahi hai</Text>
        </View>
      );
    }
    return (
      <FlatList
        data={shops}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.list}
        renderItem={renderShop}
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
          <Text style={styles.headerTitle} numberOfLines={1}>{categoryName}</Text>
          <View style={{ width: scale(40) }} />
        </View>
      </ScreenHeader>
      {renderBody()}
    </View>
  );
};

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
    fontFamily: 'sans-serif',
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
    fontFamily: 'sans-serif',
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
    fontFamily: 'sans-serif',
    fontSize: fontScale(14),
  },
  list: {
    paddingHorizontal: scale(14),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(24),
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(12),
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  shopTopRow: {
    flexDirection: 'row',
  },
  shopImage: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(12),
    backgroundColor: '#F6F6F6',
    resizeMode: 'cover',
  },
  shopInfo: {
    flex: 1,
    marginLeft: scale(12),
    justifyContent: 'center',
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopName: {
    fontSize: fontScale(16),
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    color: '#222',
    marginRight: scale(6),
    flexShrink: 1,
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(4),
    flexWrap: 'wrap',
  },
  shopMeta: {
    fontSize: fontScale(12),
    fontFamily: 'sans-serif',
    color: '#2F2F2F',
  },
  shopMetaCity: {
    maxWidth: scale(90),
  },
  metaDivider: {
    width: 1,
    height: verticalScale(10),
    backgroundColor: '#D0D0D0',
    marginHorizontal: scale(6),
  },
  offerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  offerIcon: {
    width: moderateScale(14),
    height: moderateScale(14),
    marginRight: scale(4),
    resizeMode: 'contain',
  },
  offerStripText: {
    fontSize: fontScale(12),
    fontFamily: 'sans-serif',
    color: '#27AE60',
    fontWeight: '600',
    flexShrink: 1,
  },
  shopRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(6),
  },
  shopRatingText: {
    fontSize: fontScale(12),
    fontFamily: 'sans-serif',
    color: '#2F2F2F',
    marginLeft: scale(4),
  },
  highlightChip: {
    backgroundColor: '#EAF4FF',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    marginTop: verticalScale(10),
  },
  highlightChipText: {
    fontSize: fontScale(12),
    fontFamily: 'sans-serif',
    color: '#2F6FBF',
  },
});

export default ShopsByCategoryScreen;
