import { StyleSheet, Dimensions } from 'react-native';
import { verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const { width } = Dimensions.get('window');

const SIDE_PADDING = 16;
const KEY_GAP = 12;
const ROW_GAP = 9;
// 3 keys + 2 gaps + dono taraf ka padding = poori width
const KEY_WIDTH = (width - SIDE_PADDING * 2 - KEY_GAP * 2) / 3;
const KEY_HEIGHT = moderateScale(46);

// Keypad band hone par screen isi height ki khaali jagah reserve karti hai,
// taaki keypad khulte waqt upar ka content apni jagah se hile nahi
export const KEYPAD_HEIGHT =
  verticalScale(10) + 4 * (KEY_HEIGHT + ROW_GAP) + verticalScale(10);

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E4E4E9',
    paddingHorizontal: SIDE_PADDING,
    paddingTop: verticalScale(10),
    paddingBottom: verticalScale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: ROW_GAP,
  },
  key: {
    width: KEY_WIDTH,
    height: KEY_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: moderateScale(6),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  blankKey: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  // alignSelf: 'stretch' zaroori hai — centered parent me Android text ki width
  // kam measure karke aakhri letter kaat deta hai (jaise "def" ka "f")
  keyText: {
    fontSize: fontScale(20),
    fontWeight: '500',
    color: '#2A2A2A',
    textAlign: 'center',
    alignSelf: 'stretch',
  },
  keySubText: {
    fontSize: fontScale(9),
    color: '#8a8a8e',
    letterSpacing: 1,
    marginTop: 1,
    textAlign: 'center',
    alignSelf: 'stretch',
  },
});
