import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ComingSoonModal from '../../components/ComingSoonModal';
import { registerDeviceToken } from '../../service/notificationService';
import Feather from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import Video, { ViewType } from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import { styles, HEADER_TOP_PADDING } from './styles';
import { moderateScale } from '../../utils/responsive';
import { imageSource } from '../../utils/media';
import { getTokenStorage } from '../../utils/tokenStorage';
import { fetchUserProfile } from '../../service/userProfile';
import { fetchHomeScreen } from '../../service/homeService';
import { getCurrentLocation, reverseGeocodeLabel } from '../../utils/location';

// Header ka wrapper — admin se aaya background (image/video) ya default asset.
// Image ke liye ImageBackground zaroori hai: content-sized parent me percentage/
// absolute-fill wali Image banner load hone ke BAAD wali badi height nahi leti
// (neeche white patti reh jati thi) — ImageBackground parent ke saath grow karta hai.
const HeaderContainer = ({ headerBg, style, children }) => {
  const [failed, setFailed] = useState(false);
  const useAdminBg = !!headerBg?.url && !failed;

  if (useAdminBg && headerBg.type === 'video') {
    return (
      <View style={style}>
        <Video
          source={{ uri: headerBg.url }}
          style={styles.headerBgMedia}
          resizeMode="cover"
          muted
          repeat
          playInBackground={false}
          disableFocus
          viewType={ViewType.TEXTURE}
          onError={() => setFailed(true)}
        />
        {children}
      </View>
    );
  }
  return (
    <ImageBackground
      source={useAdminBg ? { uri: headerBg.url } : AppImages.headerBg}
      style={style}
      onError={useAdminBg ? () => setFailed(true) : undefined}>
      {children}
    </ImageBackground>
  );
};

