import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './style';

const HeadingView = ({ title, viewLabel }) => {
    return (
        <View style={styles.flexRowSW}>
            <Text style={styles.RytTitle}>{title}</Text>
            {
                viewLabel ?
                    <TouchableOpacity>
                        <Text style={styles.ViewAllBtnTxt}>
                            View All
                        </Text>
                    </TouchableOpacity>
                    :
                    <View></View>
            }
        </View>
    );
}
export default HeadingView;