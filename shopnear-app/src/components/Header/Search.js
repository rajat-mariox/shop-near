import React from 'react';
import { View, Text, TouchableOpacity, ImageBackground } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { styles } from './style';
import SearchBar from "react-native-dynamic-search-bar";
import { Vector } from '../../assets/vector/vector.icon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { AppImages } from '../../constants/app.image';
import { Colors } from '../../themes/Colors';


const Search = (props) => {
    return (
        <SafeAreaView>
            <View style={{ marginVertical: 10, marginHorizontal: 15 }}>
                <SearchBar
                    placeholder="Search"
                    onChangeText={props.onChangeText}
                    onSearchPress={props.onSearchPress}
                    value={props.value}
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        elevation: 4,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 4,
                        paddingHorizontal: 8,
                        width: '100%',
                    }}
                    iconColor={Colors.theme1}
                    clearIconColor={Colors.theme1}
                    searchIconComponent={<AntDesign name="search1" size={20} color={Colors.theme1} />}
                    clearIconComponent={<AntDesign name="close" size={20} color={Colors.theme1} />}
                />
            </View>
        </SafeAreaView>
    );
}
export default Search;