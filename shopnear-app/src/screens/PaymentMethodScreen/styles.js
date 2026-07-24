import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../themes/Colors';
import { fontScale } from '../../utils/responsive';

const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;

// OEM system fonts (Moto etc.) par text measurement fix
const F = { fontFamily: 'sans-serif' };

// Header ke neeche wali scallop (lehar) edge — coral circles ki row jo aadhi
// header me chhupi rehti hai aur aadhi white body par latakti hai
const SCALLOP_SIZE = px(24);
export const SCALLOP_COUNT = Math.ceil(SCREEN_W / SCALLOP_SIZE) + 1;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
  },
  /* ---------- HEADER ---------- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.theme1,
    paddingTop: px(18),
    paddingBottom: px(22),
    paddingHorizontal: px(16),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(17),
    fontWeight: '600',
    marginLeft: px(14),
  },
  scallopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -SCALLOP_SIZE / 2,
    marginBottom: px(4),
  },
  scallop: {
    width: SCALLOP_SIZE,
    height: SCALLOP_SIZE,
    borderRadius: SCALLOP_SIZE / 2,
    backgroundColor: Colors.theme1,
    marginHorizontal: -px(1),
  },
  scrollContent: {
    paddingHorizontal: px(14),
    paddingBottom: px(20),
  },
  /* ---------- BILL TOTAL ---------- */
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: px(10),
    marginBottom: px(4),
  },
  billLabel: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
  },
  billValue: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
  },
  /* ---------- SECTIONS ---------- */
  sectionTitle: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#1D1F22',
    marginTop: px(16),
    marginBottom: px(10),
  },
  sectionTitleInline: {
    marginTop: 0,
    marginBottom: 0,
  },
  boxInfo: {
    flex: 1,
  },
  boxSelected: {
    borderWidth: 1.5,
    borderColor: Colors.theme1,
  },
  /* ---------- COD ---------- */
  codBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: px(12),
    padding: px(14),
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
  },
  codIcon: {
    width: px(46),
    height: px(46),
    resizeMode: 'contain',
    marginRight: px(14),
  },
  codTitle: {
    ...F,
    fontSize: fontScale(14.5),
    fontWeight: '700',
    color: '#1D1F22',
  },
  codDesc: {
    ...F,
    fontSize: fontScale(11),
    lineHeight: fontScale(15),
    color: '#777',
    marginTop: px(3),
  },
  /* ---------- WALLETS ---------- */
  walletBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: px(12),
    paddingVertical: px(14),
    paddingHorizontal: px(14),
    marginBottom: px(10),
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
  },
  walletLogoArea: {
    width: px(86),
    marginRight: px(10),
  },
  brandText: {
    ...F,
    fontSize: fontScale(15),
    fontWeight: '800',
  },
  brandTextSmall: {
    fontSize: fontScale(12.5),
  },
  walletName: {
    ...F,
    flex: 1,
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#1D1F22',
  },
  /* ---------- CARDS ---------- */
  cardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: px(16),
    marginBottom: px(10),
  },
  addCard: {
    ...F,
    color: '#1DB954',
    fontWeight: '700',
    fontSize: fontScale(13),
  },
  cardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: px(12),
    paddingVertical: px(14),
    paddingHorizontal: px(14),
    marginBottom: px(10),
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 1,
  },
  cardLogo: {
    width: px(40),
    height: px(30),
    resizeMode: 'contain',
    marginRight: px(14),
  },
  cardType: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#1D1F22',
  },
  cardHolder: {
    ...F,
    fontSize: fontScale(11),
    color: '#888',
    marginTop: px(2),
  },
  /* ---------- CONTINUE ---------- */
  continueBtn: {
    backgroundColor: Colors.theme1,
    paddingVertical: px(15),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(10),
    elevation: 6,
    marginVertical: px(10),
    width: '92%',
    alignSelf: 'center',
  },
  continueBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
