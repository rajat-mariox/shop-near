import React, { useState, useEffect } from 'react';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';
import { moderateScale } from '../../utils/responsive';
import NumericKeypad from '../../components/NumericKeypad';
import { styles } from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL } from '../../constants/api';
import { API_ENDPOINTS } from '../../constants/api.endpoint';
import { setTokenStorage } from '../../utils/tokenStorage';
import { showToast } from '../../utils/toast';

const RESEND_SECONDS = 30;

const LoginScreen = (props) => {
  const navigation = props.navigation
  const [OTPView, setOTPView] = useState(false)
  const [mobileNum, setMobileNum] = useState('')
  const [txnId, setTxnId] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  // Keypad tabhi khulta hai jab user input ya OTP boxes par tap kare
  const [keypadVisible, setKeypadVisible] = useState(false);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [resendTimer]);

  const requestOtp = async () => {
    const response = await fetch(API_BASE_URL + API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        countryCode: '+91',
        mobileNumber: mobileNum,
      }),
    });
    return response.json();
  };

  // Function to send OTP
  const handleSendOtp = async () => {
    if (!mobileNum || mobileNum.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await requestOtp();
      if (data.code === 1) {
        setTxnId(data.data.txnId);
        setOTPView(true);
        setOtp(['', '', '', '', '', '']);
        setResendTimer(RESEND_SECONDS);
        setKeypadVisible(true);
      } else {
        showToast(data.message || 'Failed to send OTP.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      const data = await requestOtp();
      if (data.code === 1) {
        setTxnId(data.data.txnId);
        setOtp(['', '', '', '', '', '']);
        setResendTimer(RESEND_SECONDS);
      } else {
        showToast(data.message || 'Failed to resend OTP.', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  // Function to verify OTP
  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      showToast('Please enter the 6-digit OTP.', 'error');
      return;
    }
    if (!txnId) {
      showToast('Missing transaction ID. Please request OTP again.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_BASE_URL + API_ENDPOINTS.AUTH_VERIFY_OTP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          txnId: txnId,
          otp: enteredOtp,
        }),
      });
      const data = await response.json();
      if (data.code === 1) {
        if (data.data && data.data.token) {
          await setTokenStorage(data.data.token);
        }
        await askLocationPermission();
        navigation.navigate('Home');
      } else {
        showToast(data.message || 'Incorrect OTP, try again!', 'error');
      }
    } catch (err) {
      showToast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Sirf system ka permission dialog dikhaya jaata hai. Permission mile ya na mile,
  // user ko Home tak jaane diya jaata hai.
  const askLocationPermission = async () => {
    if (Platform.OS !== 'android') return;
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
    } catch (err) {
      // permission na milna login rokta nahi hai
    }
  };

  const handleMobileKeyPress = (key) => {
    if (key === 'backspace') {
      setMobileNum((prev) => prev.slice(0, -1));
    } else if (mobileNum.length < 10) {
      setMobileNum((prev) => prev + key);
    }
  };

  const handleOtpKeyPress = (key) => {
    if (key === 'backspace') {
      setOtp((prev) => {
        const lastFilledIndex = [...prev].reverse().findIndex((d) => d !== '');
        if (lastFilledIndex === -1) return prev;
        const index = prev.length - 1 - lastFilledIndex;
        const newOtp = [...prev];
        newOtp[index] = '';
        return newOtp;
      });
    } else {
      setOtp((prev) => {
        const emptyIndex = prev.findIndex((d) => d === '');
        if (emptyIndex === -1) return prev;
        const newOtp = [...prev];
        newOtp[emptyIndex] = key;
        return newOtp;
      });
    }
  };



  // OTP screen par back karne se sign-in par wapas aana chahiye, app se bahar nahi
  const handleBack = () => {
    if (OTPView) {
      setOTPView(false);
      setOtp(['', '', '', '', '', '']);
      setKeypadVisible(false);
      return;
    }
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={styles.mainContainer}>
      <StatusBar backgroundColor="transparent" translucent barStyle="dark-content" />

      <TouchableOpacity
        style={styles.backRow}
        onPress={handleBack}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <AntDesign name="left" size={moderateScale(18)} color={Colors.BLACK1} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {OTPView ?
          <>
            <Text style={styles.otpHeading}>Phone verification</Text>
            <Text style={styles.subHeading}>We've sent a 6-digit verification code to your mobile number or email. Please enter the code below to verify your identity.</Text>

            <TouchableOpacity
              style={styles.otpRow}
              activeOpacity={1}
              onPress={() => setKeypadVisible(true)}>
              {otp.map((digit, index) => {
                const isFilled = digit !== '';
                const isActive = index === otp.findIndex((d) => d === '');
                return (
                  <View
                    key={index}
                    style={[
                      styles.OTPInput,
                      isFilled && styles.OTPInputFilled,
                      isActive && styles.OTPInputActive,
                    ]}
                  >
                    <Text style={styles.OTPInputText}>{digit}</Text>
                  </View>
                );
              })}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleResendOtp}
              disabled={resendTimer > 0 || resendLoading}
            >
              <Text style={styles.resendText}>
                Didn’t receive code?{' '}
                <Text style={resendTimer > 0 ? styles.resendDisabled : styles.resendAction}>
                  {resendLoading ? 'Resending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend again'}
                </Text>
              </Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyOtp}>
              <Text style={styles.text}>{loading ? 'Verifying...' : 'Verify'}</Text>
            </TouchableOpacity>
          </>
          :
          <>
            <Image source={AppImages.LOGO_2} style={styles.logo} />

            <View style={styles.spacer} />

            <Text style={styles.heading}>Sign in</Text>

            <TouchableOpacity
              style={[styles.input, keypadVisible && styles.inputFocused]}
              activeOpacity={1}
              onPress={() => setKeypadVisible(true)}>
              <Text style={mobileNum ? styles.inputText : styles.inputPlaceholder}>
                {mobileNum || 'Email or Phone Number'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSendOtp}
              style={styles.button}
            >
              <Text style={styles.text}>{loading ? 'Sending...' : 'Get OTP'}</Text>
            </TouchableOpacity>
          </>
        }
      </View>

      <Text style={styles.termsText}>
        By continuing you agree to our{' '}
        <Text style={styles.linkText}>Terms of Services</Text> and{' '}
        <Text style={styles.linkText}>Privacy Policy</Text>
      </Text>

      {keypadVisible ? (
        <NumericKeypad onKeyPress={OTPView ? handleOtpKeyPress : handleMobileKeyPress} />
      ) : (
        <View style={styles.keypadPlaceholder} />
      )}
    </SafeAreaView>
  );
}
export default LoginScreen;
