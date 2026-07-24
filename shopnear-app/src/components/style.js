import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../themes/Colors';
import { moderateScale, fontScale } from '../utils/responsive';
const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
    backHeaderCont: {
        paddingTop: height * 0.025,
        flexDirection: 'row'
    },
    backHeaderlabel: {
        color: '#000',
        fontSize: fontScale(24),
        fontWeight: '500',
        paddingLeft: width * 0.04
    },
    headerCont: {
        backgroundColor: Colors.THEMECOLOR,
        borderBottomRightRadius: height * 0.045,
        borderBottomLeftRadius: height * 0.045,
        paddingVertical: height * 0.02,
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingHorizontal: '3.5%'
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
        marginRight: height * 0.055
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
        height: height * 0.075,
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
    },
    policyView: {
        backgroundColor: Colors.WHITE,
        alignSelf: 'center',
        width: '100%',
        paddingVertical: height * 0.03,
        padding: moderateScale(15),
        rowGap: height * 0.03,
        borderRadius: moderateScale(10)
    },
    Txt: {
        color: Colors.GRAY3,
        fontSize: fontScale(13), paddingHorizontal: height * 0.01
    },
    TxtBold: {
        color: Colors.GRAY3,
        paddingHorizontal: height * 0.01, fontSize: fontScale(16), fontWeight: '500'
    },
    TxtBlack: {
        color: Colors.BLACK,
        fontSize: fontScale(17),
        fontWeight: '500'
    },
    innerCard: {
        backgroundColor: '#fff',
        padding: height * 0.02,
        width: '100%',
        alignSelf: 'center',
        borderRadius: moderateScale(10),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: Colors.GRAY1
    },
    flexRow: { flexDirection: 'row' },
    bottomView: {
        height: height * 0.11,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: Colors.WHITE,
        elevation: 5,
        paddingHorizontal: '6%',
        position: 'absolute',
        bottom: 0
    },
    borderBtn: {
        borderColor: Colors.GRAY4,
        width: 'auto',
    },
    borderBtnTxt: {
        fontSize: fontScale(14),
        fontWeight: '400',
        color: Colors.THEMECOLOR
    },
    gap4: {
        gap: moderateScale(4)
    },
    NextBtn: {
        backgroundColor: Colors.THEMECOLOR,
        paddingVertical: height * 0.017,
        paddingHorizontal: width * 0.065,
        borderRadius: moderateScale(30)
    },
    NextBtnTxt: {
        color: Colors.WHITE,
        fontSize: fontScale(15),
        fontWeight: '500'
    },

    bottomView2: {
        height: height * 0.18,
        width: '100%',
        flexDirection: 'column',
        backgroundColor: Colors.WHITE,
        elevation: 5,
        paddingHorizontal: '6%',
        position: 'absolute',
        bottom: 0,
        gap: moderateScale(10),
        justifyContent: 'center'
    },
});