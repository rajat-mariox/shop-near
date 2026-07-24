import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import { fetchProductDetail, fetchProductRatings } from '../../service/productService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addToCart } from '../../service/cartService';
import { addToWishlist } from '../../service/wishService';
import { showToast } from '../../utils/toast';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
// Accept productId as prop (from navigation)
const ProductDetailScreen = ({ route, navigation }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Color and size state
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  // Wishlist state
  const [isWishlisted, setIsWishlisted] = useState(false);
  // Reviews (ratings collection se — order deliver hone ke baad diye gaye reviews)
  const [reviews, setReviews] = useState(null);

  // Get productId from navigation params
  const productId = route?.params?.productId;

  useEffect(() => {
    if (!productId) return;
    fetchProductRatings(productId)
      .then((result) => {
        if (result.success && result.data) setReviews(result.data);
      })
      .catch(() => {});
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    fetchProductDetail(productId)
      .then(result => {
        if (result.success && result.data) {
          setProduct(result.data);
          // Set default color/size if available
          if (result.data.colors && result.data.colors.length > 0) {
            setSelectedColor(result.data.colors[0].name);
          }
          if (result.data.sizes && result.data.sizes.length > 0) {
            setSelectedSize(result.data.sizes[0].label);
          }
          setError(null);
        } else {
          setProduct(null);
          setError(result.message || 'Failed to load product');
        }
      })
      .catch(() => {
        setProduct(null);
        setError('Network error');
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const handleScroll = (event) => {
    const index = Math.round(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    setCarouselIndex(index);
  };

  const [cartLoading, setCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  // goToCart = true (Buy Now) par cart khul jaata hai, warna user product par hi rehta hai
  const handleAddToCart = async (goToCart = false) => {
    if (!product) return;
    setCartLoading(true);
    try {
      const res = await addToCart({
        productId: product._id,
        sellerId: product.seller?._id,
        quantity,
        selectedColor: product.colors && selectedColor
          ? product.colors.find(c => c.name === selectedColor)
          : undefined,
        selectedSize,
      });
      if (res.success) {
        if (goToCart) {
          setTimeout(() => {
            navigation.navigate('Home', { screen: 'Cart' });
          }, 400);
        }
      } else {
        showToast(res.message || 'Failed to add to cart');
      }
    } catch (e) {
      showToast('Error adding to cart');
    } finally {
      setCartLoading(false);
    }
  };

  const handleBuyNow = () => handleAddToCart(true);

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const handleToggleWishlist = async () => {
    if (!product) return;
    if (wishlistLoading) return;
    setWishlistLoading(true);
    try {
      const res = await addToWishlist({ productId: product._id });
      if (res.success) {
        setIsWishlisted(true);
      } else {
        showToast(res.message || 'Failed to add to wishlist');
      }
    } catch (e) {
      showToast('Error adding to wishlist');
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    /* Navigator upar status bar ki jagah khud bhar deta hai, isliye sirf bottom edge */
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['bottom']}>
      {/* Custom Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="arrowleft" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Product Details
        </Text>
        <View style={styles.headerIcons}></View>
      </View>
      {/* Main Content with ScrollView */}
      <ScrollView
        style={{ flex: 1, padding: moderateScale(5) }}
        contentContainerStyle={{ paddingBottom: verticalScale(120) }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ backgroundColor: '#fff', borderRadius: moderateScale(14), padding: moderateScale(10), marginBottom: verticalScale(10), marginTop: verticalScale(20), gap: moderateScale(8) }}>
          {loading ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text>Loading product...</Text>
            </View>
          ) : error ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'red' }}>{error}</Text>
            </View>
          ) : product ? (
            <>
              {/* Product Image Carousel */}
              <View style={{ position: 'relative' }}>
                {/* Wishlist Icon Overlay */}
                 <TouchableOpacity
                   style={{
                     position: 'absolute',
                     top: verticalScale(-8),
                     right: scale(18),
                     zIndex: 10,
                     backgroundColor: 'rgba(0,0,0,0.25)',
                     borderRadius: moderateScale(20),
                     padding: moderateScale(6),
                   }}
                   onPress={handleToggleWishlist}
                   activeOpacity={0.7}
                   disabled={wishlistLoading}
                 >
                   <AntDesign
                     name={isWishlisted ? 'heart' : 'hearto'}
                     size={moderateScale(22)}
                     color={isWishlisted ? '#E33C84' : '#fff'}
                   />
                 </TouchableOpacity>
                <ScrollView
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  style={{ width: '100%', height: verticalScale(150) }}
                  onScroll={handleScroll}
                  scrollEventThrottle={16}
                >
                  {(product?.productImages && product?.productImages.length > 0
                    ? product?.productImages.map((img, idx) => (
                      <Image
                        key={img._id || idx}
                        source={{ uri: img.url }}
                        style={{
                          width: scale(350),
                          height: verticalScale(150),
                          borderRadius: moderateScale(16),
                          marginRight: idx !== product?.productImages.length - 1 ? scale(10) : 0,
                          resizeMode: 'contain',
                        }}
                      />
                    ))
                    : [<Image key={0} source={AppImages.sportswear} style={{ width: scale(350), height: verticalScale(150), borderRadius: moderateScale(16), resizeMode: 'contain' }} />])}
                </ScrollView>
                {/* Dots Indicator */}
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: verticalScale(8), height: verticalScale(16) }}>
                  {(product?.productImages && product?.productImages.length > 0
                    ? product?.productImages
                    : [1, 2, 3]
                  ).map((_, idx) => (
                    <View
                      key={idx}
                      style={{
                        width: moderateScale(8),
                        height: moderateScale(8),
                        borderRadius: moderateScale(4),
                        backgroundColor: carouselIndex === idx ? '#E33C84' : '#E0E0E0',
                        marginRight: scale(8),
                        marginTop: verticalScale(15)
                      }}
                    />
                  ))}
                </View>
              </View>
              {/* Product Info */}
              <View style={{ marginTop: verticalScale(15), }}>
                <Text style={{ fontSize: fontScale(22), fontWeight: 'bold', color: '#222', marginBottom: verticalScale(2) }}>{product?.productName}</Text>
                <Text style={{ fontSize: fontScale(15), color: '#888', marginBottom: verticalScale(6) }}>{product?.brand}</Text>
                {/* Price ek hi Text me hai — alag-alag Text row me rakhne par Android
                    unki width kam measure karke digits kaat deta hai */}
                <View style={styles.priceRowLine}>
                  <Text style={styles.priceMain}>
                    ₹ {product?.discountPrice || product?.price}
                    {product?.discountPrice ? (
                      <Text style={styles.priceOld}>{'  '}₹ {product?.price}</Text>
                    ) : null}
                    {product?.discountPercent ? (
                      <Text style={styles.priceOff}>{'  '}-{product?.discountPercent}%</Text>
                    ) : null}
                  </Text>
                  <AntDesign name="star" size={moderateScale(16)} color="#1DBF73" />
                  <Text style={styles.priceRating}>
                    {product?.rating} ({product?.totalRatings})
                  </Text>
                </View>
              </View>

              {/* quantity */}
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyValue}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity >= 50 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity(q => Math.min(50, q + 1))}
                  disabled={quantity >= 50}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              {/* Highlights Section */}
              {product?.highlights && product.highlights.length > 0 && (
                <View style={{ marginTop: verticalScale(6) }}>
                  <Text style={{ fontWeight: 'bold', color: Colors.theme1, fontSize: fontScale(16), marginBottom: verticalScale(4) }}>Highlights</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                    {product.highlights.map(h => (
                      <View key={h._id} style={{ backgroundColor: '#F6F6F9', borderRadius: moderateScale(8), paddingHorizontal: scale(10), paddingVertical: verticalScale(4), marginRight: scale(8), marginBottom: verticalScale(6) }}>
                        <Text style={{ color: '#333', fontSize: fontScale(14) }}>{h.text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Features Section */}
              {product?.features && (
                <View>
                  <Text style={{ fontWeight: 'bold', color: Colors.theme1, fontSize: fontScale(16), marginBottom: verticalScale(4) }}>Features</Text>
                  <Text style={{ color: '#444', fontSize: fontScale(14) }}>{product.features}</Text>
                </View>
              )}

              {/* Seller Info Section */}
              {product?.seller && (
                <View style={{ marginTop: verticalScale(4) }}>
                  <Text style={{ fontWeight: 'bold', color: Colors.theme1, fontSize: fontScale(16), marginBottom: verticalScale(4) }}>Seller Details</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F9', borderRadius: moderateScale(10), padding: moderateScale(10), marginBottom: verticalScale(10) }}>

                    {product.seller.shopLogo ? (
                      <Image source={{ uri: product.seller.shopLogo }} style={{ width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), marginRight: scale(12), backgroundColor: '#fff' }} />
                    ) : (
                      <View style={{ width: moderateScale(44), height: moderateScale(44), borderRadius: moderateScale(22), marginRight: scale(12), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                        <AntDesign name="user" size={moderateScale(28)} color={Colors.theme1} />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: 'bold', fontSize: fontScale(15), color: '#222' }}>{product.seller.shopName}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(2) }}>
                        <AntDesign name="star" size={moderateScale(14)} color="#1DBF73" />
                        <Text style={{ fontSize: fontScale(13), color: '#1DBF73', fontWeight: 'bold', marginLeft: scale(2) }}>{product.seller.rating}</Text>
                        <Text style={{ fontSize: fontScale(12), color: '#888', marginLeft: scale(4) }}>({product.seller.totalRatings})</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {/* Color Selector */}
              {product?.colors && product?.colors.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 'bold', color: '#222', marginRight: scale(10) }}>Color</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {product?.colors.map(opt => (
                      <TouchableOpacity
                        key={opt._id}
                        onPress={() => setSelectedColor(opt.name)}
                        style={{
                          width: moderateScale(24),
                          height: moderateScale(24),
                          borderRadius: moderateScale(12),
                          backgroundColor: opt.code,
                          marginRight: scale(8),
                          borderWidth: 2,
                          borderColor: selectedColor === opt.name ? '#E33C84' : '#fff',
                          elevation: 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        {selectedColor === opt.name && (
                          <AntDesign name="check" size={moderateScale(14)} color="#fff" />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Size Selector */}
              {product?.sizes && product?.sizes?.length > 0 && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: verticalScale(5) }}>
                  <Text style={{ fontWeight: 'bold', color: '#222', marginRight: scale(10) }}>Size</Text>
                  <View style={{ flexDirection: 'row' }}>
                    {product?.sizes.map(size => (
                      <TouchableOpacity
                        key={size._id}
                        onPress={() => setSelectedSize(size.label)}
                        style={{
                          width: moderateScale(32),
                          height: moderateScale(32),
                          borderRadius: moderateScale(16),
                          backgroundColor: selectedSize === size.label ? '#222' : '#F5F5F5',
                          marginRight: scale(8),
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: selectedSize === size.label ? '#222' : '#E0E0E0',
                        }}
                      >
                        <Text style={{ color: selectedSize === size.label ? '#fff' : '#888', fontWeight: 'bold' }}>{size.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Description */}
              <View style={{ marginTop: verticalScale(6) }}>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) }}>
                  <Text style={{ fontWeight: 'bold', color: '#222', fontSize: fontScale(16), flex: 1 }}>Description</Text>
                  <AntDesign name="down" size={moderateScale(18)} color="#888" />
                </TouchableOpacity>
                <Text style={{ color: '#444', fontSize: fontScale(14) }}>
                  {product?.description}
                  {product?.description?.length > 150 && (
                    <Text style={{ color: '#1DA1F2', fontWeight: 'bold' }}> Read more</Text>
                  )}
                </Text>
              </View>

              {/* Reviews — delivered orders ke ratings/reviews yahan dikhte hain */}
              <View style={{ marginTop: verticalScale(16) }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(8) }}>
                  <Text style={{ fontWeight: 'bold', color: '#222', fontSize: fontScale(16), flex: 1 }}>
                    Reviews {reviews?.totalRatings ? `(${reviews.totalRatings})` : ''}
                  </Text>
                  {!!reviews?.totalRatings && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <AntDesign name="star" size={moderateScale(15)} color="#FFB800" />
                      <Text style={{ marginLeft: scale(4), fontWeight: 'bold', color: '#222', fontSize: fontScale(14) }}>
                        {Number(reviews.averageRating || 0).toFixed(1)}
                      </Text>
                    </View>
                  )}
                </View>

                {!reviews || reviews.ratings?.length === 0 ? (
                  <Text style={{ color: '#888', fontSize: fontScale(13) }}>
                    No reviews yet. Order this product and be the first to review!
                  </Text>
                ) : (
                  reviews.ratings.map((r) => (
                    <View
                      key={r._id}
                      style={{
                        backgroundColor: '#F8F8F8',
                        borderRadius: moderateScale(10),
                        padding: scale(12),
                        marginBottom: verticalScale(8),
                      }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: verticalScale(4) }}>
                        <Text style={{ fontWeight: 'bold', color: '#333', fontSize: fontScale(13), flex: 1 }} numberOfLines={1}>
                          {r.userId?.fullName || 'Customer'}
                        </Text>
                        <View style={{ flexDirection: 'row' }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <AntDesign
                              key={i}
                              name="star"
                              size={moderateScale(12)}
                              color={i <= (r.rating || 0) ? '#FFB800' : '#DDD'}
                            />
                          ))}
                        </View>
                      </View>
                      {!!r.reviewText && (
                        <Text style={{ color: '#555', fontSize: fontScale(13) }}>{r.reviewText}</Text>
                      )}
                      <Text style={{ color: '#AAA', fontSize: fontScale(11), marginTop: verticalScale(4) }}>
                        {r.createdAt
                          ? new Date(r.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : ''}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Buy and Add to Cart Buttons */}
      {
        !loading && !error && product && (
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.cartButton} onPress={() => handleAddToCart(false)} activeOpacity={0.85} disabled={cartLoading}>
              <Text style={styles.cartButtonText}>{cartLoading ? 'Adding...' : 'Add to Cart'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton} onPress={handleBuyNow} activeOpacity={0.85} disabled={cartLoading}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        )
      }
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F9',
    borderRadius: moderateScale(10),
    marginRight: scale(10),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    height: verticalScale(48),
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: moderateScale(32),
    height: moderateScale(32),
    borderRadius: moderateScale(16),
    backgroundColor: Colors.theme1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: scale(4),
    opacity: 1,
  },
  qtyBtnDisabled: {
    backgroundColor: '#ddd',
    opacity: 0.5,
  },
  qtyBtnText: {
    color: '#fff',
    fontSize: fontScale(20),
    fontWeight: 'bold',
  },
  qtyValue: {
    fontSize: fontScale(18),
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: scale(8),
    minWidth: scale(24),
    textAlign: 'center',
  },
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scale(20),
    paddingVertical: verticalScale(16),
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(18),
    borderTopRightRadius: moderateScale(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  cartButton: {
    flex: 1,
    backgroundColor: Colors.theme1,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    marginRight: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.theme1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  priceRowLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(2),
    marginBottom: verticalScale(4),
  },
  priceMain: {
    flex: 1,
    fontSize: fontScale(20),
    fontWeight: 'bold',
    color: Colors.themebtn,
  },
  priceOld: {
    fontSize: fontScale(16),
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
    fontWeight: 'normal',
  },
  priceOff: {
    fontSize: fontScale(15),
    color: '#1DBF73',
    fontWeight: 'bold',
  },
  priceRating: {
    fontSize: fontScale(14),
    color: '#1DBF73',
    fontWeight: 'bold',
    marginLeft: scale(4),
    minWidth: scale(60),
  },
  cartButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontScale(17),
    letterSpacing: 0.5,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  buyButton: {
    flex: 1,
    backgroundColor: Colors.themebtn,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(12),
    marginLeft: scale(10),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.themebtn,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 4,
  },
  buyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontScale(17),
    letterSpacing: 0.5,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(18),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
    elevation: 6,
    shadowColor: '#E33C84',
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: fontScale(18),
    fontWeight: 'bold',
    marginLeft: scale(16),
    marginRight: scale(16),
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: scale(16),
  },
  sidebar: {
    width: scale(90),
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(18),
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 0,
  },
  categoryItem: {
    alignItems: 'center',
    marginBottom: verticalScale(18),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(4),
    borderRadius: moderateScale(14),
    width: scale(70),
  },
  categoryItemSelected: {
    backgroundColor: '#FFF0F0',
    borderColor: THEME_COLOR,
    borderWidth: 1.5,
  },
  filterButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    width: scale(70),
  },
  allButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: moderateScale(12),
    marginBottom: verticalScale(10),
    width: scale(70),
  },
  categoryIcon: {
    width: moderateScale(36),
    height: moderateScale(36),
    marginBottom: verticalScale(6),
    resizeMode: 'contain',
  },
  categoryLabel: {
    fontSize: fontScale(13),
    color: '#B0B0B0',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: THEME_COLOR,
    fontWeight: 'bold',
    fontSize: fontScale(13),
  },
  categoryLabelBold: {
    fontWeight: 'bold',
  },
  shopCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    padding: moderateScale(8),
    marginBottom: verticalScale(16),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#rgba(227, 60, 132, 1)',
    flex: 1,
    width: '95%',
    height: verticalScale(180)
  },
  shopImage: {
    width: scale(80),
    height: verticalScale(110),
    borderRadius: moderateScale(10),
    marginRight: scale(10),
    resizeMode: 'cover',
  },
  shopInfo: {
    flex: 1,
    width: '100%',
  },
  shopName: {
    fontSize: fontScale(17),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(2),
  },
  shopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(2),
    flexWrap: 'wrap',
    width: '70%',
  },
  shopMeta: {
    fontSize: fontScale(13),
    color: '#888',
    marginRight: scale(4),
  },
  dot: {
    fontSize: fontScale(13),
    color: '#888',
    marginHorizontal: scale(2),
  },
  offerRow: {
    backgroundColor: '#E6F9E6',
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(2),
    alignSelf: 'flex-start',
    marginVertical: verticalScale(4),
    width: '80%',
  },
  offerText: {
    color: '#1DBF73',
    fontSize: fontScale(11),
    fontWeight: 'bold',
  },
  statusRow: {
    marginTop: verticalScale(12),
    backgroundColor: 'rgba(227, 248, 255, 1)',
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(5),
    width: '100%',
  },
  statusText: {
    color: '#000',
    fontSize: fontScale(12),
    fontWeight: '500'
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(12),
    padding: moderateScale(10),
    marginBottom: verticalScale(16),
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  productCardSelected: {
    borderColor: '#1DA1F2',
    borderWidth: 2,
    shadowColor: '#1DA1F2',
    shadowOpacity: 0.15,
  },
  productImage: {
    width: '100%',
    height: verticalScale(120),
    borderRadius: moderateScale(10),
    marginBottom: verticalScale(8),
    resizeMode: 'cover',
  },
  favoriteIcon: {
    position: 'absolute',
    top: verticalScale(12),
    right: scale(12),
    backgroundColor: '#fff',
    borderRadius: moderateScale(16),
    padding: moderateScale(4),
    elevation: 2,
    zIndex: 2,
  },
  productName: {
    fontSize: fontScale(14),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: verticalScale(4),
    minHeight: verticalScale(36),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: verticalScale(4),
  },
  productPrice: {
    fontSize: fontScale(15),
    color: '#222',
    fontWeight: 'bold',
    marginRight: scale(8),
  },
  productOldPrice: {
    fontSize: fontScale(13),
    color: '#B0B0B0',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: fontScale(13),
    color: '#1DBF73',
    marginLeft: scale(4),
    fontWeight: 'bold',
  },
  ratingCount: {
    fontSize: fontScale(12),
    color: '#888',
    marginLeft: scale(2),
  },
});
export default ProductDetailScreen;
