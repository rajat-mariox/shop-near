import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';
import { fetchProductDetail, fetchProductRatings } from '../../service/productService';
import {
  addToCart,
  fetchCartList,
  removeFromCart,
  updateCartItemQty,
} from '../../service/cartService';
import { Colors } from '../../themes/Colors';
import { fontScale, moderateScale } from '../../utils/responsive';

// Figma "Product Details" (node 26:2105) — right panel jo product par click
// karne se grid ki jagah khulta hai. Poora data backend se aata hai.
const THEME_COLOR = Colors.theme1;
const ACCENT = '#508A7B'; // figma ka teal — stars, bars, read more
const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;
// Sidebar (79) + content padding (10 dono taraf) ke baad bachi width
const PANEL_W = SCREEN_W - px(79) - px(20);

// Moto jaise OEM-font devices par shrink-wrap text kat jaata hai —
// explicit fontFamily se measurement sahi hota hai
const F = { fontFamily: 'sans-serif' };

// Cart list me is product ki entry dhoondta hai — mile to {id, qty}
const findInCart = async (productId) => {
  const result = await fetchCartList();
  if (!result.success || !Array.isArray(result.data?.items)) return null;
  const found = result.data.items.find(
    (item) => (item.product?._id || item.productId) === productId,
  );
  return found ? { id: found._id, qty: found.quantity || 1 } : null;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

const TealStars = ({ rating = 0, size = 14 }) => (
  <View style={styles.starsRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <AntDesign
        key={i}
        name="star"
        size={moderateScale(size)}
        color={i <= Math.round(rating) ? ACCENT : '#EFF0F1'}
        style={styles.starIcon}
      />
    ))}
  </View>
);

