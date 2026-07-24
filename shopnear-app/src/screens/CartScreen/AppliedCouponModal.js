import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Coupon apply hone ke baad ka success popup — figma 54:1254 "Applied Coupons".
// Green check, saving message, neeche white bar me "Ok! Thanks".
const AppliedCouponModal = ({ visible, onClose, code, discount }) => (
  <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.body}>
          <AntDesign name="checkcircleo" size={moderateScale(64)} color="#34C759" />
          <Text style={styles.title}>Applied Coupons</Text>
          <Text style={styles.message}>
            {discount > 0
              ? `You saved ${discount}/- on your order with ${code} Code`
              : `${code} Code applied on your order`}
          </Text>
        </View>
        <TouchableOpacity style={styles.footer} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.footerText}>Ok! Thanks</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(16),
  },
  card: {
    width: '100%',
    backgroundColor: '#F8F9FA',
    borderRadius: moderateScale(15),
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#3F4256',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  body: {
    alignItems: 'center',
    paddingTop: verticalScale(40),
    paddingBottom: verticalScale(30),
    paddingHorizontal: scale(30),
  },
  title: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '600',
    color: '#383F4E',
    marginTop: verticalScale(20),
  },
  message: {
    ...F,
    fontSize: fontScale(12),
    lineHeight: fontScale(16),
    color: '#334A4C',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: verticalScale(12),
    maxWidth: scale(236),
  },
  footer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(19),
  },
  footerText: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '600',
    color: '#EE3E35',
  },
});

export default AppliedCouponModal;
