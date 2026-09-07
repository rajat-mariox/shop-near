import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const { width } = Dimensions.get('window');

// Figma frame 402dp chaudi hai — usi ratio par sab size kiya gaya hai
const DESIGN_W = 402;
const px = (n) => (width / DESIGN_W) * n;

// Moto jaise OEM-font devices par shrink-wrap text render se chhota measure
// hota hai aur aakhri characters kat jaate hain — explicit fontFamily se
// dono paths same font par aate hain (har text style me F spread hota hai)
const F = { fontFamily: 'sans-serif' };

export const OFFER_CARD_W = px(175);
export const OFFER_CARD_H = px(102);
export const CHIP_W = px(177);
export const SHOP_CARD_W = px(317);

// Status bar inset ke upar itna extra padding, kyunki header full-bleed hai
export const HEADER_TOP_PADDING = verticalScale(8);

export const styles = StyleSheet.create({
    sectionContainer: {
        flex: 1,
        backgroundColor: Colors.WHITE,
    },
    scrollContent: {
        paddingBottom: verticalScale(90),
    },

    /* ---------------- HEADER ---------------- */
    header: {
        width: '100%',
        paddingBottom: px(14),
        overflow: 'hidden',
    },
    headerLights: {
        position: 'absolute',
        left: 0,
        right: 0,
        width: '100%',
        height: px(36),
        resizeMode: 'stretch',
    },
    bannerFence: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: px(149),
        height: px(113),
        resizeMode: 'stretch',
        opacity: 0.55,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        paddingHorizontal: px(15),
    },
    deliveryLabel: {
        color: '#fff',
        ...F,
        fontSize: fontScale(16),
        fontWeight: '500',
        alignSelf: 'stretch',
    },
    deliveryTime: {
        color: '#fff',
        ...F,
        fontSize: fontScale(28),
        fontWeight: '600',
        marginTop: px(-2),
        alignSelf: 'stretch',
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(6),
        maxWidth: px(250),
    },
    locationText: {
        color: '#fff',
        ...F,
        fontSize: fontScale(14),
        fontWeight: '500',
        marginHorizontal: px(5),
        flexShrink: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(20),
    },
    walletChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        height: px(40),
        borderRadius: px(20),
        paddingHorizontal: px(11),
        marginRight: px(14),
    },
    walletIcon: {
        width: px(20),
        height: px(20),
        resizeMode: 'contain',
        marginRight: px(4),
    },
    walletText: {
        color: '#2F2F2F',
        ...F,
        fontSize: fontScale(15),
        fontWeight: '600',
        minWidth: px(44),
    },
    menuButton: {
        height: px(40),
        width: px(40),
        borderRadius: px(20),
        backgroundColor: Colors.WHITE,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* ---------------- SEARCH ---------------- */
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        marginHorizontal: px(16),
        marginTop: px(16),
        borderRadius: px(8),
        paddingHorizontal: px(14),
        height: px(51),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
    },
    searchPlaceholder: {
        flex: 1,
        color: '#353535',
        ...F,
        fontSize: fontScale(16),
        marginLeft: px(12),
    },
    searchIcon: {
        height: px(22),
        width: px(22),
        resizeMode: 'contain',
    },
    searchDivider: {
        width: 1,
        height: px(31),
        backgroundColor: '#E0E0E0',
        marginHorizontal: px(16),
    },

    /* ---------------- BANNER ---------------- */
    bannerSlide: {
        width: width,
        height: px(122),
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(12),
    },
    // Admin se aaya poore header ka background (image/video) — header cover karta hai.
    // width/height explicit hain kyunki static (require) images par RN intrinsic
    // size laga deta hai jo left/right/top/bottom ko override kar deta hai
    headerBgMedia: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    },
    // Admin se aaya slide ka background (image/video) — poori slide cover karta hai
    bannerBgMedia: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
    },
    bannerImage: {
        width: px(140),
        height: px(122),
        resizeMode: 'contain',
    },
    bannerContent: {
        flex: 1,
        alignItems: 'center',
        paddingRight: px(16),
    },
    bannerTitle: {
        color: '#FCD793',
        ...F,
        fontSize: fontScale(24),
        fontWeight: '700',
        lineHeight: fontScale(28),
        textAlign: 'center',
        alignSelf: 'stretch',
        textShadowColor: 'rgba(0,0,0,0.25)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
    bannerSubtitle: {
        color: '#FCD793',
        ...F,
        fontSize: fontScale(15),
        textAlign: 'center',
        alignSelf: 'stretch',
        marginTop: px(4),
    },
    bannerButton: {
        backgroundColor: Colors.WHITE,
        borderRadius: px(5),
        paddingHorizontal: px(14),
        paddingVertical: px(4),
        marginTop: px(8),
    },
    bannerButtonText: {
        color: '#D5242A',
        ...F,
        fontSize: fontScale(12),
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'stretch',
    },

    /* ---------------- CATEGORY CHIPS ---------------- */
    chipRow: {
        paddingHorizontal: px(16),
        paddingVertical: px(16),
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        width: CHIP_W,
        height: px(66),
        borderRadius: px(14),
        borderWidth: 1,
        paddingHorizontal: px(18),
        marginRight: px(12),
    },
    chipActive: {
        backgroundColor: '#FF6051',
        borderColor: '#EF3625',
    },
    chipInactive: {
        backgroundColor: Colors.WHITE,
        borderColor: '#EBEBEB',
    },
    chipImage: {
        height: px(42),
        width: px(55),
        resizeMode: 'contain',
        marginRight: px(14),
    },
    chipText: {
        flex: 1,
        ...F,
        fontSize: fontScale(16),
        fontWeight: '500',
        lineHeight: fontScale(19),
    },
    chipTextActive: {
        color: Colors.WHITE,
    },
    chipTextInactive: {
        color: '#303030',
    },

    /* ---------------- SECTIONS ---------------- */
    section: {
        paddingTop: px(20),
        borderTopWidth: px(5),
        borderTopColor: '#F1F1F1',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px(18),
    },
    sectionTitle: {
        color: '#10111B',
        fontWeight: '700',
        ...F,
        fontSize: fontScale(18),
        flex: 1,
    },
    sectionLink: {
        color: '#10111B',
        ...F,
        fontSize: fontScale(12),
        minWidth: px(60),
        textAlign: 'right',
    },
    sectionSubtitle: {
        color: '#0A130F',
        ...F,
        fontSize: fontScale(12),
        paddingHorizontal: px(18),
        marginTop: px(6),
        alignSelf: 'stretch',
    },

    /* ---------------- SHOP CARD ---------------- */
    hList: {
        paddingHorizontal: px(16),
        paddingVertical: px(10),
    },
    shopCard: {
        width: SHOP_CARD_W,
        backgroundColor: Colors.WHITE,
        borderRadius: px(14),
        marginRight: px(12),
        padding: px(5),
        flexDirection: 'row',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    shopImage: {
        width: px(110),
        height: px(132),
        borderRadius: px(14),
    },
    shopInfo: {
        flex: 1,
        paddingLeft: px(10),
        paddingTop: px(9),
    },
    shopNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    shopName: {
        color: '#10111B',
        fontWeight: '700',
        ...F,
        fontSize: fontScale(17),
        flex: 1,
    },
    shopMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(10),
    },
    shopMetaText: {
        color: '#0A130F',
        ...F,
        fontSize: fontScale(12),
        marginLeft: px(3),
    },
    shopRatingText: {
        color: '#2F2F2F',
        ...F,
        fontSize: fontScale(12),
        fontWeight: '500',
        marginLeft: px(3),
    },
    offerChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(54,150,60,0.08)',
        alignSelf: 'flex-start',
        paddingHorizontal: px(5),
        height: px(25),
        borderRadius: px(4),
        marginTop: px(9),
    },
    offerChipText: {
        color: '#339334',
        ...F,
        fontSize: fontScale(12),
        fontWeight: '600',
        marginLeft: px(4),
    },
    shopButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: px(9),
    },
    // Android row ke andar text ki width kam measure karta hai, isliye
    // dono pills ki width design se li gayi hai (72 + 8 + 112 = 192)
    pill: {
        borderWidth: 1,
        borderColor: '#FF6051',
        borderRadius: px(50),
        height: px(32),
        paddingHorizontal: px(6),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: px(8),
    },
    pillItems: {
        minWidth: px(72),
    },
    pillProducts: {
        minWidth: px(112),
    },
    pillSmallText: {
        color: '#10111B',
        ...F,
        fontSize: fontScale(8),
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'stretch',
    },
    pillText: {
        color: '#10111B',
        ...F,
        fontSize: fontScale(12),
        fontWeight: '500',
        textAlign: 'center',
        alignSelf: 'stretch',
    },

    /* ---------------- OFFERS GRID ---------------- */
    offerGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: px(19),
        paddingTop: px(16),
    },
    offerCard: {
        width: OFFER_CARD_W,
        height: OFFER_CARD_H,
        borderRadius: px(10),
        marginBottom: px(14),
        overflow: 'hidden',
    },
    offerCardInner: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        padding: px(10),
    },
    offerTextBox: {
        flex: 1,
    },
    offerTitle: {
        fontWeight: '700',
        ...F,
        fontSize: fontScale(19),
        alignSelf: 'stretch',
    },
    offerSubtitle: {
        ...F,
        fontSize: fontScale(12),
        lineHeight: fontScale(15),
        marginTop: px(5),
        alignSelf: 'stretch',
    },
    offerArrow: {
        height: px(22),
        width: px(22),
        borderRadius: px(11),
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: px(6),
    },
    offerImage: {
        width: px(78),
        height: px(88),
        resizeMode: 'contain',
        alignSelf: 'center',
        transform: [{ rotate: '-14.87deg' }],
    },
    offerBadge: {
        position: 'absolute',
        top: px(6),
        right: px(6),
        backgroundColor: 'rgba(0,0,0,0.35)',
        borderRadius: px(4),
        paddingHorizontal: px(6),
        paddingVertical: px(1),
    },
    offerBadgeText: {
        color: '#fff',
        ...F,
        fontSize: fontScale(10),
        fontWeight: '700',
        minWidth: px(52),
        textAlign: 'center',
    },

    /* ---------------- BRANDS ---------------- */
    brandCard: {
        width: px(100),
        height: px(100),
        borderWidth: 1,
        borderRadius: px(10),
        marginRight: px(13),
        backgroundColor: Colors.WHITE,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    brandLogo: {
        width: px(78),
        height: px(60),
        resizeMode: 'contain',
    },
    brandBadge: {
        position: 'absolute',
        bottom: 0,
        height: px(18),
        width: px(66),
        borderTopLeftRadius: px(7),
        borderTopRightRadius: px(7),
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandBadgeText: {
        color: '#fff',
        ...F,
        fontSize: fontScale(12),
        fontWeight: '600',
        textAlign: 'center',
        alignSelf: 'stretch',
    },
    brandName: {
        width: px(100),
        marginRight: px(13),
        marginTop: px(4),
        color: '#10111B',
        ...F,
        fontSize: fontScale(11),
        fontWeight: '500',
        textAlign: 'center',
    },

    /* ---------------- PROMO CODES ---------------- */
    // Design: card 187 wide, banner 80 tall, neeche footer row (total ~100).
    // Banner compose hota hai: left me coupon data, right me admin ki image.
    promoCard: {
        width: px(187),
        backgroundColor: Colors.WHITE,
        borderRadius: px(6),
        marginRight: px(10),
    },
    promoBanner: {
        // 80 se badhaya: title 2 line + desc/min-order 2 line + code pill,
        // sab ek saath fit ho — data kabhi cut na ho
        height: px(96),
        borderTopLeftRadius: px(6),
        borderTopRightRadius: px(6),
        overflow: 'hidden',
        paddingHorizontal: px(10),
        paddingTop: px(8),
        paddingBottom: px(6),
    },
    // Upar ki row: left me title/desc, right me admin ki image
    promoBannerTop: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    promoInfo: {
        flex: 1,
        paddingRight: px(6),
    },
    promoTitle: {
        color: '#10111B',
        ...F,
        fontSize: fontScale(11),
        fontWeight: '700',
        lineHeight: fontScale(14),
    },
    promoDesc: {
        color: '#5A5A5A',
        ...F,
        fontSize: fontScale(8),
        lineHeight: fontScale(11),
        marginTop: px(2),
    },
    // Fixed width (banner ki content width): shrink-to-content par Android
    // pehle mount me text ko chhota measure karke code ko "…" kar deta tha,
    // fixed width me measurement ka sawaal hi nahi uthta.
    promoCodePill: {
        width: px(167),
        backgroundColor: Colors.WHITE,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: px(4),
        paddingHorizontal: px(5),
        paddingVertical: px(2),
    },
    promoCodeText: {
        ...F,
        fontSize: fontScale(8),
        fontWeight: '600',
    },
    promoGraphic: {
        width: px(46),
        height: px(46),
        borderRadius: px(4),
        resizeMode: 'contain',
    },
    promoFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: px(10),
        marginTop: px(3),
    },
    promoValidity: {
        color: '#000',
        ...F,
        fontSize: fontScale(9),
        fontWeight: '600',
        flex: 1,
    },
    promoLink: {
        color: '#6466FD',
        ...F,
        fontSize: fontScale(9),
        minWidth: px(58),
        textAlign: 'right',
    },

    /* ---------------- STATES ---------------- */
    stateBox: {
        paddingVertical: verticalScale(40),
        alignItems: 'center',
    },
    stateText: {
        color: '#8a8a8e',
        ...F,
        fontSize: fontScale(14),
        textAlign: 'center',
        alignSelf: 'stretch',
        marginBottom: verticalScale(12),
    },
    retryButton: {
        backgroundColor: Colors.theme1,
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(22),
        paddingVertical: verticalScale(9),
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
        ...F,
        fontSize: fontScale(14),
        textAlign: 'center',
        alignSelf: 'stretch',
    },
    // "Shops Near You" empty state (location nahi / radius me shop nahi)
    shopsEmpty: {
        alignItems: 'center',
        paddingVertical: verticalScale(18),
        paddingHorizontal: scale(20),
        marginTop: verticalScale(8),
        borderRadius: moderateScale(12),
        backgroundColor: '#F4F6F5',
    },
    shopsEmptyTitle: {
        ...F,
        fontSize: fontScale(14),
        fontWeight: 'bold',
        color: '#0A130F',
        marginTop: verticalScale(8),
        textAlign: 'center',
    },
    shopsEmptyText: {
        ...F,
        fontSize: fontScale(12),
        color: '#6B736F',
        marginTop: verticalScale(4),
        textAlign: 'center',
    },
    shopsEmptyBtn: {
        marginTop: verticalScale(12),
        backgroundColor: Colors.theme1,
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(8),
    },
    shopsEmptyBtnText: {
        ...F,
        color: '#fff',
        fontWeight: 'bold',
        fontSize: fontScale(13),
    },
});
