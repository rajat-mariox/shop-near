import React, { useEffect, useRef } from 'react';
import { AppImages } from '../../constants/app.image';
import { styles } from './styles';
import { TimeOut } from './controller'
import { Colors } from '../../themes/Colors';
import { StatusBar, TouchableOpacity, Image } from 'react-native';

const SplashScreen = (props) => {

  const splash = useRef(null);

  useEffect(() => {
    splash.current = TimeOut(props);
    return () => splash.current.cancel();
  }, [])

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.mainContainer}
      onPress={() => splash.current?.skip()}>
      <StatusBar backgroundColor={Colors.theme1} translucent />
      <Image
        source={AppImages.splash}
        style={styles.splashImage}
      />
    </TouchableOpacity>
  );
}
export default SplashScreen;
