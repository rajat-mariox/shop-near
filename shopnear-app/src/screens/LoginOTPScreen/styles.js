import { StyleSheet } from 'react-native'
import { Colors } from '../../themes/Colors';
import { KEYPAD_HEIGHT } from '../../components/NumericKeypad/styles';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

// Poppins project me bundle nahi hai, isliye fontFamily set nahi ki gayi —
// warna Android par fontWeight ignore ho jaata hai aur text bold nahi hota.
// Har text ko alignSelf: 'stretch' diya gaya hai, warna centered parent me
// Android text ki width kam measure karke aakhri letter kaat deta hai.
export const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(6),
    alignSelf: 'flex-start',
  },
  backText: {
    color: Colors.BLACK1,
    fontSize: fontScale(17),
    marginLeft: scale(8),
  },
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
  },
  spacer: {
    flex: 1,
  },
  keypadPlaceholder: {
    height: KEYPAD_HEIGHT,
  },
  logo: {
    width: scale(150),
    height: scale(150),
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: verticalScale(24),
  },
  heading: {
    color: Colors.BLACK1,
    fontSize: fontScale(24),
    fontWeight: 'bold',
    textAlign: 'center',
    alignSelf: 'stretch',
    marginBottom: verticalScale(18),
  },
  otpHeading: {
    color: Colors.BLACK1,
    fontWeight: '600',
    fontSize: fontScale(24),
    lineHeight: fontScale(32),
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: verticalScale(10),
  },
  subHeading: {
    color: Colors.GRAY6,
    fontWeight: '400',
    fontSize: fontScale(16),
    lineHeight: fontScale(24),
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: verticalScale(12),
  },
  input: {
    height: verticalScale(52),
    borderColor: Colors.GRAY5,
    borderWidth: 1,
    paddingHorizontal: scale(18),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    marginBottom: verticalScale(16),
  },
  inputFocused: {
    borderColor: Colors.theme1,
  },
  inputText: {
    fontSize: fontScale(16),
    color: Colors.BLACK,
    alignSelf: 'stretch',
  },
  inputPlaceholder: {
    fontSize: fontScale(16),
    color: Colors.GRAY5,
    alignSelf: 'stretch',
  },
  button: {
    backgroundColor: Colors.theme1,
    height: verticalScale(52),
    borderRadius: moderateScale(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: fontScale(17),
    color: Colors.WHITE1,
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: verticalScale(28),
  },
  OTPInput: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderColor: Colors.GRAY5,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(4),
    borderRadius: moderateScale(10),
  },
  OTPInputFilled: {
    borderColor: Colors.theme1,
  },
  OTPInputActive: {
    borderColor: Colors.theme1,
  },
  OTPInputText: {
    fontSize: fontScale(20),
    color: Colors.BLACK1,
    fontWeight: '600',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  resendText: {
    color: Colors.BLACK1,
    fontSize: fontScale(15),
    textAlign: 'center',
    alignSelf: 'stretch',
    marginTop: verticalScale(18),
  },
  resendAction: {
    color: '#FF3B6B',
    fontWeight: '500',
  },
  resendDisabled: {
    color: Colors.GRAY6,
  },
  termsText: {
    color: Colors.GRAY6,
    fontSize: fontScale(12.5),
    lineHeight: fontScale(18),
    textAlign: 'center',
    alignSelf: 'stretch',
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(14),
  },
  linkText: {
    color: '#2F80ED',
  },
});
