import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StandaloneTabBar } from '../../routes/MyBottomTabs';
import { fetchUserProfile, updateUserProfile } from '../../service/userProfile';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { showToast } from '../../utils/toast';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const THEME_COLOR = Colors.theme1;
// Figma 55:5644 — labels/values ke colors
const LABEL_COLOR = '#A6ABC4';
const VALUE_COLOR = '#43484B';
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Underline-style field (figma "TextFields / Filled")
const Field = ({ label, style, ...inputProps }) => (
  <View style={[styles.field, style]}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.fieldInput}
      placeholderTextColor="#C8CCD9"
      {...inputProps}
    />
  </View>
);

const ProfileSettingScreen = ({ navigation }) => {
  // Backend me sirf fullName hai — UI figma ke hisaab se First/Last dikhata
  // hai, save par dono jud ke fullName ban jaate hain
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [profileImages, SetProfileImages] = useState(null); // url ya picked asset
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      const result = await fetchUserProfile();
      if (result.success) {
        const data = result.data;
        const [first, ...rest] = (data?.fullName || '').trim().split(/\s+/);
        setFirstName(first || '');
        setLastName(rest.join(' '));
        setEmail(data?.email || '');
        setGender(data?.gender || '');
        setPhone(data?.mobileNumber || '');
        SetProfileImages(data?.profileImages || null);
      }
    };
    getProfile();
  }, []);

  const applyPicked = (result) => {
    if (result.errorCode) {
      showToast(result.errorMessage || 'Photo select nahi ho paayi', 'error');
      return;
    }
    if (!result.didCancel && result.assets && result.assets.length > 0) {
      SetProfileImages(result.assets[0]);
    }
  };

  const pickFromGallery = async () => {
    applyPicked(await launchImageLibrary({ mediaType: 'photo', quality: 0.8 }));
  };

  // Manifest me CAMERA permission declare hai, isliye Android par launchCamera se
  // pehle runtime permission zaroori hai
  const pickFromCamera = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
        title: 'Camera permission',
        message: 'Profile photo lene ke liye camera access chahiye.',
        buttonPositive: 'Allow',
        buttonNegative: 'Cancel',
      });
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        showToast('Camera permission nahi mili. Settings se allow karein.', 'error');
        return;
      }
    }
    applyPicked(
      await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false, cameraType: 'front' }),
    );
  };

  // Camera badge: camera ya gallery, user chune
  const handlePickImage = () => {
    Alert.alert('Profile photo', '', [
      { text: 'Take Photo', onPress: pickFromCamera },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleSave = async () => {
    setLoading(true);
    const profileData = {
      fullName: [firstName.trim(), lastName.trim()].filter(Boolean).join(' '),
      email,
      gender,
      phone,
    };
    // Nayi image pick hui ho tabhi file bhejo (string matlab purana url hai)
    if (profileImages && typeof profileImages !== 'string') {
      profileData.profileImages = {
        uri: profileImages?.uri,
        name: profileImages?.fileName || 'profile.jpg',
        type: profileImages?.type || 'image/jpeg',
      };
    }
    const result = await updateUserProfile(profileData);
    setLoading(false);
    if (result.success) {
      navigation.navigate('Home');
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    /* Navigator status bar area khud handle karta hai, isliye sirf bottom edge */
    /* Bottom inset tab bar khud sambhalta hai */
    <SafeAreaView style={styles.screen} edges={[]}>
      {/* Header */}
      <ScreenHeader style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Profile Setting
        </Text>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Avatar + camera badge (figma "change avatar") */}
        <View style={styles.avatarContainer}>
          {profileImages ? (
            <Image
              source={{
                uri: typeof profileImages === 'string' ? profileImages : profileImages?.uri,
              }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <FontAwesome name="user-o" size={moderateScale(42)} color={THEME_COLOR} />
            </View>
          )}
          <TouchableOpacity style={styles.cameraIcon} onPress={handlePickImage}>
            <Feather name="camera" size={moderateScale(18)} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Form (figma 55:5802) */}
        <View style={styles.form}>
          <View style={styles.fieldRow}>
            <Field
              label="First Name"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              style={styles.fieldGrow}
            />
            <Field
              label="Last Name"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last name"
              style={styles.fieldGrow}
            />
          </View>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.fieldRow}>
            <Field
              label="Gender"
              value={gender}
              onChangeText={setGender}
              placeholder="Gender"
              style={styles.fieldSmall}
            />
            <Field
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              keyboardType="phone-pad"
              style={styles.fieldGrow}
            />
          </View>
        </View>
      </ScrollView>

      {/* Save change (figma 55:5825) */}
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
        activeOpacity={0.85}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save change</Text>
        )}
      </TouchableOpacity>
      {/* Profile se khulta hai, Profile tab active */}
      <StandaloneTabBar activeName="Profile" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: scale(10),
  },
  scrollContent: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(20),
  },
  /* ---------- AVATAR ---------- */
  avatarContainer: {
    alignSelf: 'center',
    marginTop: verticalScale(22),
    marginBottom: verticalScale(30),
  },
  avatar: {
    width: moderateScale(96),
    height: moderateScale(96),
    borderRadius: moderateScale(48),
    backgroundColor: '#FFECE9',
  },
  avatarFallback: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Figma: dark (#353945) circle badge bottom-right
  cameraIcon: {
    position: 'absolute',
    right: moderateScale(-6),
    bottom: moderateScale(-2),
    backgroundColor: '#353945',
    borderRadius: moderateScale(21),
    width: moderateScale(42),
    height: moderateScale(42),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  /* ---------- FORM (underline fields) ---------- */
  form: {
    marginTop: verticalScale(4),
  },
  fieldRow: {
    flexDirection: 'row',
    gap: scale(24),
  },
  fieldGrow: {
    flex: 1,
  },
  fieldSmall: {
    width: scale(90),
  },
  field: {
    marginBottom: verticalScale(26),
  },
  fieldLabel: {
    ...F,
    fontSize: fontScale(14),
    color: LABEL_COLOR,
  },
  fieldInput: {
    ...F,
    fontSize: fontScale(16),
    color: VALUE_COLOR,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    paddingVertical: verticalScale(8),
    paddingHorizontal: 0,
  },
  /* ---------- SAVE ---------- */
  saveButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(8),
    height: verticalScale(48),
    width: scale(203),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: verticalScale(24),
  },
  saveButtonText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
  },
});

export default ProfileSettingScreen;
