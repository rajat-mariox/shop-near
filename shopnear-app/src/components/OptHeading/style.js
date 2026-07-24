import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../themes/Colors';
import { moderateScale, fontScale } from '../../utils/responsive';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    flexRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        width: '100%',
        paddingVertical: height * 0.016,
        alignItems: 'center',
        paddingHorizontal: '5%',
        alignSelf: 'center'
    },
    line: {
        height: height * 0.0025,
        backgroundColor: Colors.GRAY1,
        borderRadius: moderateScale(10)
    },
    title: {
        color: Colors.GRAY2,
        fontWeight: '500',
        fontSize: fontScale(15),
        width: 'auto',
        textAlign: 'center',
        textTransform: 'uppercase'
    },
    flexRowSW: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        paddingVertical: height * 0.016,
        paddingHorizontal: '3%',
    },
    RytTitle: {
        color: Colors.BLACK,
        fontWeight: '500',
        fontSize: fontScale(16),
    },
    ViewAllBtnTxt: {
        color: Colors.THEMECOLOR,
        fontSize: fontScale(16),
        fontWeight: '400',
        borderBottomWidth: 1.2,
        borderBottomColor: Colors.THEMECOLOR
    }
});