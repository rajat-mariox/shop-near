import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../themes/Colors';
import { moderateScale, fontScale } from '../../utils/responsive';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    backHeaderCont: {
        flexDirection: 'row',
        width: '40%',
        height: height * 0.065,
        alignItems:'center'
    },
    backHeaderlabel: {
        color: Colors.GRAY3,
        fontSize: fontScale(18),
        fontWeight: '500',
        paddingLeft: width * 0.04
    },
    headerCont: {
        // backgroundColor: Colors.THEMECOLOR,
        borderBottomRightRadius: height * 0.045,
        borderBottomLeftRadius: height * 0.045,
        paddingVertical: height * 0.012,
        width: '100%',
        // opacity: 0.9
    },
    headerlabel: {
        color: Colors.WHITE,
        fontSize: fontScale(17),
        fontWeight: '500',
        paddingLeft: width * 0.03
    },
    profileIcon: {
        height: height * 0.055,
        width: height * 0.055,
        borderRadius: moderateScale(30),
    },
    LOGOIcon: {
        width: width * 0.45,
        height: height * 0.045,
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    headerLeftCont: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    searchCont: {
        backgroundColor: Colors.MAINBG,
        borderRadius: moderateScale(30),
        width: '95%',
        height: height * 0.06,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: height * 0.025,
        alignSelf: 'center',
        elevation: 6,
        marginVertical: height * 0.01,
        marginTop: height * 0.015
    },
    searchTxt: {
        color: Colors.GRAY4,
        fontSize: fontScale(16),
        fontWeight: '400',
        left: width * 0.025
    }
});