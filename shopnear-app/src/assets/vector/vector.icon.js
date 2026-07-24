import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

import { Colors } from '../../themes/Colors';

export const Vector = {
    LANGUAGE_ICON: <FontAwesome5 name={"language"} size={25} color={Colors.WHITE} style={{ alignSelf: 'center' }} />,
    MENU_ICON: <Entypo name={"menu"} size={30} color={Colors.WHITE} style={{ alignSelf: 'center' }} />,
    SEARCH_ICON: <AntDesign name={"search1"} size={22} color={Colors.GRAY4} style={{ alignSelf: 'center' }} />,
    CHECK_ICON: <AntDesign name={"checkcircle"} size={16} color={'green'} style={{ alignSelf: 'center' }} />,
    SECURITY_ICON: <MaterialIcons name={"security"} size={22} color={Colors.GRAY4} style={{ alignSelf: 'center' }} />,
    RIGHT_ICON: <AntDesign name={"right"} size={13} color={Colors.GRAY4} style={{ alignSelf: 'center' }} />,
    STAR_ICON: <Octicons name={"feed-star"} size={18} color={'red'} />,
    PLUS_ICON: <AntDesign name={"plus"} size={15} color={Colors.WHITE} style={{ alignSelf: 'center' }} />,
    MINUS_ICON: <AntDesign name={"minus"} size={15} color={Colors.WHITE} style={{ alignSelf: 'center' }} />,
    ADMIN_ICON: <Ionicons name={"person-outline"} size={22} color={Colors.DARK_GRAY} style={{ alignSelf: 'center' }} />,
    MAP_ICON: <Feather name={"map-pin"} size={22} color={Colors.DARK_GRAY} style={{ alignSelf: 'center' }} />,
    NOTIFICATION_ICON: <Feather name={"bell"} size={22} color={Colors.DARK_GRAY} style={{ alignSelf: 'center' }} />,
    HELP_ICON: <Ionicons name={"help-buoy-outline"} size={22} color={Colors.DARK_GRAY} style={{ alignSelf: 'center' }} />,
    SUPPORT_ICON: <MaterialIcons name={"contact-mail"} size={22} color={Colors.DARK_GRAY} style={{ alignSelf: 'center' }} />,
    DELETE_ICON: <MaterialIcons name={"delete-outline"} size={23} color={'red'} style={{ alignSelf: 'center' }} />,
    LOGOUT_ICON: <MaterialIcons name={"logout"} size={23} color={'red'} style={{ alignSelf: 'center' }} />,
    PENCIL_ICON: <Octicons name={"pencil"} size={16} color={Colors.WHITE} style={{ textAlign: 'center' }} />,
}