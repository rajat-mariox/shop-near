import { View, Text } from 'react-native';
import { styles } from './style';

const HeadingDiv = ({ title, lineSize }) => {
    return (
        <View style={styles.flexRow}>
            <View style={[styles.line, { width: lineSize }]}></View>
            <Text style={styles.title}>{title}</Text>
            <View style={[styles.line, { width: lineSize }]}></View>
        </View>
    );
}
export default HeadingDiv;