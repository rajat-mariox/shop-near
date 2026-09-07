import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../themes/Colors';
import { scale, moderateScale, fontScale, screenWidth } from '../../utils/responsive';

// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };
const HIT = { top: 10, bottom: 10, left: 10, right: 10 };

/**
 * FCM foreground notification card. Android ke heads-up banner jaisa look:
 * theme icon + title + body, tap par order tracking, cross se dismiss.
 * react-native-toast-message ke custom `notification` type se render hota hai.
 */
const NotificationToast = ({ text1, text2, onPress, hide }) => (
  <TouchableOpacity activeOpacity={0.92} onPress={onPress} style={styles.card}>
    <View style={styles.iconWrap}>
      <Feather name="bell" size={moderateScale(18)} color="#fff" />
    </View>
    <View style={styles.textWrap}>
      <Text style={styles.title} numberOfLines={1}>
        {text1}
      </Text>
      {!!text2 && (
        <Text style={styles.body} numberOfLines={2}>
          {text2}
        </Text>
      )}
    </View>
    <TouchableOpacity onPress={hide} hitSlop={HIT} style={styles.close}>
      <Feather name="x" size={moderateScale(16)} color="#9A9A9A" />
    </TouchableOpacity>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    width: screenWidth - scale(24),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(14),
    paddingVertical: moderateScale(12),
    paddingLeft: moderateScale(12),
    paddingRight: moderateScale(8),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  iconWrap: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: Colors.theme1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  textWrap: { flex: 1 },
  title: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '700',
    color: '#2A2A2A',
    marginBottom: 2,
  },
  body: {
    ...F,
    fontSize: fontScale(12.5),
    color: '#666',
    lineHeight: fontScale(17),
  },
  close: {
    padding: moderateScale(6),
    marginLeft: scale(4),
  },
});

export default NotificationToast;
