import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { fontScale, moderateScale } from '../../utils/responsive';

const RED = '#EE3E35';
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;

// Play Store policy: delete se pehle feedback, phir 7-din grace period warning
const REASONS = [
  "I don't find the app useful",
  'I found a better alternative',
  'Too many notifications',
  'Privacy concerns',
  'Other',
];

const DeleteAccountModal = ({ visible, onClose, onConfirm, deleting }) => {
  // step 1: feedback (reason), step 2: 7-day warning + final confirm
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherText, setOtherText] = useState('');

  const resetAndClose = () => {
    setStep(1);
    setSelectedReason('');
    setOtherText('');
    onClose();
  };

  const finalReason =
    selectedReason === 'Other'
      ? otherText.trim() || 'Other'
      : [selectedReason, otherText.trim()].filter(Boolean).join(' — ');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetAndClose}>
      <View style={styles.overlay}>
        {/* Sheet ke bahar tap karne par band */}
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={resetAndClose} />
        <View style={styles.sheet}>
          <View style={styles.dragHandle} />

          {step === 1 ? (
            <>
              <Text style={styles.title}>Delete Account</Text>
              <Text style={styles.subtitle}>
                We're sad to see you go. Please tell us why you want to delete your account.
              </Text>

              {REASONS.map((reason) => {
                const selected = selectedReason === reason;
                return (
                  <TouchableOpacity
                    key={reason}
                    style={[styles.reasonRow, selected && styles.reasonRowSelected]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedReason(reason)}>
                    <View style={[styles.radioOuter, selected && styles.radioOuterSelected]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                    <Text style={styles.reasonText}>{reason}</Text>
                  </TouchableOpacity>
                );
              })}

              <TextInput
                style={styles.otherInput}
                placeholder="Tell us more (optional)"
                placeholderTextColor="#B2B9C1"
                value={otherText}
                onChangeText={setOtherText}
                multiline
              />

              <TouchableOpacity
                style={[styles.deleteBtn, !selectedReason && styles.deleteBtnDisabled]}
                disabled={!selectedReason}
                activeOpacity={0.85}
                onPress={() => setStep(2)}>
                <Text style={styles.deleteBtnText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.warnIconWrap}>
                <Feather name="alert-triangle" size={moderateScale(30)} color={RED} />
              </View>
              <Text style={[styles.title, styles.titleCenter]}>Are you sure?</Text>
              <Text style={[styles.subtitle, styles.subtitleCenter]}>
                Your account will be permanently deleted after 7 days. All your data — orders,
                addresses and wishlist — will be removed.
              </Text>
              <Text style={[styles.subtitle, styles.subtitleCenter, styles.recoverNote]}>
                Changed your mind? Simply log in again within 7 days and your account will be
                recovered automatically.
              </Text>

              <TouchableOpacity
                style={styles.deleteBtn}
                activeOpacity={0.85}
                disabled={deleting}
                onPress={() => onConfirm(finalReason)}>
                {deleting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.deleteBtnText}>Delete My Account</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetAndClose} disabled={deleting}>
                <Text style={styles.cancelBtnText}>Keep My Account</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: px(24),
    borderTopRightRadius: px(24),
    paddingHorizontal: px(20),
    paddingBottom: px(24),
    elevation: 12,
    shadowColor: '#3F4256',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  dragHandle: {
    alignSelf: 'center',
    width: px(44),
    height: px(4),
    borderRadius: px(2),
    backgroundColor: '#D9D9D9',
    marginTop: px(10),
    marginBottom: px(16),
  },
  title: {
    ...F,
    fontSize: fontScale(18),
    fontWeight: '700',
    color: '#1D1F22',
    marginBottom: px(6),
  },
  titleCenter: {
    textAlign: 'center',
  },
  subtitle: {
    ...F,
    fontSize: fontScale(13),
    color: '#777E90',
    marginBottom: px(16),
    lineHeight: fontScale(19),
  },
  subtitleCenter: {
    textAlign: 'center',
  },
  recoverNote: {
    color: '#1D1F22',
    fontWeight: '500',
  },
  /* ---------- REASONS (radio list) ---------- */
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: px(10),
    paddingVertical: px(12),
    paddingHorizontal: px(14),
    marginBottom: px(10),
  },
  reasonRowSelected: {
    borderColor: RED,
    backgroundColor: '#FFF5F4',
  },
  radioOuter: {
    width: px(18),
    height: px(18),
    borderRadius: px(9),
    borderWidth: 2,
    borderColor: '#C8CCD9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(12),
  },
  radioOuterSelected: {
    borderColor: RED,
  },
  radioInner: {
    width: px(8),
    height: px(8),
    borderRadius: px(4),
    backgroundColor: RED,
  },
  reasonText: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    color: '#1D1F22',
  },
  otherInput: {
    ...F,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    borderRadius: px(10),
    paddingHorizontal: px(14),
    paddingVertical: px(10),
    fontSize: fontScale(13),
    color: '#383F4E',
    minHeight: px(64),
    textAlignVertical: 'top',
    marginBottom: px(16),
  },
  /* ---------- CONFIRM STEP ---------- */
  warnIconWrap: {
    alignSelf: 'center',
    width: px(64),
    height: px(64),
    borderRadius: px(32),
    backgroundColor: '#FFF0EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: px(14),
  },
  /* ---------- BUTTONS ---------- */
  deleteBtn: {
    backgroundColor: RED,
    borderRadius: px(10),
    height: px(48),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnDisabled: {
    opacity: 0.4,
  },
  deleteBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(15),
    fontWeight: '700',
  },
  cancelBtn: {
    height: px(44),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(8),
  },
  cancelBtnText: {
    ...F,
    color: '#777E90',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
});

export default DeleteAccountModal;