// Banner slide ka admin-controlled background (image/video). Video fail ho
// (URL toota, network nahi) to black box ki jagah kuch nahi dikhta.
const BannerSlideBg = ({ banner }) => {
  const [failed, setFailed] = useState(false);

  // Admin ne slide ka background na diya ho (ya load fail ho) to kuch nahi:
  // header ka background hi dikhta hai. Pehle yahan default wooden fence tha,
  // jo admin panel se control nahi hota tha, isliive hataya.
  if (!banner.bgMedia || failed) {
    return null;
  }
  if (banner.bgMediaType === 'video') {
    return (
      <Video
        source={{ uri: banner.bgMedia }}
        style={styles.bannerBgMedia}
        resizeMode="cover"
        muted
        repeat
        playInBackground={false}
        disableFocus
        // TextureView — SurfaceView screenshots me black aata hai aur
        // rounded/clipped layouts ke saath sahi behave nahi karta
        viewType={ViewType.TEXTURE}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <Image
      source={imageSource(banner.bgMedia)}
      style={styles.bannerBgMedia}
      resizeMode="cover"
      onError={() => setFailed(true)}
    />
  );
};

// Offer card ka gradient. react-native-svg pehle se project me hai, isliye
// koi nayi gradient library add karne ki zaroorat nahi padi.
const OfferGradient = ({ from, to }) => (
  <Svg style={{ position: 'absolute', width: '100%', height: '100%' }}>
    <Defs>
      <LinearGradient id="offerGrad" x1="1" y1="1" x2="0" y2="0">
        <Stop offset="0" stopColor={from} />
        <Stop offset="1" stopColor={to} />
      </LinearGradient>
    </Defs>
    <Rect x="0" y="0" width="100%" height="100%" fill="url(#offerGrad)" />
  </Svg>
);

// Promo card ke banner ki halki tints — Figma me har card alag rang ka hai
// (violet/orange), backend rang nahi bhejta isliye index se rotate hoti hain.
const PROMO_TINTS = [
  { bg: '#F1EEFF', accent: '#6466FD' },
  { bg: '#FFF1E2', accent: '#E98A0C' },
  { bg: '#FFECE9', accent: '#FF6051' },
];

const Dashboard = (props) => {
  const navigation = props.navigation;
  // Header status bar ke peeche tak jaata hai (onboarding screen ki tarah)
  const insets = useSafeAreaInsets();
  const [userProfile, setUserProfile] = useState(null);
  // Abhi live nahi (camera search) — Coming Soon popup. Wallet aur voice search hata diye gaye.
  const [comingSoon, setComingSoon] = useState(null); // { title, subtitle, icon } | null
  const COMING_SOON = {
    camera: {
      title: 'Camera Search',
      subtitle: 'Photo khinch kar product dhoondho — jald hi aa raha hai!',
      icon: AppImages.camera,
      iconTint: '#fff', // red PNG orange circle par gayab ho jata hai
    },
  };
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  // Live location - app khulte hi GPS se; isi ke around "Shops Near You" aati hain.
  // Order hamesha checkout par chune gaye saved address par jaata hai, is se nahi.
  const [liveLocation, setLiveLocation] = useState(null); // { lat, lng, label }

  const loadHomeScreen = useCallback((coords = null) => {
    setLoading(true);
    setError(null);
    fetchHomeScreen(coords).then((result) => {
      if (result.success) {
        setHomeData(result.data);
      } else {
        setError(result.message || 'Home screen load nahi ho paayi');
      }
      setLoading(false);
    });
  }, []);

  // GPS lo -> home load karo (deny/fail par bina coords: backend saved address try karta hai)
  const locateAndLoad = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      setLiveLocation({ ...coords, label: null });
      // Label alag se - geocode slow ho to home data ruke nahi
      reverseGeocodeLabel(coords).then((label) => {
        if (label) setLiveLocation((prev) => (prev ? { ...prev, label } : prev));
      });
    }
    loadHomeScreen(coords);
  }, [loadHomeScreen]);

  useEffect(() => {
    fetchUserProfile().then((result) => {
      if (result.success) setUserProfile(result.data);
    });
    locateAndLoad();
    // FCM token backend par save (order status / delivery OTP push ke liye)
    registerDeviceToken();
  }, [locateAndLoad]);

  const requireLogin = async (routeName, params) => {
    const token = await getTokenStorage();
    navigation.navigate(token ? routeName : 'Login', token ? params : undefined);
  };

  // Banner tabhi clickable hai jab backend ne aisa target bheja ho jiske liye screen maujood hai
  const bannerTarget = (banner) =>
    banner.redirectType === 'product' && banner.productId ? banner.productId : null;

  // Header me live location ka label; geocode na mila/permission nahi to saved address
  const deliveryLocation =
    liveLocation?.label ||
    (liveLocation ? 'Current location' : '') ||
    homeData?.delivery?.location ||
    userProfile?.fullName ||
    '';

  const renderHeader = () => (
    <HeaderContainer
      headerBg={homeData?.headerBg}
      style={[styles.header, { paddingTop: insets.top + HEADER_TOP_PADDING }]}>
      {/* Festive string lights, status bar ke theek neeche. Admin panel (Banners >
          Home Header Background) se on/off hoti hain: headerBg.showLights */}
      {homeData?.headerBg?.showLights !== false && (
        <Image
          source={AppImages.headerLights}
          style={[styles.headerLights, { top: insets.top }]}
        />
      )}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.deliveryLabel}>Delivery in</Text>
          <Text style={styles.deliveryTime}>
            {homeData?.delivery?.estimatedDeliveryTime || ''}
          </Text>
          {deliveryLocation ? (
            <TouchableOpacity
              style={styles.locationRow}
              onPress={() => requireLogin('SavedAddress')}>
              <Ionicons name="location-outline" size={moderateScale(15)} color="#fff" />
              <Text numberOfLines={1} style={styles.locationText}>
                {deliveryLocation}
              </Text>
              <AntDesign name="down" size={moderateScale(11)} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => requireLogin('ProfileScreen')}>
            <Feather name="menu" size={moderateScale(22)} color={Colors.theme1} />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('Search')}>
        <AntDesign name="search1" size={moderateScale(18)} color="#353535" />
        <Text style={styles.searchPlaceholder}>Search</Text>
      </TouchableOpacity>

      {homeData?.banners && homeData.banners.length > 0 && (
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {homeData.banners.map((banner, idx) => (
            <View key={banner._id || idx} style={styles.bannerSlide}>
              {/* Admin se aaya background (image/video) slide ke peeche full-size
                  lagta hai; na ho (ya load fail ho) to default fence design */}
              <BannerSlideBg banner={banner} />
              <Image
                source={imageSource(banner.image, AppImages.girl)}
                style={styles.bannerImage}
              />
              <View style={styles.bannerContent}>
                <Text numberOfLines={2} style={styles.bannerTitle}>
                  {banner.title}
                </Text>
                {banner.subtitle ? (
                  <Text numberOfLines={2} style={styles.bannerSubtitle}>
                    {banner.subtitle}
                  </Text>
                ) : null}
                {bannerTarget(banner) ? (
                  <TouchableOpacity
                    style={styles.bannerButton}
                    onPress={() =>
                      navigation.navigate('ProductDetailScreen', {
                        productId: bannerTarget(banner),
                      })
                    }>
                    <Text style={styles.bannerButtonText}>Shop Now</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </HeaderContainer>
  );

  const renderCategories = () => {
    if (!homeData?.categories?.length) return null;
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}>
        {homeData.categories.map((cat, idx) => {
          const isActive = (activeCategory || homeData.categories[0]?._id) === cat._id;
          return (
            <TouchableOpacity
              key={cat._id || idx}
              onPress={() => {
                setActiveCategory(cat._id);
                navigation.navigate('ShopsByCategory', {
                  categoryId: cat._id,
                  categoryName: cat.categoryName,
                });
              }}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}>
              <Image source={imageSource(cat.image, AppImages.shop)} style={styles.chipImage} />
              <Text
                numberOfLines={2}
                style={[
                  styles.chipText,
                  isActive ? styles.chipTextActive : styles.chipTextInactive,
                ]}>
                {cat.categoryName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  // Shops na hon to wajah dikhao: location hi nahi mili vs radius me koi shop nahi
  const renderShopsEmpty = () => {
    const hasLocation = homeData?.nearby?.hasLocation;
    const radiusKm = homeData?.nearby?.radiusKm;
    return (
      <View style={styles.shopsEmpty}>
        <Ionicons
          name={hasLocation ? 'storefront-outline' : 'location-outline'}
          size={moderateScale(28)}
          color="#9AA39E"
        />
        <Text style={styles.shopsEmptyTitle}>
          {hasLocation ? 'Aapke area mein abhi koi shop nahi' : 'Location on karein'}
        </Text>
        <Text style={styles.shopsEmptyText}>
          {hasLocation
            ? `Aapke ${radiusKm ? `${radiusKm} km ` : ''}ke aas-paas abhi koi shop nahi hai. Jald hi aayengi!`
            : 'Aas-paas ki shops dekhne ke liye location permission dein'}
        </Text>
        <TouchableOpacity style={styles.shopsEmptyBtn} onPress={locateAndLoad}>
          <Text style={styles.shopsEmptyBtnText}>
            {hasLocation ? 'Refresh' : 'Enable location'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderShops = () => {
    if (!homeData) return null;
    const shops = homeData.nearbyShops || [];
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Shops Near You</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>View All</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSubtitle}>
          Verified local sellers delivering in under 30 mins
        </Text>

        {shops.length === 0 ? renderShopsEmpty() : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}>
          {homeData.nearbyShops.map((shop, idx) => (
            <View key={shop._id || idx} style={styles.shopCard}>
              <Image source={imageSource(shop.image, AppImages.shop)} style={styles.shopImage} />
              <View style={styles.shopInfo}>
                <View style={styles.shopNameRow}>
                  <Text numberOfLines={1} style={styles.shopName}>
                    {shop.name}
                  </Text>
                  {shop.isVerified ? (
                    <AntDesign name="checkcircle" size={moderateScale(13)} color="#2ecc71" />
                  ) : null}
                </View>

                {shop.distance || shop.rating > 0 ? (
                  <View style={styles.shopMetaRow}>
                    {shop.distance ? (
                      <>
                        <Ionicons name="location-outline" size={moderateScale(13)} color="#0A130F" />
                        <Text style={styles.shopMetaText}>{shop.distance}</Text>
                      </>
                    ) : null}
                    {shop.rating > 0 ? (
                      <>
                        <AntDesign
                          name="star"
                          size={moderateScale(13)}
                          color="#FFC107"
                          style={{ marginLeft: shop.distance ? 10 : 0 }}
                        />
                        <Text style={styles.shopRatingText}>
                          {shop.rating}(By {shop.totalRatings}+)
                        </Text>
                      </>
                    ) : null}
                  </View>
                ) : null}

                {shop.offerText ? (
                  <View style={styles.offerChip}>
                    <Image
                      source={AppImages.dicount}
                      style={{ height: moderateScale(13), width: moderateScale(13) }}
                    />
                    <Text style={styles.offerChipText}>{shop.offerText}</Text>
                  </View>
                ) : null}

                <View style={styles.shopButtonRow}>
                  {shop.itemCount > 0 ? (
                    <View style={[styles.pill, styles.pillItems]}>
                      <Text style={styles.pillSmallText}>Added New</Text>
                      <Text style={styles.pillText}>{shop.itemCount} items</Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.pill, styles.pillProducts]}
                    onPress={() =>
                      // Search tab ka redesigned product-list screen, isi shop
                      // ke saath selected
                      navigation.navigate('Search', { sellerId: shop._id })
                    }>
                    <Text style={styles.pillText}>View Products</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
        )}
      </View>
    );
  };

  const renderOffers = () => {
    if (!homeData?.offers?.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Save up to 50% + Extra Discount</Text>
        </View>
        <View style={styles.offerGrid}>
          {homeData.offers.map((offer, idx) => {
            const from = offer.bgColor || '#FFE9C6';
            const to = offer.bgColorEnd || from;
            // Halke background par gehra text, gehre par safed
            const isLight = !offer.bgColorEnd;
            const fg = isLight ? '#10111B' : '#FFFFFF';
            const off =
              offer.discountPercentage
                ? `${offer.discountPercentage}% OFF`
                : offer.discountAmount
                  ? `₹${offer.discountAmount} OFF`
                  : null;
            return (
              <View key={offer._id || idx} style={styles.offerCard}>
                <OfferGradient from={from} to={to} />
                <View style={styles.offerCardInner}>
                  <View style={styles.offerTextBox}>
                    <Text numberOfLines={1} style={[styles.offerTitle, { color: fg }]}>
                      {offer.title}
                    </Text>
                    <Text numberOfLines={2} style={[styles.offerSubtitle, { color: fg }]}>
                      {offer.description || `offer starting\nat ₹ ${offer.priceStartsAt}`}
                    </Text>
                    <View style={[styles.offerArrow, { borderColor: fg }]}>
                      <AntDesign name="arrowright" size={moderateScale(11)} color={fg} />
                    </View>
                  </View>
                  <Image
                    source={imageSource(offer.image, AppImages.shirt)}
                    style={styles.offerImage}
                  />
                </View>
                {off ? (
                  <View style={styles.offerBadge}>
                    <Text style={styles.offerBadgeText}>{off}</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderBrands = () => {
    if (!homeData?.brands?.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Popular Brand</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}>
          {homeData.brands.map((brand, idx) => {
            const color = brand.themeColor || '#B11116';
            return (
              <View key={brand._id || idx}>
                <View style={[styles.brandCard, { borderColor: color }]}>
                  <Image
                    source={imageSource(brand.logo, AppImages.gucci)}
                    style={styles.brandLogo}
                  />
                  {brand.offer ? (
                    <View style={[styles.brandBadge, { backgroundColor: color }]}>
                      <Text numberOfLines={1} style={styles.brandBadgeText}>
                        {brand.offer}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {brand.name ? (
                  <Text numberOfLines={1} style={styles.brandName}>
                    {brand.name}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderPromoCodes = () => {
    if (!homeData?.promoCodes?.length) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Promo Codes for More Savings</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}>
          {/* Design (Figma 162:3211) me banner ke andar title/desc/"Use code" pill
              dikhte hain — wahan wo image me baked hai, yahan admin alag-alag
              fields + image bhejta hai. Isliye banner compose hota hai: left me
              coupon ka data, right me admin ki image — image lagane par bhi
              poora data dikhta hai. */}
          {homeData.promoCodes.map((promo, idx) => {
            const tint = PROMO_TINTS[idx % PROMO_TINTS.length];
            const title =
              promo.title ||
              (promo.discountType === 'percentage'
                ? `Get ${promo.discountValue}% instant Discount`
                : `Flat ₹ ${promo.discountValue} Instant OFF`);
            // Description ke saath min-order bhi — admin ka poora data dikhe
            const subtitle = [
              promo.description,
              promo.minOrderValue ? `Min order ₹ ${promo.minOrderValue}` : null,
            ]
              .filter(Boolean)
              .join(' · ');
            return (
              <View key={promo._id || idx} style={styles.promoCard}>
                <View style={[styles.promoBanner, { backgroundColor: tint.bg }]}>
                  <View style={styles.promoBannerTop}>
                    <View style={styles.promoInfo}>
                      <Text numberOfLines={2} style={styles.promoTitle}>
                        {title}
                      </Text>
                      {subtitle ? (
                        <Text numberOfLines={2} style={styles.promoDesc}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {promo.image ? (
                      <Image
                        source={imageSource(promo.image)}
                        style={styles.promoGraphic}
                      />
                    ) : null}
                  </View>
                  {/* Pill alag row me hai (text column ke andar nahi) taaki
                      lambe coupon codes ko poori banner width mile */}
                  {promo.code ? (
                    <View
                      style={[styles.promoCodePill, { borderColor: tint.accent }]}>
                      <Text
                        numberOfLines={1}
                        style={[styles.promoCodeText, { color: tint.accent }]}>
                        Use code {promo.code}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.promoFooterRow}>
                  <Text numberOfLines={1} style={styles.promoValidity}>
                    {promo.validity}
                  </Text>
                  <Text style={styles.promoLink}>Know more</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  // Navigator khud status bar ki jagah bhar deta hai, isliye yahan top inset nahi chahiye
  return (
    <View style={styles.sectionContainer}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {renderHeader()}

        {loading && (
          <View style={styles.stateBox}>
            <ActivityIndicator size="large" color={Colors.theme1} />
          </View>
        )}

        {!loading && error && (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadHomeScreen}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && (
          <>
            {renderCategories()}
            {renderShops()}
            {renderOffers()}
            {renderBrands()}
            {renderPromoCodes()}
          </>
        )}
      </ScrollView>
      <ComingSoonModal
        visible={!!comingSoon}
        onClose={() => setComingSoon(null)}
        title={comingSoon?.title}
        subtitle={comingSoon?.subtitle}
        icon={comingSoon?.icon}
        iconTint={comingSoon?.iconTint}
      />
    </View>
  );
};

export default Dashboard;
