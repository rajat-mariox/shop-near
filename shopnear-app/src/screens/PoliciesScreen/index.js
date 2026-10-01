import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import ScreenHeader from '../../components/ScreenHeader';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';
import { CMS_TITLES } from '../CmsScreen';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };
const ICON_GREY = '#B1B5C3';

// Admin panel > CMS ke tabs; har row CmsScreen kholti hai
const PAGES = [
  { type: 'terms', icon: 'file-text' },
  { type: 'privacy', icon: 'shield' },
  { type: 'shipping', icon: 'truck' },
  { type: 'cancellation', icon: 'x-circle' },
  { type: 'refund', icon: 'rotate-ccw' },
  { type: 'contact', icon: 'phone' },
];

const PoliciesScreen = ({ navigation }) => (
  <View style={styles.screen}>
    <ScreenHeader style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <AntDesign name="left" size={moderateScale(20)} color="#fff" />
      </TouchableOpacity>
      <Text style={styles.headerTitle} numberOfLines={1}>
        Policies
      </Text>
    </ScreenHeader>

    <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
      {PAGES.map((page) => (
        <TouchableOpacity
          key={page.type}
          style={styles.row}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('CmsScreen', { type: page.type })}>
          <Feather name={page.icon} size={moderateScale(20)} color={ICON_GREY} />
          <Text style={styles.rowLabel}>{CMS_TITLES[page.type]}</Text>
          <Feather name="chevron-right" size={moderateScale(20)} color={ICON_GREY} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME_COLOR,
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(14),
  },
  headerTitle: {
    ...F,
    flex: 1,
    color: '#fff',
    fontSize: fontScale(16),
    fontWeight: '500',
    marginLeft: scale(10),
  },
  list: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(8),
    paddingBottom: verticalScale(30),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  rowLabel: {
    ...F,
    flex: 1,
    color: '#23262F',
    fontSize: fontScale(15),
    marginLeft: scale(14),
  },
});

export default PoliciesScreen;
