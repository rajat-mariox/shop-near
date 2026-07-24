import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import AddAddressScreen from '../AddAddressScreen/index';
import { Colors } from '../../themes/Colors';
import { fontScale, moderateScale } from '../../utils/responsive';
import { listUserAddresses, selectUserAddress, deleteUserAddress } from '../../service/userAddress';
import { showToast } from '../../utils/toast';

const THEME_COLOR = Colors.theme1;
// Figma frame 402dp (node 54:1270 "Saved Address")
const { width: SCREEN_W } = Dimensions.get('window');
const px = (n) => (SCREEN_W / 402) * n;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

const SavedAddressScreen = ({ navigation, route }) => {
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const fromCart = route?.params?.from === 'cart';
  const fromAddress = route?.params?.from === 'address';

  useEffect(() => {
    fetchAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAddresses() {
    setLoading(true);
    const result = await listUserAddresses();
    setLoading(false);
    if (result.success) {
      setAddresses(result.addresses);
      // Koi address hi nahi hai to seedha add-address form khol do —
      // user ko pehle address bharna zaroori hai
      if (result.addresses.length === 0) {
        setShowAddAddress(true);
      }
    } else {
      showToast(result.message, 'error');
    }
  }

  async function handleSelect(addressId) {
    // Optimistic: tick turant naye address par — koi loading flash nahi.
    // API fail ho to selection wapas purani kar dete hain.
    const previous = addresses;
    setAddresses(previous.map(a => ({ ...a, isSelected: a._id === addressId })));
    const result = await selectUserAddress(addressId);
    if (result.success) {
      if (fromCart) {
        navigation.navigate('Home', { screen: 'Cart' });
      }
    } else {
      setAddresses(previous);
      showToast(result.message, 'error');
    }
  }

  async function handleDelete(addressId) {
    // Optimistic: card turant list se hatta hai, fail par wapas aa jaata hai
    const previous = addresses;
    const next = previous.filter(a => a._id !== addressId);
    setAddresses(next);
    if (next.length === 0) {
      setShowAddAddress(true);
    }
    const result = await deleteUserAddress(addressId);
    if (!result.success) {
      setAddresses(previous);
      showToast(result.message, 'error');
    }
  }

  function handleEdit() {
    setShowAddAddress(true);
  }

  const selected = addresses.find(a => a.isSelected) || addresses[0];

  return (
    <View style={styles.container}>
      {/* Header — figma: coral, back, title, heart */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation && navigation.goBack()}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Address</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Wishlist')}>
          <AntDesign name="hearto" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading && addresses.length === 0 ? (
          <ActivityIndicator color={THEME_COLOR} style={styles.loader} />
        ) : null}

        {/* Selected address ka summary card — figma 54:1281 (coral border) */}
        {selected ? (
          <View style={styles.currentCard}>
            <View style={styles.currentTopRow}>
              <AntDesign name="checkcircleo" size={moderateScale(17)} color={THEME_COLOR} />
              <Text style={styles.currentTitle}>
                Delivery at ({selected.addressType || 'Home'})
              </Text>
            </View>
            <Text style={styles.currentText}>
              {selected.address}, {selected.city}, {selected.state} - {selected.pinCode}.
              {selected.mobile ? `  +91 ${selected.mobile}` : ''}
            </Text>
          </View>
        ) : null}

        {/* Address list — figma 54:1459: radio + naam(type) + address + phone,
            right me edit/delete icons */}
        {addresses.map(item => (
          <View key={item._id} style={styles.addressCard}>
            <TouchableOpacity
              style={styles.cardLeft}
              activeOpacity={0.7}
              onPress={() => handleSelect(item._id)}>
              <View style={styles.nameRow}>
                <View style={[styles.radioOuter, item.isSelected && styles.radioOuterActive]}>
                  {item.isSelected ? <View style={styles.radioInner} /> : null}
                </View>
                <Text numberOfLines={1} style={styles.nameText}>
                  {item.fullName} ({item.addressType || 'Home'})
                </Text>
              </View>
              <Text numberOfLines={2} style={styles.addressText}>
                {item.address}, {item.city}, {item.state} - {item.pinCode}.
              </Text>
              {item.mobile ? (
                <Text style={styles.addressText}>+91 {item.mobile}</Text>
              ) : null}
            </TouchableOpacity>
            <View style={styles.cardActions}>
              <TouchableOpacity
                onPress={handleEdit}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="edit-2" size={moderateScale(15)} color="#4A6DF0" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(item._id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Feather name="trash-2" size={moderateScale(15)} color="#EE3E35" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {!loading && addresses.length === 0 ? (
          <Text style={styles.emptyText}>Koi saved address nahi hai</Text>
        ) : null}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Add New Address — figma 54:1276 */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => setShowAddAddress(true)}
        activeOpacity={0.85}>
        <Text style={styles.addBtnText}>Add New Address</Text>
      </TouchableOpacity>

      <AddAddressScreen
        visible={showAddAddress}
        onClose={() => {
          setShowAddAddress(false);
          fetchAddresses();
        }}
        navigation={() =>
          fromCart
            ? navigation.navigate('Home', { screen: 'Cart' })
            : fromAddress
            ? null
            : navigation.navigate('PaymentMethod')
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: px(14),
    paddingVertical: px(14),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: px(10),
  },
  iconButton: {
    marginLeft: px(14),
  },
  scrollContent: {
    paddingHorizontal: px(16),
    paddingTop: px(12),
  },
  loader: {
    marginTop: px(24),
  },
  /* ---------- SELECTED SUMMARY (figma 54:1281) ---------- */
  currentCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: THEME_COLOR,
    borderRadius: px(10),
    paddingHorizontal: px(12),
    paddingVertical: px(10),
    marginBottom: px(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 1.5,
  },
  currentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentTitle: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#334A4C',
    marginLeft: px(9),
  },
  currentText: {
    ...F,
    fontSize: fontScale(11),
    lineHeight: fontScale(16),
    color: '#334A4C',
    marginTop: px(6),
  },
  /* ---------- ADDRESS LIST CARD (figma 54:1459) ---------- */
  addressCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#C1C8CE',
    borderRadius: px(10),
    paddingHorizontal: px(15),
    paddingVertical: px(11),
    marginBottom: px(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardLeft: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(6),
  },
  radioOuter: {
    width: px(14),
    height: px(14),
    borderRadius: px(7),
    borderWidth: 1.5,
    borderColor: '#C1C8CE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(8),
  },
  radioOuterActive: {
    borderColor: '#F2204F',
  },
  radioInner: {
    width: px(7),
    height: px(7),
    borderRadius: px(4),
    backgroundColor: '#F2204F',
  },
  nameText: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    fontWeight: '600',
    color: '#334A4C',
  },
  addressText: {
    ...F,
    fontSize: fontScale(11),
    lineHeight: fontScale(16),
    color: '#334A4C',
    opacity: 0.8,
    marginTop: px(2),
  },
  cardActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: px(4),
    marginLeft: px(10),
  },
  emptyText: {
    ...F,
    color: '#888',
    textAlign: 'center',
    marginTop: px(24),
    fontSize: fontScale(12),
  },
  bottomSpacer: {
    height: px(90),
  },
  /* ---------- ADD BUTTON (figma 54:1276) ---------- */
  addBtn: {
    position: 'absolute',
    left: px(16),
    right: px(16),
    bottom: px(14),
    backgroundColor: THEME_COLOR,
    borderRadius: px(8),
    paddingVertical: px(13),
    alignItems: 'center',
    elevation: 4,
  },
  addBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
  },
});

export default SavedAddressScreen;
