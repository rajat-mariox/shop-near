import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../style';
import { Vector } from '../../assets/vector/vector.icon';

const PolicyView = (props) => {
    console.log(props);
    return (
        <View style={styles.policyView}>
            <View style={{ rowGap: 10 }}>
                <View style={[styles.flexRow]}>
                    {Vector.CHECK_ICON}
                    <Text style={styles.Txt}>Instant Service within 30 mins</Text>
                </View>
                <View style={styles.flexRow}>
                    <View style={[styles.flexRow, { paddingRight: 10 }]} >
                        {Vector.CHECK_ICON}
                        <Text style={styles.Txt}>Veified Professional</Text>
                    </View>
                    <View style={styles.flexRow}>
                        {Vector.CHECK_ICON}
                        <Text style={styles.Txt}>Veified Professional</Text>
                    </View>
                </View>
            </View>

            {/* <TouchableOpacity style={styles.innerCard}>
                <View style={styles.flexRow}>
                    {Vector.SECURITY_ICON}
                    <View style={{ left: 8 }}>
                        <Text style={styles.TxtBold}>Our Promise</Text>
                        <Text style={styles.Txt}>30-day service guarantee</Text>
                    </View>
                </View>
                {Vector.RIGHT_ICON}
            </TouchableOpacity> */}
        </View>
    );
}
export default PolicyView;