import React, { useEffect } from 'react';
import { AppImages } from '../../constants/app.image';
import { styles } from './styles';
import { TimeOut } from './controller'
import { Colors } from '../../themes/Colors';
import { StatusBar, TouchableOpacity, Image } from 'react-native';

const SplashScreen = (props) => {

  useEffect(() => {
    TimeOut(props)
  }, [])

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.mainContainer}
      onPress={() => props.navigation.navigate('Landing')}>
      <StatusBar backgroundColor={Colors.theme1} translucent />
      <Image
        source={AppImages.splash}
        style={styles.splashImage}
      />
    </TouchableOpacity>
  );
}
export default SplashScreen;
