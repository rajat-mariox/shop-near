import React, { useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View, Dimensions, Modal
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const { width, height } = Dimensions.get('window');

const Alert = ({ modalAlert, setModalAlert }) => {
    // Modal apni alag native layer me render hota hai — ise SafeAreaView me
    // wrap NAHI karna. Band modal par bhi SafeAreaView inset-padding wali khaali
    // View banata tha jo layout me niche jagah gher ke navbar ko upar dhakelti thi.
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalAlert}
            onRequestClose={() => setModalAlert(false)}
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContent}>
                    <Ionicons name={"list"} size={moderateScale(32)} color={'#000'} />

                    <Text style={[styles.modalText, { fontSize: fontScale(22), marginTop: verticalScale(10) }]}>Today Missing Job <Text style={{ color: 'orange' }}>3</Text></Text>
                    <Text style={styles.modalText}><Text style={{ color: 'orange', fontSize: fontScale(22) }}>29:53</Text> minutes to expire</Text>

                    <TouchableOpacity
                        onPress={() => setModalAlert(false)}
                        style={{ elevation: 10, flexDirection: 'row', justifyContent: 'center', backgroundColor: Colors.THEMECOLOR, width: '46%', borderRadius: moderateScale(25), paddingVertical: verticalScale(16), marginTop: height * 0.02 }}>
                        <Text style={{ color: '#ffffff', fontSize: fontScale(17), fontWeight: '500', alignSelf: 'center', paddingLeft: width * 0.02 }}>Ok</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
    },
    modalContent: {
        width: scale(350),
        padding: moderateScale(20),
        backgroundColor: 'white',
        borderRadius: moderateScale(10),
        alignItems: 'center',
        elevation: 5,
        paddingVertical: verticalScale(30)
    },
    modalText: {
        marginBottom: verticalScale(5),
        fontSize: fontScale(18),
        textAlign: 'center',
    },
});

export default Alert;