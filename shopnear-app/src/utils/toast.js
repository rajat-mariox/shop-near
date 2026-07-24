import Toast from 'react-native-toast-message';

export const showToast = (message, type = 'success') => {
  Toast.show({
    type,
    text1: message,
    position: 'top',
    visibilityTime: 2500,
    autoHide: true,
    topOffset: 60,
  });
};