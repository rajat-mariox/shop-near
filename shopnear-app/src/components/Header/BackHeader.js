import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { styles } from './style';

const BackHeader = (props) => {
    console.log(props);
    const navigation = props.navigation
    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backHeaderCont}>
            <AntDesign name={props.name} size={props.size} color={props.color} style={{ alignSelf: 'center' }} />
            <Text style={styles.backHeaderlabel}>{props.label}</Text>
        </TouchableOpacity>
    );
}
export default BackHeader;