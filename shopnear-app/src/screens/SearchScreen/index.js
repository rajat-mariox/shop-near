import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { AppImages } from '../../constants/app.image';
import { fetchProductsByCategory, searchProducts } from '../../service/productService';
import { fetchSellerCategories, fetchSellers } from '../../service/sellerService';
import { addToWishlist, removeFromWishlist, fetchWishlist } from '../../service/wishService';
import { showToast } from '../../utils/toast';
// Wishlist API ke items se productId ka Set (item.productId object ya id dono ho sakta hai)
const wishlistIdSet = (data) => {
  const items = Array.isArray(data) ? data : data?.items || data?.wishlist || [];
  return new Set(
    items.map((i) => String(i.productId?._id || i.productId || i.product?._id || i._id)),
  );
};

import ProductDetailPanel from './ProductDetailPanel';
import { Colors } from '../../themes/Colors';
import { fontScale, moderateScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const THEME_COLOR = Colors.theme1;

// Figma frame 402dp — sab sizes usi ratio par (design node 20:919 "Clothes")
const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;

const SIDEBAR_W = px(79);
// Grid area = screen - sidebar; 2 columns + gaps
const GRID_PAD = px(10);
const CARD_W = (SCREEN_W - SIDEBAR_W - GRID_PAD * 2 - px(15)) / 2;

// Rating ke 5 chhote green stars (figma product card jaisa)
const Stars = ({ rating = 0 }) => (
  <View style={styles.starsRow}>
    {[1, 2, 3, 4, 5].map((i) => (
      <AntDesign
        key={i}
        name="star"
        size={moderateScale(9)}
        color={i <= Math.round(rating) ? '#1DBF73' : '#D9D9D9'}
        style={styles.starIcon}
      />
    ))}
  </View>
);

// Product ki saari images apne-aap slide hoti rehti hain (2.5s interval).
// Ek hi image ho to static rehti hai, dots bhi nahi dikhte.
const AutoSlideImages = ({ urls }) => {
  const scrollRef = React.useRef(null);
  const indexRef = React.useRef(0);
  const [activeDot, setActiveDot] = useState(0);

  useEffect(() => {
    if (urls.length < 2) return undefined;
    const timer = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % urls.length;
      scrollRef.current?.scrollTo({ x: indexRef.current * CARD_W, animated: true });
      setActiveDot(indexRef.current);
    }, 2500);
    return () => clearInterval(timer);
  }, [urls.length]);

  return (
    <View style={styles.slideWrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}>
        {urls.map((url, i) => (
          <Image key={i} source={{ uri: url }} style={styles.productImage} />
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

// Product card — figma: image + heart circle, naam, price + cut price, stars (count)
const ProductCard = ({ item, wished, onToggleWish }) => (
  <View style={styles.productCard}>
    <View>
      <AutoSlideImages
        urls={
          item.productImages?.length ? item.productImages : [item.productImage]
        }
      />
      <TouchableOpacity
        style={styles.heartButton}
        onPress={onToggleWish}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <AntDesign
          name={wished ? 'heart' : 'hearto'}
          size={moderateScale(13)}
          color={wished ? THEME_COLOR : '#B0B0B0'}
        />
      </TouchableOpacity>
    </View>
    <Text style={styles.productName} numberOfLines={1}>
      {item.productName}
    </Text>
    <View style={styles.priceRow}>
      <Text style={styles.productPrice}>₹ {item.discountPrice || item.price}</Text>
      {item.discountPrice ? (
        <Text style={styles.productOldPrice}>₹ {item.price}</Text>
      ) : null}
    </View>
    <View style={styles.ratingRow}>
      <Stars rating={item.rating} />
      <Text style={styles.ratingCount}>({item.totalRatings || 0})</Text>
    </View>
  </View>
);

// Shop card — figma: left image, naam, time|city|FREE row, green offer strip,
// rating, neeche light-blue highlight chip. Selected = coral border.
const ShopCard = ({ seller, selected, onPress }) => (
  <TouchableOpacity
    style={[styles.shopCard, selected && styles.shopCardSelected]}
    onPress={onPress}
    activeOpacity={0.85}>
    <View style={styles.shopTopRow}>
      <Image
        source={seller.shopLogo ? { uri: seller.shopLogo } : AppImages.shop}
        style={styles.shopImage}
      />
      <View style={styles.shopInfo}>
        <View style={styles.shopNameRow}>
          <Text numberOfLines={1} style={styles.shopName}>
            {seller.shopName}
          </Text>
          {seller.isVerified ? (
            <AntDesign name="checkcircle" size={moderateScale(13)} color="#2ecc71" />
          ) : null}
        </View>
        <View style={styles.shopMetaRow}>
          <Text style={styles.shopMeta}>{seller.deliveryTime || '--'}</Text>
          <View style={styles.metaDivider} />
          <Text numberOfLines={1} style={[styles.shopMeta, styles.shopMetaCity]}>
            {seller.city || '--'}
          </Text>
          <View style={styles.metaDivider} />
          <MaterialIcons name="local-shipping" size={moderateScale(14)} color="#2F2F2F" />
          <Text style={styles.shopMeta}>
            {' '}
            {seller.deliveryCharge ? `₹${seller.deliveryCharge}` : 'FREE'}
          </Text>
        </View>
        {seller.offerText ? (
          <View style={styles.offerStrip}>
            <Image source={AppImages.dicount} style={styles.offerIcon} />
            <Text numberOfLines={1} style={styles.offerStripText}>
              {seller.offerText}
            </Text>
          </View>
        ) : null}
        <View style={styles.shopRatingRow}>
          <AntDesign name="star" size={moderateScale(14)} color="#FFC107" />
          <Text style={styles.shopRatingText}>
            {seller.rating || 0}(By {seller.totalRatings || 0}+)
          </Text>
        </View>
      </View>
    </View>
    {seller.shopDescription || seller.address ? (
      <View style={styles.highlightChip}>
        <Text numberOfLines={1} style={styles.highlightChipText}>
          {seller.shopDescription || seller.address}
        </Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

const SearchScreen = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productError, setProductError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [sellerError, setSellerError] = useState(null);
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  // Search — header ke icon se kholta hai (figma me header me search icon hai)
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  // Wishlist hearts (local state; add API call ke saath)
  const [wishedIds, setWishedIds] = useState(new Set());
  // Product par click hone par grid ki jagah detail panel khulta hai
  // (figma node 26:2105 — sidebar/shops row wahi rehte hain)
  const [detailProductId, setDetailProductId] = useState(null);

  const selectedSeller = sellers.find((s) => s._id === selectedSellerId);

  // Home ke "View Products" se aaye to wahi shop select hoti hai aur uski
  // card shops row me scroll karke saamne aa jaati hai
  const routeSellerId = route?.params?.sellerId;
  const shopsScrollRef = React.useRef(null);
  useEffect(() => {
    if (routeSellerId) {
      setSelectedSellerId(routeSellerId);
    }
  }, [routeSellerId]);

  useEffect(() => {
    if (!routeSellerId || !sellers.length) return;
    const index = sellers.findIndex((s) => s._id === routeSellerId);
    if (index <= 0) return;
    // Header render hone ke baad scroll (card width 269 + gap 10)
    const timer = setTimeout(() => {
      shopsScrollRef.current?.scrollTo({ x: index * px(279), animated: true });
    }, 300);
    return () => clearTimeout(timer);
  }, [routeSellerId, sellers]);

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) return;
    setSearching(true);
    const result = await searchProducts(searchQuery.trim());
    setSearchResults(result.success ? result.data?.products || [] : []);
    setSearching(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
    setSearchOpen(false);
  };

  // Mount par wishlist laao taaki pehle se wishlisted products ka heart bhara dikhe
  useEffect(() => {
    fetchWishlist()
      .then((res) => {
        if (res.success) setWishedIds(wishlistIdSet(res.data));
      })
      .catch(() => {});
  }, []);

  // Heart toggle (optimistic): wishlist me hai to hatao, nahi to add; API fail par revert
  const toggleWish = async (productId) => {
    const wasWished = wishedIds.has(productId);
    setWishedIds((prev) => {
      const next = new Set(prev);
      if (wasWished) next.delete(productId);
      else next.add(productId);
      return next;
    });
    const result = wasWished
      ? await removeFromWishlist({ productId })
      : await addToWishlist({ productId });
    if (!result.success) {
      setWishedIds((prev) => {
        const next = new Set(prev);
        if (wasWished) next.add(productId);
        else next.delete(productId);
        return next;
      });
      showToast(result.message || 'Wishlist update failed', 'error');
    }
  };

  // Sellers on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingSellers(true);
    fetchSellers(1, 10)
      .then((result) => {
        if (!isMounted) return;
        if (result.success && Array.isArray(result.data?.sellers)) {
          setSellers(result.data.sellers);
          setSellerError(null);
          if (result.data.sellers.length > 0) {
            // Route param se shop pehle hi selected ho to override na karo
            setSelectedSellerId((prev) => prev || result.data.sellers[0]._id);
          }
        } else {
          setSellers([]);
          setSellerError(result.message || 'Failed to load sellers');
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setSellers([]);
        setSellerError('Network error');
      })
      .finally(() => isMounted && setLoadingSellers(false));
    return () => {
      isMounted = false;
    };
  }, []);

  // Categories of selected seller
  useEffect(() => {
    if (!selectedSellerId) return;
    setSelectedCategory('all');
    const run = async () => {
      setLoadingCategories(true);
      try {
        const result = await fetchSellerCategories(selectedSellerId);
        if (result.success && Array.isArray(result.data?.categories)) {
          setCategories(result.data.categories);
          setCategoryError(null);
        } else {
          setCategories([]);
          setCategoryError(result.message || 'Failed to load categories');
        }
      } catch {
        setCategories([]);
        setCategoryError('Network error');
      }
      setLoadingCategories(false);
    };
    run();
  }, [selectedSellerId]);

  const getCategoryIcon = (cat) => {
    if (!cat || !cat.iconName) return AppImages.skirt;
    return AppImages[cat.iconName] || AppImages.skirt;
  };

  const sidebarCategories = React.useMemo(
    () => [
      { key: 'all', label: 'All', icon: AppImages.skirt },
      ...categories.map((cat) => ({
        key: cat._id || cat.categoryName,
        label: cat.categoryName,
        icon: getCategoryIcon(cat),
      })),
    ],
    [categories],
  );

  // Products of selected category + seller
  useEffect(() => {
    if (!selectedSellerId) return;
    const categoryId = selectedCategory === 'all' ? null : selectedCategory;
    if (categoryId && !sidebarCategories.some((cat) => cat.key === categoryId)) return;
    setLoadingProducts(true);
    setProductError(null);
    fetchProductsByCategory(selectedSellerId, categoryId)
      .then((result) => {
        if (result.success && Array.isArray(result.data?.products)) {
          setProducts(result.data.products);
        } else {
          setProducts([]);
          setProductError(result.message || 'Failed to load products');
        }
      })
      .catch(() => {
        setProducts([]);
        setProductError('Network error');
      })
      .finally(() => setLoadingProducts(false));
  }, [selectedCategory, sidebarCategories, selectedSellerId]);

  const gridData = searchResults !== null ? searchResults : products;

  const renderProduct = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setDetailProductId(item._id)}
      style={{ width: CARD_W }}>
      <ProductCard
        item={item}
        wished={wishedIds.has(item._id)}
        onToggleWish={() => toggleWish(item._id)}
      />
    </TouchableOpacity>
  );

  // Shops row — grid aur detail dono modes me upar dikhti hai
  const shopsRow = (
    <ScrollView
      ref={shopsScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.shopsRow}
      contentContainerStyle={styles.shopsRowContent}>
      {loadingSellers ? (
        <ActivityIndicator color={THEME_COLOR} style={styles.shopsState} />
      ) : sellerError ? (
        <Text style={styles.stateError}>{sellerError}</Text>
      ) : (
        sellers.map((seller) => (
          <ShopCard
            key={seller._id}
            seller={seller}
            selected={selectedSellerId === seller._id}
            onPress={() => {
              setDetailProductId(null);
              setSelectedSellerId(seller._id);
            }}
          />
        ))
      )}
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      {/* Coral header — back, seller ka naam, heart, search.
          Detail khula ho to back pehle grid par wapas laata hai */}
      <ScreenHeader style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() =>
            detailProductId ? setDetailProductId(null) : navigation.goBack()
          }
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {selectedSeller?.shopName || 'Products'}
        </Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
          <AntDesign name="hearto" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => (searchOpen ? clearSearch() : setSearchOpen(true))}>
          <AntDesign name={searchOpen ? 'close' : 'search1'} size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
      </ScreenHeader>

      {/* Search input — header ke search icon se toggle */}
      {searchOpen ? (
        <View style={styles.searchBar}>
          <AntDesign name="search1" size={moderateScale(16)} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={clearSearch}>
              <AntDesign name="closecircle" size={moderateScale(16)} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <View style={styles.body}>
        {/* Sidebar — Filter tile + backend categories */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarContent}>
            <TouchableOpacity style={styles.filterTile} activeOpacity={0.8}>
              <Image source={AppImages.filter} style={styles.filterIcon} />
              <Text style={styles.filterLabel}>Filter</Text>
            </TouchableOpacity>
            {loadingCategories ? (
              <ActivityIndicator color={THEME_COLOR} style={styles.sidebarState} />
            ) : categoryError ? (
              <Text style={styles.sidebarError}>{categoryError}</Text>
            ) : (
              sidebarCategories.map((cat) => {
                const isSelected = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    style={[styles.categoryTile, isSelected && styles.categoryTileSelected]}
                    onPress={() => {
                      setDetailProductId(null);
                      setSelectedCategory(cat.key);
                    }}
                    activeOpacity={0.8}>
                    <Image
                      source={cat.icon}
                      style={[
                        styles.categoryIcon,
                        { tintColor: isSelected ? THEME_COLOR : '#868686' },
                      ]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.categoryLabel, isSelected && styles.categoryLabelSelected]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Right side — shops row + (products grid ya product detail) */}
        <View style={styles.content}>
          {detailProductId ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {shopsRow}
              <ProductDetailPanel
                productId={detailProductId}
                similar={products}
                onSelectProduct={(id) => setDetailProductId(id)}
              />
            </ScrollView>
          ) : (
            <FlatList
              data={gridData}
              keyExtractor={(item) => item._id}
              numColumns={2}
              columnWrapperStyle={styles.gridRow}
              renderItem={renderProduct}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
              ListHeaderComponent={shopsRow}
              ListEmptyComponent={
                searching || loadingProducts ? (
                  <ActivityIndicator size="large" color={THEME_COLOR} style={styles.gridState} />
                ) : (
                  <Text style={styles.stateText}>
                    {productError ||
                      (searchResults !== null
                        ? `No products found for "${searchQuery}"`
                        : 'No products yet')}
                  </Text>
                )
              }
            />
          )}
        </View>
      </View>
    </View>
  );
};

// Device ke custom system font (Moto/OnePlus etc.) par RN text ko render se
// chhota measure karta hai — aakhri characters kat jaate hain ("Filter" →
// "Filte", "₹ 30" → "₹"). Explicit fontFamily dono paths ko same font par
// laata hai, isliye har text style me F spread hota hai.
const F = { fontFamily: 'sans-serif' };

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  /* ---------- HEADER ---------- */
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
    marginRight: px(10),
  },
  iconButton: {
    marginLeft: px(14),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: px(12),
    marginTop: px(8),
    borderRadius: px(8),
    paddingHorizontal: px(10),
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 2,
  },
  searchInput: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    color: '#222',
    paddingVertical: px(7),
    marginLeft: px(6),
  },
  /* ---------- LAYOUT ---------- */
  body: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1,
  },
  sidebarContent: {
    paddingVertical: px(10),
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: GRID_PAD,
  },
  /* ---------- SIDEBAR TILES ---------- */
  filterTile: {
    width: px(67),
    height: px(67),
    borderRadius: px(6),
    backgroundColor: THEME_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: px(6),
  },
  filterIcon: {
    width: px(26),
    height: px(26),
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  filterLabel: {
    ...F,
    color: '#fff',
    fontSize: fontScale(11),
    fontWeight: '500',
    marginTop: px(2),
  },
  categoryTile: {
    width: px(67),
    paddingVertical: px(9),
    borderRadius: px(6),
    alignItems: 'center',
    marginBottom: px(4),
  },
  categoryTileSelected: {
    backgroundColor: 'rgba(241, 33, 81, 0.08)',
  },
  categoryIcon: {
    width: px(28),
    height: px(28),
    resizeMode: 'contain',
    marginBottom: px(2),
  },
  categoryLabel: {
    ...F,
    fontSize: fontScale(11),
    fontWeight: '500',
    color: '#868686',
    textAlign: 'center',
    maxWidth: px(64),
  },
  categoryLabelSelected: {
    color: THEME_COLOR,
  },
  sidebarState: {
    marginTop: px(16),
  },
  sidebarError: {
    ...F,
    color: 'red',
    fontSize: fontScale(10),
    textAlign: 'center',
    marginTop: px(16),
    paddingHorizontal: px(4),
  },
  /* ---------- SHOP CARDS (figma 269x161) ---------- */
  shopsRow: {
    marginTop: px(11),
    marginBottom: px(14),
  },
  shopsRowContent: {
    paddingRight: px(10),
  },
  shopCard: {
    width: px(269),
    backgroundColor: '#fff',
    borderRadius: px(10),
    borderWidth: 1,
    borderColor: '#EFEFEF',
    padding: px(6),
    marginRight: px(10),
  },
  shopCardSelected: {
    borderWidth: 2,
    borderColor: THEME_COLOR,
  },
  shopTopRow: {
    flexDirection: 'row',
  },
  shopImage: {
    width: px(80),
    height: px(114),
    borderRadius: px(10),
    resizeMode: 'cover',
  },
  shopInfo: {
    flex: 1,
    paddingLeft: px(8),
    paddingTop: px(4),
  },
  shopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(5),
  },
  shopName: {
    ...F,
    flexShrink: 1,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#2F2F2F',
  },
  shopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(4),
  },
  shopMeta: {
    ...F,
    fontSize: fontScale(10),
    fontWeight: '500',
    color: '#2F2F2F',
  },
  shopMetaCity: {
    maxWidth: px(56),
  },
  metaDivider: {
    width: 1,
    height: px(11),
    backgroundColor: '#D0D0D0',
    marginHorizontal: px(6),
  },
  offerStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(54, 150, 60, 0.08)',
    borderRadius: px(4),
    paddingHorizontal: px(5),
    paddingVertical: px(3),
    alignSelf: 'flex-start',
    maxWidth: '100%',
    marginTop: px(6),
  },
  offerIcon: {
    width: px(13),
    height: px(13),
    resizeMode: 'contain',
    marginRight: px(4),
  },
  offerStripText: {
    ...F,
    flexShrink: 1,
    color: '#339334',
    fontSize: fontScale(10),
    fontWeight: '600',
  },
  shopRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(6),
  },
  shopRatingText: {
    ...F,
    fontSize: fontScale(10),
    fontWeight: '500',
    color: '#2F2F2F',
    marginLeft: px(4),
  },
  highlightChip: {
    backgroundColor: '#E3F8FF',
    borderRadius: px(5),
    paddingVertical: px(4),
    paddingHorizontal: px(8),
    marginTop: px(7),
  },
  highlightChipText: {
    ...F,
    color: '#2F2F2F',
    fontSize: fontScale(10),
    textAlign: 'center',
  },
  /* ---------- PRODUCT GRID (figma 141-wide cards) ---------- */
  gridRow: {
    justifyContent: 'space-between',
  },
  gridContent: {
    paddingBottom: px(12),
  },
  productCard: {
    width: '100%',
    marginBottom: px(15),
  },
  // Slider ke andar har image card jitni chaudi (horizontal paging ke liye
  // fixed width zaroori hai, '100%' kaam nahi karta)
  slideWrap: {
    width: CARD_W,
    height: px(186),
    borderRadius: px(8),
    backgroundColor: '#F6F6F6',
    overflow: 'hidden',
  },
  productImage: {
    width: CARD_W,
    height: px(186),
    resizeMode: 'cover',
  },
  dotsRow: {
    position: 'absolute',
    bottom: px(8),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: px(5),
    height: px(5),
    borderRadius: px(3),
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    marginHorizontal: px(2),
  },
  dotActive: {
    backgroundColor: '#fff',
  },
  heartButton: {
    position: 'absolute',
    top: px(10),
    right: px(8),
    width: px(27),
    height: px(27),
    borderRadius: px(14),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  productName: {
    ...F,
    fontSize: fontScale(12),
    color: '#1D1F22',
    fontWeight: '500',
    marginTop: px(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(3),
  },
  productPrice: {
    ...F,
    fontSize: fontScale(15),
    color: '#1D1F22',
    fontWeight: '700',
    marginRight: px(8),
  },
  productOldPrice: {
    ...F,
    fontSize: fontScale(11),
    color: '#BEBFC4',
    textDecorationLine: 'line-through',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: px(4),
  },
  starsRow: {
    flexDirection: 'row',
  },
  starIcon: {
    marginRight: px(1),
  },
  ratingCount: {
    ...F,
    fontSize: fontScale(9),
    color: '#1D1F22',
    marginLeft: px(4),
  },
  /* ---------- STATES ---------- */
  shopsState: {
    width: px(120),
    paddingVertical: px(40),
  },
  gridState: {
    marginTop: px(24),
  },
  stateText: {
    ...F,
    color: '#888',
    textAlign: 'center',
    marginTop: px(24),
    fontSize: fontScale(12),
  },
  stateError: {
    ...F,
    color: 'red',
    padding: px(20),
    fontSize: fontScale(12),
  },
});

export default SearchScreen;