// Image slider — product ki saari images auto-slide hoti hain, dots ke saath
const DetailImageSlider = ({ urls }) => {
  const scrollRef = useRef(null);
  const indexRef = useRef(0);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    if (urls.length < 2) return undefined;
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % urls.length;
      scrollRef.current?.scrollTo({ x: indexRef.current * PANEL_W, animated: true });
      setActiveDot(indexRef.current);
    }, 2500);
    return () => clearInterval(timer);
  }, [urls.length]);

  return (
    <View style={styles.imageArea}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}>
        {urls.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={styles.heroImage} />
        ))}
      </ScrollView>
      {urls.length > 1 ? (
        <View style={styles.dotsRow}>
          {urls.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeDot && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
};

// Collapsible section header — figma: bold title + chevron + line
const SectionHeader = ({ title, open, onToggle }) => (
  <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <Feather
      name={open ? 'chevron-up' : 'chevron-down'}
      size={moderateScale(20)}
      color="#33302E"
    />
  </TouchableOpacity>
);

const ProductDetailPanel = ({ productId, similar = [], onSelectProduct }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingData, setRatingData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [descOpen, setDescOpen] = useState(true);
  const [descExpanded, setDescExpanded] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  // Product cart me ho to yahan uski entry rehti hai {id, qty} — isi se
  // "Add To Cart" ki jagah quantity stepper dikhta hai
  const [cartEntry, setCartEntry] = useState(null);
  const [qtyBusy, setQtyBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setDetail(null);
    setRatingData(null);
    setSelectedColor(null);
    setSelectedSize(null);
    fetchProductDetail(productId).then((result) => {
      if (!mounted) return;
      if (result.success) setDetail(result.data);
      setLoading(false);
    });
    fetchProductRatings(productId).then((result) => {
      if (!mounted) return;
      if (result.success) setRatingData(result.data);
    });
    // Cart me pehle se pada ho to seedha stepper dikhe, Add button nahi
    setCartEntry(null);
    findInCart(productId).then((entry) => {
      if (mounted) setCartEntry(entry);
    });
    return () => {
      mounted = false;
    };
  }, [productId]);

  const handleAddToCart = async () => {
    if (!detail || adding) return;
    setAdding(true);
    const result = await addToCart({
      productId: detail._id,
      sellerId: detail.seller?._id,
      quantity: 1,
      // Backend objects bhejta hai ({name, code} / {label}) — cart me naam jaata hai
      selectedColor: selectedColor?.name || selectedColor || undefined,
      selectedSize: selectedSize?.label || selectedSize || undefined,
    });
    if (!result.success) {
      setAdding(false);
      Toast.show({
        type: 'error',
        text1: result.message || 'Failed to add',
      });
      return;
    }
    // Add hote hi button quantity stepper me badal jaata hai — cart list se
    // item ki id nikaal ke, taaki +/- wahi entry update kare
    const entry = await findInCart(detail._id);
    setCartEntry(entry || { id: null, qty: 1 });
    setAdding(false);
  };

  // Stepper ke +/- — qty 0 hone par item cart se hat jaata hai aur wapas
  // "Add To Cart" button dikhta hai
  const changeQty = async (delta) => {
    if (!cartEntry?.id || qtyBusy) return;
    const newQty = cartEntry.qty + delta;
    setQtyBusy(true);
    if (newQty <= 0) {
      const result = await removeFromCart(cartEntry.id);
      if (result.success) {
        setCartEntry(null);
      } else {
        Toast.show({ type: 'error', text1: result.message || 'Failed to remove' });
      }
    } else {
      const result = await updateCartItemQty(cartEntry.id, newQty);
      if (result.success) {
        setCartEntry({ ...cartEntry, qty: newQty });
      } else {
        Toast.show({ type: 'error', text1: result.message || 'Failed to update' });
      }
    }
    setQtyBusy(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={THEME_COLOR} style={styles.loader} />;
  }
  if (!detail) {
    return <Text style={styles.stateText}>Product load nahi hua</Text>;
  }

  const images = detail.productImages?.map((img) => img.url || img).filter(Boolean);
  const avgRating = ratingData?.averageRating || detail.rating || 0;
  const totalRatings = ratingData?.totalRatings || detail.totalRatings || 0;
  const distribution = ratingData?.distribution || {};
  const reviews = ratingData?.ratings || [];
  const similarProducts = similar.filter((p) => p._id !== productId).slice(0, 8);

  return (
    <View style={styles.panel}>
      {images?.length ? <DetailImageSlider urls={images} /> : null}

      {/* Naam + price + stars */}
      <View style={styles.titleRow}>
        <Text style={styles.productName}>{detail.productName}</Text>
        <Text style={styles.price}>₹ {detail.discountPrice || detail.price}</Text>
      </View>
      <View style={styles.ratingRow}>
        <TealStars rating={avgRating} size={13} />
        <Text style={styles.ratingCount}>({totalRatings})</Text>
        {detail.discountPrice && detail.discountPrice !== detail.price ? (
          <Text style={styles.oldPrice}>₹ {detail.price}</Text>
        ) : null}
      </View>

      <View style={styles.divider} />

      {/* Color + Size — jo backend me ho wahi dikhta hai */}
      {detail.colors?.length || detail.sizes?.length ? (
        <>
          <View style={styles.optionsRow}>
            {detail.colors?.length ? (
              <View style={styles.optionCol}>
                <Text style={styles.optionLabel}>Color</Text>
                <View style={styles.swatchRow}>
                  {detail.colors.map((color, i) => (
                    <TouchableOpacity
                      key={color._id || i}
                      onPress={() => setSelectedColor(color)}
                      style={[
                        styles.swatchRing,
                        selectedColor === color && styles.swatchRingActive,
                      ]}>
                      <View
                        style={[
                          styles.swatch,
                          { backgroundColor: color?.code || color?.name || color || '#ddd' },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : null}
            {detail.sizes?.length ? (
              <View style={styles.optionCol}>
                <Text style={styles.optionLabel}>Size</Text>
                <View style={styles.swatchRow}>
                  {detail.sizes.map((size, i) => {
                    const outOfStock = size?.inStock === false;
                    return (
                      <TouchableOpacity
                        key={size._id || i}
                        disabled={outOfStock}
                        onPress={() => setSelectedSize(size)}
                        style={[
                          styles.sizeChip,
                          selectedSize === size && styles.sizeChipActive,
                          outOfStock && styles.sizeChipDisabled,
                        ]}>
                        <Text
                          style={[
                            styles.sizeChipText,
                            selectedSize === size && styles.sizeChipTextActive,
                          ]}>
                          {size?.label || size}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>
          <View style={styles.divider} />
        </>
      ) : null}

      {/* Description */}
      {detail.description ? (
        <>
          <SectionHeader
            title="Description"
            open={descOpen}
            onToggle={() => setDescOpen((v) => !v)}
          />
          {descOpen ? (
            <View style={styles.sectionBody}>
              <Text style={styles.descText} numberOfLines={descExpanded ? undefined : 4}>
                {detail.description}
              </Text>
              {detail.description.length > 120 ? (
                <TouchableOpacity onPress={() => setDescExpanded((v) => !v)}>
                  <Text style={styles.readMore}>
                    {descExpanded ? 'Read less' : 'Read more'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}
        </>
      ) : null}

      {/* Reviews */}
      <SectionHeader
        title="Reviews"
        open={reviewsOpen}
        onToggle={() => setReviewsOpen((v) => !v)}
      />
      {reviewsOpen ? (
        <View style={styles.sectionBody}>
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.bigRating}>{Number(avgRating).toFixed(1)}</Text>
              <Text style={styles.outOf}>OUT OF 5</Text>
            </View>
            <View style={styles.summaryRight}>
              <TealStars rating={avgRating} size={15} />
              <Text style={styles.ratingsCountText}>{totalRatings} ratings</Text>
            </View>
          </View>

          {/* 5..1 star distribution bars */}
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0;
            const pct = totalRatings ? Math.round((count / totalRatings) * 100) : 0;
            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.barStarNum}>{star}</Text>
                <AntDesign name="star" size={moderateScale(10)} color={ACCENT} />
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
                <Text style={styles.barPct}>{pct}%</Text>
              </View>
            );
          })}

          <View style={styles.reviewsMetaRow}>
            <Text style={styles.reviewsMetaText}>{reviews.length} Reviews</Text>
          </View>

          {reviews.map((review) => (
            <View key={review._id} style={styles.reviewItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(review.userId?.fullName || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.reviewBody}>
                <View style={styles.reviewTopRow}>
                  <Text style={styles.reviewName}>
                    {review.userId?.fullName || 'User'}
                  </Text>
                  <Text style={styles.reviewTime}>{timeAgo(review.createdAt)}</Text>
                </View>
                <TealStars rating={review.rating} size={9} />
                {review.reviewText ? (
                  <Text style={styles.reviewText}>{review.reviewText}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {/* Similar products — usi seller/category ki baaki cheezein */}
      {similarProducts.length ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Similar Product</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.similarRow}>
            {similarProducts.map((product) => (
              <TouchableOpacity
                key={product._id}
                style={styles.similarCard}
                activeOpacity={0.85}
                onPress={() => onSelectProduct?.(product._id)}>
                <Image
                  source={{ uri: product.productImage || product.productImages?.[0] }}
                  style={styles.similarImage}
                />
                <Text numberOfLines={1} style={styles.similarName}>
                  {product.productName}
                </Text>
                <Text style={styles.similarPrice}>
                  ₹ {product.discountPrice || product.price}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      ) : null}

      {/* Add To Cart — figma: coral, upar se rounded. Cart me hone par
          yahi bar quantity stepper (− qty +) ban jaati hai */}
      {cartEntry ? (
        <View style={[styles.cartButton, qtyBusy && styles.cartButtonBusy]}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => changeQty(-1)}
            disabled={qtyBusy}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.qtySign}>−</Text>
          </TouchableOpacity>
          <View style={styles.qtyCenter}>
            <Feather name="shopping-bag" size={moderateScale(18)} color="#fff" />
            <Text style={styles.cartButtonText}>{cartEntry.qty}</Text>
          </View>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => changeQty(1)}
            disabled={qtyBusy}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.qtySign}>+</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          disabled={adding}>
          {adding ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Feather name="shopping-bag" size={moderateScale(18)} color="#fff" />
              <Text style={styles.cartButtonText}>Add To Cart</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    width: PANEL_W,
    paddingBottom: px(10),
  },
  loader: {
    marginTop: px(40),
  },
  stateText: {
    ...F,
    color: '#888',
    textAlign: 'center',
    marginTop: px(30),
    fontSize: fontScale(12),
  },
  /* ---------- IMAGE ---------- */
  imageArea: {
    width: PANEL_W,
    height: px(236),
    backgroundColor: '#FFFCFA',
    borderRadius: px(8),
    overflow: 'hidden',
  },
  heroImage: {
    width: PANEL_W,
    height: px(236),
    resizeMode: 'contain',
  },
  dotsRow: {
    position: 'absolute',
    bottom: px(10),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: px(6),
    height: px(6),
    borderRadius: px(3),
    backgroundColor: '#E0DDD9',
    marginHorizontal: px(2.5),
  },
  dotActive: {
    backgroundColor: '#8A8A8F',
  },
  /* ---------- TITLE / PRICE ---------- */
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: px(14),
  },
  productName: {
    ...F,
    flex: 1,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
    marginRight: px(8),
  },
  price: {
    ...F,
    fontSize: fontScale(20),
    fontWeight: '700',
    color: '#000',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(6),
  },
  ratingCount: {
    ...F,
    fontSize: fontScale(11),
    color: '#1D1F22',
    marginLeft: px(5),
  },
  oldPrice: {
    ...F,
    marginLeft: 'auto',
    fontSize: fontScale(12),
    color: '#BEBFC4',
    textDecorationLine: 'line-through',
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: px(13),
  },
  /* ---------- COLOR / SIZE ---------- */
  optionsRow: {
    flexDirection: 'row',
  },
  optionCol: {
    flex: 1,
  },
  optionLabel: {
    ...F,
    fontSize: fontScale(13),
    color: '#777E90',
    marginBottom: px(10),
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  swatchRing: {
    width: px(32),
    height: px(32),
    borderRadius: px(16),
    borderWidth: 1.5,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(6),
  },
  swatchRingActive: {
    borderColor: '#8A8A8F',
  },
  swatch: {
    width: px(24),
    height: px(24),
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  sizeChip: {
    width: px(33),
    height: px(33),
    borderRadius: px(17),
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(8),
  },
  sizeChipActive: {
    backgroundColor: '#515151',
  },
  sizeChipDisabled: {
    opacity: 0.35,
  },
  sizeChipText: {
    ...F,
    fontSize: fontScale(11),
    color: '#C5C5C5',
  },
  sizeChipTextActive: {
    color: '#fff',
  },
  /* ---------- SECTIONS ---------- */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(10),
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  sectionTitle: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '700',
    color: '#33302E',
  },
  sectionBody: {
    paddingVertical: px(12),
  },
  descText: {
    ...F,
    fontSize: fontScale(11),
    lineHeight: fontScale(17),
    color: '#1D1F22',
  },
  readMore: {
    ...F,
    fontSize: fontScale(11),
    color: ACCENT,
    textDecorationLine: 'underline',
    marginTop: px(4),
  },
  /* ---------- REVIEWS ---------- */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: px(10),
  },
  bigRating: {
    ...F,
    fontSize: fontScale(34),
    fontWeight: '700',
    color: '#231F20',
  },
  outOf: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    letterSpacing: 0.5,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  ratingsCountText: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    marginTop: px(4),
  },
  starsRow: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: px(1.5),
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(7),
  },
  barStarNum: {
    ...F,
    width: px(10),
    fontSize: fontScale(11),
    color: '#8A8A8F',
    textAlign: 'center',
  },
  barTrack: {
    flex: 1,
    height: px(4),
    borderRadius: px(2),
    backgroundColor: '#EFF0F1',
    marginHorizontal: px(8),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: px(2),
    backgroundColor: ACCENT,
  },
  barPct: {
    ...F,
    width: px(34),
    fontSize: fontScale(11),
    color: '#000',
    textAlign: 'right',
  },
  reviewsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: px(6),
    marginBottom: px(10),
  },
  reviewsMetaText: {
    ...F,
    fontSize: fontScale(10),
    color: '#8A8A8F',
    letterSpacing: 0.3,
  },
  reviewItem: {
    flexDirection: 'row',
    marginBottom: px(14),
  },
  avatar: {
    width: px(36),
    height: px(36),
    borderRadius: px(18),
    backgroundColor: '#F1EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(10),
  },
  avatarText: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#6466FD',
  },
  reviewBody: {
    flex: 1,
  },
  reviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewName: {
    ...F,
    fontSize: fontScale(12),
    fontWeight: '700',
    color: '#33302E',
  },
  reviewTime: {
    ...F,
    fontSize: fontScale(10),
    color: 'rgba(51, 48, 46, 0.35)',
  },
  reviewText: {
    ...F,
    fontSize: fontScale(10.5),
    lineHeight: fontScale(16),
    color: '#000',
    marginTop: px(3),
  },
  /* ---------- SIMILAR ---------- */
  similarRow: {
    marginTop: px(10),
    marginBottom: px(4),
  },
  similarCard: {
    width: px(126),
    marginRight: px(16),
  },
  similarImage: {
    width: px(126),
    height: px(150),
    borderRadius: px(8),
    backgroundColor: '#F6F6F6',
    resizeMode: 'cover',
  },
  similarName: {
    ...F,
    fontSize: fontScale(11),
    color: '#1D1F22',
    marginTop: px(6),
  },
  similarPrice: {
    ...F,
    fontSize: fontScale(13),
    fontWeight: '700',
    color: '#1D1F22',
    marginTop: px(2),
  },
  /* ---------- CART BUTTON ---------- */
  cartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLOR,
    borderTopLeftRadius: px(24),
    borderTopRightRadius: px(24),
    borderBottomLeftRadius: px(10),
    borderBottomRightRadius: px(10),
    paddingVertical: px(18),
    marginTop: px(16),
  },
  cartButtonText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
    marginLeft: px(10),
  },
  cartButtonBusy: {
    opacity: 0.7,
  },
  qtyButton: {
    paddingHorizontal: px(24),
  },
  qtySign: {
    ...F,
    color: '#fff',
    fontSize: fontScale(22),
    fontWeight: '700',
  },
  qtyCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductDetailPanel;
