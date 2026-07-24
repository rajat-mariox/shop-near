import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    height: '100%',
  },
  // Image card ke peeche tak jaati hai, taaki card ke rounded corners me image dikhe
  topSection: {
    width: '100%',
    height: height * 0.66,
    position: 'relative',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  topImage: {
    width: '100%',
    height: '100%',
  },
  skipButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? verticalScale(59) : verticalScale(48),
    right: scale(20),
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: moderateScale(50),
    borderWidth: 1,
    borderColor: '#484848',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(4),
  },
  // Android par centered parent me Text apni width thodi kam measure karta hai
  // aur aakhri letter kat jaata hai, isliye har text ko poori width di gayi hai
  skipText: {
    color: '#484848',
    fontFamily: 'Poppins-Regular',
    fontSize: fontScale(14),
    letterSpacing: 0.14,
    textAlign: 'center',
    minWidth: scale(31),
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    backgroundColor: Colors.theme1,
    borderTopLeftRadius: moderateScale(45),
    borderTopRightRadius: moderateScale(45),
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(32),
    paddingBottom: verticalScale(36),
    alignItems: 'center',
    minHeight: height * 0.40,
  },
  // Custom font ke saath fontWeight Android par system font par fallback kara
  // deta hai, isliye har weight ki alag family file use ki gayi hai
  title: {
    color: '#fff',
    fontFamily: 'Poppins-SemiBold',
    fontSize: fontScale(22),
    lineHeight: fontScale(25),
    includeFontPadding: false,
    letterSpacing: 0.22,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: verticalScale(10),
    marginBottom: verticalScale(12),
  },
  subtitle: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: fontScale(14),
    letterSpacing: 0.14,
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: verticalScale(24),
    lineHeight: fontScale(23),
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  dot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    backgroundColor: '#fff',
    opacity: 0.5,
    marginHorizontal: scale(4),
  },
  activeDot: {
    opacity: 1,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(8),
    height: verticalScale(54),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(18),
    marginTop: verticalScale(2),
  },
  loginButtonText: {
    color: Colors.theme1,
    fontFamily: 'Poppins-Medium',
    fontSize: fontScale(16),
    lineHeight: fontScale(23),
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  termsText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: fontScale(13),
    lineHeight: fontScale(19),
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: verticalScale(2),
  },
  linkText: {
    color: '#F6D067',
  },
});
