import { StyleSheet } from 'react-native';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(28),
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    paddingVertical: verticalScale(28),
    paddingHorizontal: scale(22),
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  iconOuterRing: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: Colors.LIGHT_THEME,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(18),
  },
  iconInnerCircle: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(32),
    backgroundColor: Colors.theme1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Poppins bundle nahi hai (fontWeight ignore ho jaata hai) aur centered parent me
  // Android text ki width kam measure karta hai — isliye alignSelf: 'stretch'
  title: {
    fontSize: fontScale(20),
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: verticalScale(8),
  },
  subtitle: {
    fontSize: fontScale(14),
    color: '#8a8a8e',
    textAlign: 'center',
    alignSelf: 'stretch',
    lineHeight: fontScale(20),
    marginBottom: verticalScale(22),
  },
  button: {
    width: '100%',
    backgroundColor: Colors.theme1,
    height: verticalScale(50),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(16),
  },
  buttonText: {
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  skipButton: {
    alignSelf: 'stretch',
    paddingVertical: verticalScale(4),
  },
  skipText: {
    fontSize: fontScale(15),
    color: '#B2B3C7',
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
