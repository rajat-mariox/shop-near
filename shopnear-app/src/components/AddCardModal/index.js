import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import { showToast } from '../../utils/toast';
import {
  addSavedCard,
  detectCardBrand,
  digitsOnly,
  expiryValid,
  formatCardNumber,
  formatExpiry,
  luhnValid,
} from '../../utils/savedCards';

// OEM system fonts (Moto etc.) par text measurement fix
const F = { fontFamily: 'sans-serif' };

// "+ Add Card" ka bottom-sheet form (AddAddressScreen jaisa). Card number,
// expiry, CVV, name — sab client-side validate hota hai. Save par sirf masked
// details (brand/last4/expiry/name) device par store hoti hain; poora number
// aur CVV kabhi store nahi hota, wo sirf Razorpay page par hi jaata hai.
const AddCardModal = ({ visible, onClose, onSaved }) => {
  const insets = useSafeAreaInsets();
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const brand = detectCardBrand(number);
  const isAmex = brand === 'Amex';

  const clearError = (key) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const inputStyle = (key, extra) => [styles.input, extra, errors[key] && styles.inputError];
  const fieldError = (key) =>
    errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null;

  const reset = () => {
    setNumber('');
    setExpiry('');
    setCvv('');
    setName('');
    setErrors({});
  };

  const close = () => {
    reset();
    onClose && onClose();
  };

  const validate = () => {
    const e = {};
    const n = digitsOnly(number);
    const needLen = isAmex ? 15 : 16;
    if (n.length !== needLen || !luhnValid(n)) e.number = 'Please enter a valid card number';
    if (!expiryValid(expiry)) e.expiry = 'Enter a valid expiry (MM/YY)';
    const cvvLen = isAmex ? 4 : 3;
    if (!new RegExp(`^\\d{${cvvLen}}$`).test(cvv)) e.cvv = `Enter ${cvvLen}-digit CVV`;
    if (!name.trim()) e.name = 'Please enter name on card';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (saving) return;
    if (!validate()) return;
    setSaving(true);
    const n = digitsOnly(number);
    const result = await addSavedCard({
      brand,
      last4: n.slice(-4),
      expiry,
      name: name.trim(),
    });
    setSaving(false);
    showToast(result.duplicate ? 'This card is already saved' : 'Card added', 'success');
    onSaved && onSaved(result.card, result.cards);
    close();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}>
          <View
            style={[styles.card, { paddingBottom: moderateScale(18) + insets.bottom }]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>Add Card</Text>
              <TouchableOpacity
                onPress={close}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <AntDesign name="close" size={moderateScale(22)} color="#888" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {/* Card number + detected brand badge */}
              <View style={styles.numberWrap}>
                <TextInput
                  style={inputStyle('number', styles.numberInput)}
                  placeholder="Card Number*"
                  placeholderTextColor="#B0B0B0"
                  keyboardType="number-pad"
                  maxLength={isAmex ? 17 : 19}
                  value={number}
                  onChangeText={(t) => {
                    clearError('number');
                    setNumber(formatCardNumber(t));
                  }}
                />
                {brand && brand !== 'Card' ? (
                  <View style={styles.brandBadge}>
                    <Text style={styles.brandBadgeText}>{brand}</Text>
                  </View>
                ) : null}
              </View>
              {fieldError('number')}

              <View style={styles.row}>
                <View style={styles.half}>
                  <TextInput
                    style={inputStyle('expiry')}
                    placeholder="Expiry (MM/YY)*"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="number-pad"
                    maxLength={5}
                    value={expiry}
                    onChangeText={(t) => {
                      clearError('expiry');
                      setExpiry(formatExpiry(t));
                    }}
                  />
                  {fieldError('expiry')}
                </View>
                <View style={styles.half}>
                  <TextInput
                    style={inputStyle('cvv')}
                    placeholder="CVV*"
                    placeholderTextColor="#B0B0B0"
                    keyboardType="number-pad"
                    secureTextEntry
                    maxLength={isAmex ? 4 : 3}
                    value={cvv}
                    onChangeText={(t) => {
                      clearError('cvv');
                      setCvv(digitsOnly(t));
                    }}
                  />
                  {fieldError('cvv')}
                </View>
              </View>

              <TextInput
                style={inputStyle('name')}
                placeholder="Name on Card*"
                placeholderTextColor="#B0B0B0"
                autoCapitalize="words"
                value={name}
                onChangeText={(t) => {
                  clearError('name');
                  setName(t);
                }}
              />
              {fieldError('name')}

              <View style={styles.secureRow}>
                <MaterialIcons name="lock-outline" size={moderateScale(15)} color="#6E6E73" />
                <Text style={styles.secureText}>
                  Your full card number and CVV are never stored. Payment is completed
                  on Razorpay's secure page.
                </Text>
              </View>

              {Object.values(errors).some(Boolean) ? (
                <Text style={styles.errorSummary}>Please fix the highlighted fields above</Text>
              ) : null}

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Card'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default AddCardModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.10)',
    // Bottom sheet ki tarah neeche se khulta hai
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: moderateScale(22),
    borderTopRightRadius: moderateScale(22),
    padding: moderateScale(18),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    maxHeight: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(14),
  },
  title: {
    ...F,
    fontSize: fontScale(17),
    fontWeight: '700',
    color: '#1D1F22',
  },
  numberWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  numberInput: {
    paddingRight: scale(90),
    letterSpacing: 1,
  },
  brandBadge: {
    position: 'absolute',
    right: scale(12),
    // input ka marginBottom compensate karke vertically center
    top: verticalScale(13) - verticalScale(2),
    backgroundColor: '#FFF1EF',
    borderRadius: moderateScale(8),
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
  },
  brandBadgeText: {
    ...F,
    fontSize: fontScale(11.5),
    fontWeight: '700',
    color: Colors.theme1,
  },
  row: {
    flexDirection: 'row',
    width: '100%',
    gap: moderateScale(8),
  },
  half: {
    flex: 1,
  },
  input: {
    ...F,
    backgroundColor: Colors.WHITE1,
    borderRadius: moderateScale(12),
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(13),
    fontSize: fontScale(14),
    color: Colors.BLACK,
    marginBottom: verticalScale(12),
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  inputError: {
    borderColor: '#E53935',
  },
  errorText: {
    ...F,
    color: '#E53935',
    fontSize: fontScale(11.5),
    marginTop: -verticalScale(8),
    marginBottom: verticalScale(10),
    marginLeft: scale(6),
  },
  errorSummary: {
    ...F,
    color: '#E53935',
    fontSize: fontScale(12),
    textAlign: 'center',
    marginBottom: verticalScale(8),
  },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F5F5F7',
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(10),
    marginBottom: verticalScale(14),
    gap: scale(8),
  },
  secureText: {
    ...F,
    flex: 1,
    fontSize: fontScale(11.5),
    lineHeight: fontScale(16),
    color: '#6E6E73',
  },
  saveBtn: {
    backgroundColor: Colors.theme1,
    borderRadius: moderateScale(12),
    paddingVertical: verticalScale(14),
    alignItems: 'center',
    marginTop: verticalScale(2),
    marginBottom: verticalScale(8),
  },
  saveBtnText: {
    ...F,
    color: '#fff',
    fontWeight: 'bold',
    fontSize: fontScale(17),
    textAlign: 'center',
  },
});
