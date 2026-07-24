import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { AppImages } from '../../constants/app.image';
import { styles } from '../style';
import { Text } from 'react-native';
import { Colors } from '../../themes/Colors';

const BottomPayDtls = ({ btnLabel, amount, rytLabel }) => {
    return (
        <View style={styles.bottomView2}>
            <View style={[styles.gap4, { alignSelf: 'flex-start' }]}>
                <Text style={styles.TxtBlack}>₹ {amount}</Text>
                <TouchableOpacity style={styles.borderBtn}>
                    <Text style={styles.borderBtnTxt}>View details</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.flexRow, { justifyContent: 'space-around', width: '100%' }]}>
                <TouchableOpacity style={[styles.NextBtn, { paddingHorizontal: 15 }]}>
                    <Text style={styles.NextBtnTxt}>{btnLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.NextBtn, { paddingHorizontal: 15, borderColor: Colors.THEMECOLOR, borderWidth: 1.5, backgroundColor: Colors.WHITE }]}>
                    <Text style={[styles.NextBtnTxt, { color: Colors.THEMECOLOR }]}>{rytLabel}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
export default BottomPayDtls;