import { StyleSheet, Dimensions } from 'react-native'
const { width, height } = Dimensions.get('window')
import { Colors } from '../../themes/Colors';

export const styles = StyleSheet.create({
    image: {
        width: width * 0.7,
        height: height * 0.067,
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    mainContainer: {
        flex: 1,
        backgroundColor: Colors.theme1,
    },
    splashImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    }
});