import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Pressable, StyleSheet, ScrollView, Modal, PermissionsAndroid, Platform, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Geolocation from '@react-native-community/geolocation';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;

import { addUserAddress } from '../../service/userAddress';
import { showToast } from '../../utils/toast';
const tags = ['Home', 'Work', 'Hotel', 'Others'];

const AddAddressScreen = ({ visible, onClose, navigation }) => {
    // Save button system nav bar ke peeche na chhupe
    const insets = useSafeAreaInsets();
    const [selectedSector, setSelectedSector] = useState('');
    const [selectedCity, setSelectedCity] = useState('Noida');
    const [selectedState, setSelectedState] = useState('');
    const [pinCode, setPinCode] = useState('');
    const [selectedTag, setSelectedTag] = useState('Work');
    const [fullName, setFullName] = useState('');
    const [mobile, setMobile] = useState('');
    const [address, setAddress] = useState('');
    const [houseNo, setHouseNo] = useState('');
    const [loading, setLoading] = useState(false);
    // Field-wise validation errors: { fullName: 'msg', ... }
    const [errors, setErrors] = useState({});
    // Live location — GPS coords + reverse-geocoded fields
    const [locating, setLocating] = useState(false);
    const [coords, setCoords] = useState(null);

    // "Use my current location": permission → GPS → OpenStreetMap se address
    // fields prefill (city/state/pincode/area), coords save ke waqt saath jaate hain
    const useCurrentLocation = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'ShopNear needs your location to fill the delivery address',
                    buttonPositive: 'OK',
                },
            );
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                showToast('Location permission denied', 'error');
                return;
            }
        }
        setLocating(true);

        const onPosition = async (pos) => {
            const { latitude, longitude } = pos.coords;
            setCoords({ lat: latitude, lng: longitude });
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
                    { headers: { 'User-Agent': 'ShopNearApp/1.0' } },
                );
                const data = await res.json();
                const a = data.address || {};
                const line = [a.road, a.suburb || a.neighbourhood]
                    .filter(Boolean)
                    .join(', ');
                if (line) setAddress(line);
                setSelectedSector(a.suburb || a.neighbourhood || a.village || '');
                setSelectedCity(a.city || a.town || a.village || a.county || '');
                setSelectedState(a.state || '');
                setPinCode(a.postcode ? String(a.postcode) : '');
                // Success par koi toast nahi — fields bhar jaana hi feedback hai
            } catch {
                showToast('Location mili, par address details nahi — khud bhar do', 'error');
            }
            setLocating(false);
        };

        // Pehle network-based location (indoors bhi turant milti hai);
        // na mile to GPS high-accuracy fallback
        Geolocation.getCurrentPosition(
            onPosition,
            () => {
                Geolocation.getCurrentPosition(
                    onPosition,
                    (err) => {
                        setLocating(false);
                        showToast(err.message || 'Location nahi mili', 'error');
                    },
                    { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 },
                );
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
        );
    };

    // Typing shuru karte hi us field ka error hat jaata hai
    const onChange = (key, setter) => (value) => {
        setter(value);
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };
    const inputStyle = (key, extra) => [styles.input, extra, errors[key] && styles.inputError];
    const fieldError = (key) => (errors[key] ? <Text style={styles.errorText}>{errors[key]}</Text> : null);

    // Backend call se pehle saare required fields yahin check hote hain.
    // Pehle ye check nahi tha: khali pincode 0 ban ke aur khali address ", , "
    // ban ke backend se pass ho jaata tha, aur backend ka error toast Modal ke
    // peeche chhup jaata tha.
    const validate = () => {
        const e = {};
        if (!fullName.trim()) e.fullName = 'Please enter your full name';
        if (!/^\d{10}$/.test(mobile.trim())) e.mobile = 'Please enter a valid 10-digit contact number';
        if (!address.trim()) e.address = 'Please enter your society & other address';
        if (!houseNo.trim()) e.houseNo = 'Please enter house / office no.';
        if (!selectedSector.trim()) e.sector = 'Please enter area';
        if (!selectedCity.trim()) e.city = 'Please enter city';
        if (!selectedState.trim()) e.state = 'Please enter state';
        if (!/^\d{6}$/.test(pinCode.trim())) e.pinCode = 'Please enter a valid 6-digit pincode';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setLoading(true);
        const addressData = {
            fullName: fullName.trim(),
            city: selectedCity.trim(),
            state: selectedState.trim(),
            mobile: mobile.trim(),
            pinCode: Number(pinCode),
            // Sirf bhare hue parts join hote hain, khali part se ", ," nahi banta
            address: [address, houseNo, selectedSector].map(s => s.trim()).filter(Boolean).join(', '),
            addressType: selectedTag,
            // Live location use hui ho to coords bhi save hote hain
            lat: coords?.lat ?? null,
            lng: coords?.lng ?? null,
        };
        const result = await addUserAddress(addressData);
        setLoading(false);
        // Success par toast nahi — seedha aage badh jaana hi kaafi hai
        if (result.success) {
            onClose();
            if (navigation) navigation();
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        // onRequestClose: Android hardware/gesture back se modal band ho, warna
        // back kuch nahi karta aur user screen par atka rehta hai.
        // Overlay tap (card ke bahar, jaise header ka back arrow) bhi modal band karta hai.
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <Pressable style={styles.overlay} onPress={onClose}>
                <View
                    style={[styles.card, { paddingBottom: moderateScale(18) + insets.bottom }]}
                    onStartShouldSetResponder={() => true}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Enter Address Details</Text>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                            <AntDesign name="close" size={moderateScale(22)} color="#888" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Live location — GPS se address prefill */}
                        <TouchableOpacity
                            style={styles.locationBtn}
                            onPress={useCurrentLocation}
                            disabled={locating}
                            activeOpacity={0.8}>
                            {locating ? (
                                <ActivityIndicator size="small" color={THEME_COLOR} />
                            ) : (
                                <MaterialIcons name="my-location" size={moderateScale(18)} color={THEME_COLOR} />
                            )}
                            <Text style={styles.locationBtnText}>
                                {locating ? 'Getting your location...' : 'Use my current location'}
                            </Text>
                        </TouchableOpacity>
                        <TextInput style={inputStyle('fullName')} placeholder="Full Name*" placeholderTextColor="#B0B0B0" value={fullName} onChangeText={onChange('fullName', setFullName)} />
                        {fieldError('fullName')}
                        <TextInput style={inputStyle('mobile')} placeholder="Contact Number*" placeholderTextColor="#B0B0B0" keyboardType="phone-pad" maxLength={10} value={mobile} onChangeText={onChange('mobile', setMobile)} />
                        {fieldError('mobile')}
                        <TextInput style={inputStyle('address')} placeholder="Write your society & other address*" placeholderTextColor="#B0B0B0" value={address} onChangeText={onChange('address', setAddress)} />
                        {fieldError('address')}
                        <TextInput style={inputStyle('houseNo')} placeholder="House / Office No. / Floor*" placeholderTextColor="#B0B0B0" value={houseNo} onChangeText={onChange('houseNo', setHouseNo)} />
                        {fieldError('houseNo')}
                        <View style={[styles.row, { width: '100%', gap: moderateScale(5) }]}>
                            <View style={styles.half}>
                                <TextInput
                                    style={inputStyle('sector')}
                                    placeholder="Area*"
                                    placeholderTextColor="#B0B0B0"
                                    value={selectedSector}
                                    onChangeText={onChange('sector', setSelectedSector)}
                                />
                                {fieldError('sector')}
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    style={inputStyle('city')}
                                    placeholder="City*"
                                    placeholderTextColor="#B0B0B0"
                                    value={selectedCity}
                                    onChangeText={onChange('city', setSelectedCity)}
                                />
                                {fieldError('city')}
                            </View>
                        </View>
                        <View style={[styles.row, { width: '100%', gap: moderateScale(5) }]}>
                            <View style={styles.half}>
                                <TextInput
                                    style={inputStyle('state')}
                                    placeholder="State*"
                                    placeholderTextColor="#B0B0B0"
                                    value={selectedState}
                                    onChangeText={onChange('state', setSelectedState)}
                                />
                                {fieldError('state')}
                            </View>
                            <View style={styles.half}>
                                <TextInput
                                    style={inputStyle('pinCode')}
                                    placeholder="Pincode*"
                                    placeholderTextColor="#B0B0B0"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={pinCode}
                                    onChangeText={onChange('pinCode', setPinCode)}
                                />
                                {fieldError('pinCode')}
                            </View>
                        </View>
                        <Text style={styles.tagLabel}>Tag this location for latter*</Text>
                        <View style={styles.tagRow}>
                            {tags.map(tag => (
                                <TouchableOpacity
                                    key={tag}
                                    style={[
                                        styles.tagBtn,
                                        selectedTag === tag && { backgroundColor: THEME_COLOR }
                                    ]}
                                    onPress={() => setSelectedTag(tag)}
                                >
                                    <Text style={[
                                        styles.tagText,
                                        selectedTag === tag && { color: '#fff' }
                                    ]}>{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <Text style={styles.infoTitle}>Address Preview</Text>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoText}>
                                {address ? `Address: ${address}` : 'Address not entered yet.'}
                            </Text>
                            <Text style={styles.infoText}>
                                {houseNo ? `House/Office No.: ${houseNo}` : 'House/Office No. not entered yet.'}
                            </Text>
                            <Text style={styles.infoSoon}>We will reach you soon!</Text>
                        </View>
                        {Object.values(errors).some(Boolean) ? (
                            <Text style={styles.errorSummary}>Please fill the highlighted fields above</Text>
                        ) : null}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
                            <Text style={styles.saveBtnText}>{loading ? 'Saving...' : 'Save & Continue'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.10)',
        // Bottom sheet ki tarah neeche se khulta hai
        justifyContent: 'flex-end',
        alignItems: 'center',
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
        shadowOpacity: 0.10,
        shadowRadius: 12,
        alignSelf: 'center',
        maxHeight: '92%',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    // Row/centered parent me bold text ko explicit width chahiye, warna Android
    // use kam measure karke aakhri shabd kaat deta hai
    title: {
        fontSize: fontScale(17),
        fontWeight: 'bold',
        color: '#222',
        flex: 1,
    },
    // Live location button — coral outline, form ke sabse upar
    locationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.2,
        borderColor: THEME_COLOR,
        borderRadius: moderateScale(12),
        paddingVertical: verticalScale(11),
        marginBottom: verticalScale(10),
        backgroundColor: '#FFF5F3',
    },
    locationBtnText: {
        fontFamily: 'sans-serif',
        color: THEME_COLOR,
        fontWeight: '600',
        fontSize: fontScale(14),
        marginLeft: scale(8),
    },
    input: {
        backgroundColor: Colors.WHITE1,
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(13),
        fontSize: fontScale(14),
        color: Colors.BLACK,
        marginBottom: verticalScale(12),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        // shadow for iOS
        shadowColor: 'rgba(0, 0, 0, 0.08)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
        // elevation for Android
        elevation: 3,
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(12),
    },
    // Row ke dono inputs ka wrapper, taaki error text input ke neeche hi aaye
    half: {
        width: '49%',
    },
    inputError: {
        borderColor: '#E53935',
    },
    errorText: {
        fontFamily: 'sans-serif',
        color: '#E53935',
        fontSize: fontScale(11.5),
        marginTop: -verticalScale(8),
        marginBottom: verticalScale(10),
        marginLeft: scale(6),
    },
    errorSummary: {
        fontFamily: 'sans-serif',
        color: '#E53935',
        fontSize: fontScale(12.5),
        textAlign: 'center',
        marginBottom: verticalScale(8),
    },
    dropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(13),
        marginRight: scale(8),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    dropdownText: {
        flex: 1,
        color: '#B0B0B0',
        fontSize: fontScale(15),
    },
    tagLabel: {
        fontWeight: 'bold',
        color: '#222',
        fontSize: fontScale(15),
        marginBottom: verticalScale(8),
        marginTop: verticalScale(2),
    },
    tagRow: {
        flexDirection: 'row',
        // wrap taaki lambe tag naam screen se bahar na jaayein
        flexWrap: 'wrap',
        marginBottom: verticalScale(8),
    },
    tagBtn: {
        backgroundColor: '#F8F8F8',
        borderRadius: moderateScale(16),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(7),
        marginRight: scale(8),
        marginBottom: verticalScale(8),
        borderWidth: 1,
        borderColor: '#F0F0F0',
        minWidth: scale(74),
        alignItems: 'center',
    },
    tagText: {
        color: '#222',
        fontWeight: 'bold',
        fontSize: fontScale(14),
        textAlign: 'center',
        alignSelf: 'stretch',
    },
    infoBox: {
        backgroundColor: '#F8F8F8',
        borderRadius: moderateScale(14),
        padding: moderateScale(12),
        marginBottom: verticalScale(18),
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    infoTitle: {
        color: Colors.RED1,
        fontWeight: 'bold',
        fontSize: fontScale(15),
        marginBottom: verticalScale(2),
    },
    infoText: {
        color: '#B0B0B0',
        fontSize: fontScale(13),
        marginBottom: verticalScale(2),
    },
    infoSoon: {
        color: Colors.RED1,
        fontWeight: 'bold',
        fontSize: fontScale(13),
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
        color: '#fff',
        fontWeight: 'bold',
        fontSize: fontScale(17),
        textAlign: 'center',
        alignSelf: 'stretch',
    },
});

export default AddAddressScreen;
