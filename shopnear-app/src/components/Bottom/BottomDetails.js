import React from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { AppImages } from '../../constants/app.image';
import { styles } from '../style';
import { Text } from 'react-native';

const BottomDetails = ({ btnLabel, amount, onNext }) => {
    return (
        <View style={styles.bottomView}>
            <View style={styles.gap4}>
                <Text style={styles.TxtBlack}>₹ {amount}</Text>
                <TouchableOpacity style={styles.borderBtn}>
                    <Text style={styles.borderBtnTxt}>View details</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onNext} style={styles.NextBtn}>
                <Text style={styles.NextBtnTxt}>{btnLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}
export default BottomDetails;