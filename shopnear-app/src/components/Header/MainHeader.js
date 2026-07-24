import React from 'react';
import { View, Image } from 'react-native';
import { AppImages } from '../../constants/app.image';
import { styles } from './style';

const MainHeader = (props) => {
    return (
        <View style={styles.headerCont}>
            {/* <Image source={AppImages.LOGO} style={styles.LOGOIcon} /> */}
        </View>
    );
}
export default MainHeader;