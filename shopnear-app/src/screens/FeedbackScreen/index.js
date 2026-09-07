import React, { useState } from 'react';
import {
  Image,
  Modal,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StandaloneTabBar } from '../../routes/MyBottomTabs';
import Svg, { Path } from 'react-native-svg';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { Colors } from '../../themes/Colors';
import { submitFeedback } from '../../service/feedbackService';
import { submitProductRating } from '../../service/productService';
import { showToast } from '../../utils/toast';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import ScreenHeader from '../../components/ScreenHeader';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };
const MAX_CHARS = 200;

// Figma 55:9982 wala sharp 5-point star (vector icon ka star rounded tha)
const StarIcon = ({ size, color }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 1.6l3.09 6.83 7.41.78-5.55 5.02 1.56 7.33L12 17.8l-6.51 3.76 1.56-7.33L1.5 9.21l7.41-.78L12 1.6z"
      fill={color}
    />
  </Svg>
);

const FeedbackScreen = ({ navigation, route }) => {
  // orderId + productId ke saath khula ho to ye PRODUCT REVIEW mode hai —
  // review product par save hota hai (order delivered hona chahiye).
  // Bina params ke ye general app-feedback screen hai.
  const orderId = route?.params?.orderId;
  const productId = route?.params?.productId;
  const productName = route?.params?.productName;
  const isProductReview = !!(orderId && productId);

  // Default koi star select nahi; user khud rating de (0 = not selected)
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [galleryImage, setGalleryImage] = useState(null);
  const [cameraImage, setCameraImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (result.errorCode) {
      showToast(result.errorMessage || 'Gallery open nahi ho paayi', 'error');
      return;
    }
    if (!result.didCancel && result.assets?.length) setGalleryImage(result.assets[0]);
  };

  // Manifest me CAMERA permission declare hai, isliye Android par launchCamera se
  // pehle runtime permission zaroori hai; bina iske picker chupchap fail hota hai.
  const ensureCameraPermission = async () => {
    if (Platform.OS !== 'android') return true;
    const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
      title: 'Camera permission',
      message: 'Photo lene ke liye camera access chahiye.',
      buttonPositive: 'Allow',
      buttonNegative: 'Cancel',
    });
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  const pickFromCamera = async () => {
    const ok = await ensureCameraPermission();
    if (!ok) {
      showToast('Camera permission nahi mili. Settings se allow karein.', 'error');
      return;
    }
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
      cameraType: 'back',
    });
    if (result.errorCode) {
      showToast(result.errorMessage || 'Camera open nahi ho paaya', 'error');
      return;
    }
    if (!result.didCancel && result.assets?.length) setCameraImage(result.assets[0]);
  };

  const handleSend = async () => {
    if (!rating) {
      showToast('Please select a star rating', 'error');
      return;
    }
    setSubmitting(true);
    let result;
    const images = [galleryImage, cameraImage].filter(Boolean);
    if (isProductReview) {
      result = await submitProductRating(productId, {
        orderId,
        rating,
        reviewText: feedback,
        images,
      });
    } else {
      result = await submitFeedback(rating, feedback, images);
    }
    setSubmitting(false);
    if (result.success) {
      setModalVisible(true);
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleDone = () => {
    setModalVisible(false);
    navigation.goBack();
  };

  // Dashed upload box — pick hone par thumbnail dikhta hai (figma 55:9993)
  const UploadBox = ({ image, icon, onPress }) => (
    <TouchableOpacity style={styles.uploadBox} activeOpacity={0.7} onPress={onPress}>
      {image ? (
        <Image source={{ uri: image.uri }} style={styles.uploadThumb} />
      ) : (
        <Feather name={icon} size={moderateScale(26)} color="#CCD2E3" />
      )}
    </TouchableOpacity>
  );

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
          Share your feedback
        </Text>
      </ScreenHeader>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <Text style={styles.question}>
          {isProductReview
            ? `How was "${productName || 'this product'}"?`
            : 'What is your opinion of ShopNear?'}
        </Text>

        {/* Stars (figma 55:9982) */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} onPress={() => setRating(i)}>
              <View style={styles.star}>
                <StarIcon size={moderateScale(38)} color={i <= rating ? '#000' : '#B1B5C3'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Text area (figma 55:9990) */}
        <View style={styles.textAreaCard}>
          <TextInput
            style={styles.textArea}
            placeholder="Would you like to write anything about this product?"
            placeholderTextColor="#5A5A5A"
            multiline
            maxLength={MAX_CHARS}
            value={feedback}
            onChangeText={setFeedback}
          />
          <Text style={styles.charCount}>
            {feedback.length > 0 ? `${feedback.length} characters` : `${MAX_CHARS} characters`}
          </Text>
        </View>

        {/* Photo upload boxes (figma 55:9993 / 55:9999): gallery + camera, dono modes me.
            Product review me photos Rating.reviewImages me save hoti hain */}
        <View style={styles.uploadRow}>
          <UploadBox image={galleryImage} icon="image" onPress={pickFromGallery} />
          <UploadBox image={cameraImage} icon="camera" onPress={pickFromCamera} />
        </View>

        {/* Send feedback (figma 55:9996) */}
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          disabled={submitting}
          activeOpacity={0.85}>
          <Text style={styles.sendButtonText}>
            {submitting ? 'Sending...' : 'Send Feedback'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleDone}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconCircle}>
              <AntDesign name="checkcircle" size={moderateScale(52)} color="#34A853" />
            </View>
            <Text style={styles.modalTitle}>Thank you for your feedback!</Text>
            <Text style={styles.modalText}>
              We appreciated your feedback.{'\n'}We'll use your feedback to improve your
              experience.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleDone}>
              <Text style={styles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Product review Order se, Rate this app Profile se khulta hai */}
      <StandaloneTabBar activeName={isProductReview ? 'Order' : 'Profile'} />
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
    paddingBottom: verticalScale(30),
  },
  question: {
    ...F,
    fontSize: fontScale(14),
    fontWeight: '500',
    color: '#121420',
    textAlign: 'center',
    letterSpacing: -0.07,
    marginTop: verticalScale(26),
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: verticalScale(20),
  },
  star: {
    marginHorizontal: scale(6),
  },
  /* ---------- TEXT AREA (figma 55:9990) ---------- */
  textAreaCard: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#F4F4F4',
    height: verticalScale(240),
    marginTop: verticalScale(26),
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(36),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  textArea: {
    ...F,
    flex: 1,
    fontSize: fontScale(13),
    lineHeight: fontScale(18),
    color: '#121420',
    textAlignVertical: 'top',
  },
  charCount: {
    ...F,
    position: 'absolute',
    bottom: verticalScale(12),
    right: scale(16),
    fontSize: fontScale(12),
    color: '#5A5A5A',
  },
  /* ---------- UPLOAD BOXES (figma 55:9993) ---------- */
  uploadRow: {
    flexDirection: 'row',
    gap: scale(24),
    marginTop: verticalScale(22),
  },
  uploadBox: {
    width: scale(69),
    height: verticalScale(64),
    borderWidth: 2,
    borderColor: '#CCD2E3',
    borderStyle: 'dashed',
    borderRadius: moderateScale(15),
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  uploadThumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: moderateScale(13),
  },
  /* ---------- SEND ---------- */
  sendButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(8),
    height: verticalScale(48),
    width: scale(315),
    maxWidth: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(56),
  },
  sendButtonText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '700',
  },
  /* ---------- SUCCESS MODAL ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  /* Figma 55:10110 — 327-wide white card, radius 20 */
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: moderateScale(20),
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(16),
    paddingBottom: verticalScale(22),
    alignItems: 'center',
    width: scale(327),
    maxWidth: '92%',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  // Halka green circle jiske andar solid green check
  modalIconCircle: {
    backgroundColor: '#E5F5E9',
    borderRadius: moderateScale(40),
    width: moderateScale(80),
    height: moderateScale(80),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(28),
  },
  modalTitle: {
    ...F,
    fontSize: fontScale(16),
    fontWeight: '700',
    color: '#43484B',
    marginBottom: verticalScale(14),
    textAlign: 'center',
  },
  modalText: {
    ...F,
    fontSize: fontScale(14),
    color: '#6E768A',
    textAlign: 'center',
    lineHeight: fontScale(20),
  },
  modalButton: {
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(8),
    width: scale(101),
    height: verticalScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: verticalScale(26),
  },
  modalButtonText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(14),
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default FeedbackScreen;
