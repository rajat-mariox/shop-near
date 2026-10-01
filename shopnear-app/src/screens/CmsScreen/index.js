import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import ScreenHeader from '../../components/ScreenHeader';
import { API_BASE_URL } from '../../constants/api';
import { fetchCmsPage } from '../../service/cmsService';
import { Colors } from '../../themes/Colors';
import { scale, verticalScale, moderateScale, fontScale } from '../../utils/responsive';

const THEME_COLOR = Colors.theme1;
// OEM system fonts par text-cut se bachne ke liye
const F = { fontFamily: 'sans-serif' };

// Header title turant dikhe isliye yahan bhi rakha hai (backend bhi title bhejta hai)
export const CMS_TITLES = {
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
  about: 'About Us',
  shipping: 'Shipping Policy',
  cancellation: 'Cancellation Policy',
  refund: 'Refund Policy',
  contact: 'Contact Us',
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const formatDate = (value) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// Admin CMS plain text hai: blank line = naya paragraph
const toParagraphs = (text) =>
  String(text || '')
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

// CMS me Privacy Policy khali ho to web par default policy hoti hai — wahi khol do
const WEB_PRIVACY_URL = `${API_BASE_URL.replace(/\/v1\/api\/?$/, '')}/privacy-policy`;

const ContactRow = ({ icon, label, value, onPress }) => (
  <TouchableOpacity
    style={styles.contactRow}
    activeOpacity={onPress ? 0.7 : 1}
    onPress={onPress}
    disabled={!onPress}>
    <View style={styles.contactIcon}>
      <Feather name={icon} size={moderateScale(18)} color={THEME_COLOR} />
    </View>
    <View style={styles.contactBody}>
      <Text style={styles.contactLabel}>{label}</Text>
      <Text style={styles.contactValue}>{value}</Text>
    </View>
  </TouchableOpacity>
);

/**
 * Admin panel > CMS ka ek page dikhata hai. Content har baar server se aata hai,
 * isliye admin me edit karte hi app me reflect hota hai (nayi build nahi chahiye).
 * route.params: { type } — CMS_TITLES ki koi key
 */
const CmsScreen = ({ navigation, route }) => {
  const type = route?.params?.type || 'about';
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchCmsPage(type);
    if (result.success) {
      setPage(result.data);
    } else {
      setError(result.message || 'Could not load this page.');
    }
    setLoading(false);
  }, [type]);

  useEffect(() => {
    load();
  }, [load]);

  const title = page?.title || CMS_TITLES[type] || 'Information';
  const paragraphs = toParagraphs(page?.content);
  const contact = page?.contact || {};
  const hasContact = !!(contact.email || contact.phone || contact.address);
  const isEmpty = type === 'contact' ? !hasContact : paragraphs.length === 0;
  const updated = page?.updatedAt ? formatDate(page.updatedAt) : '';

  const renderBody = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={THEME_COLOR} />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.center}>
          <Feather name="wifi-off" size={moderateScale(34)} color="#B1B5C3" />
          <Text style={styles.emptyText}>Could not load this page.</Text>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={load}>
            <Text style={styles.actionBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View style={styles.center}>
          <Feather name="file-text" size={moderateScale(34)} color="#B1B5C3" />
          <Text style={styles.emptyText}>This page will be updated soon.</Text>
          {type === 'privacy' ? (
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => Linking.openURL(WEB_PRIVACY_URL).catch(() => {})}>
              <Text style={styles.actionBtnText}>View Privacy Policy</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      );
    }

    return (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {updated ? <Text style={styles.updated}>Last updated: {updated}</Text> : null}

        {type === 'contact' ? (
          <>
            {contact.email ? (
              <ContactRow
                icon="mail"
                label="Email"
                value={contact.email}
                onPress={() => Linking.openURL(`mailto:${contact.email}`).catch(() => {})}
              />
            ) : null}
            {contact.phone ? (
              <ContactRow
                icon="phone"
                label="Phone"
                value={contact.phone}
                onPress={() => Linking.openURL(`tel:${contact.phone}`).catch(() => {})}
              />
            ) : null}
            {contact.address ? (
              <ContactRow icon="map-pin" label="Address" value={contact.address} />
            ) : null}
          </>
        ) : (
          paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>
              {p}
            </Text>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      <ScreenHeader style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <AntDesign name="left" size={moderateScale(20)} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </ScreenHeader>

      {renderBody()}
    </View>
  );
};

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
  scrollContent: {
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(14),
    paddingBottom: verticalScale(30),
  },
  updated: {
    ...F,
    color: '#777E90',
    fontSize: fontScale(12),
    marginBottom: verticalScale(12),
  },
  paragraph: {
    ...F,
    color: '#23262F',
    fontSize: fontScale(14),
    lineHeight: fontScale(22),
    marginBottom: verticalScale(12),
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scale(30),
  },
  emptyText: {
    ...F,
    color: '#777E90',
    fontSize: fontScale(14),
    textAlign: 'center',
    marginTop: verticalScale(12),
  },
  actionBtn: {
    marginTop: verticalScale(16),
    backgroundColor: THEME_COLOR,
    borderRadius: moderateScale(10),
    paddingHorizontal: scale(22),
    paddingVertical: verticalScale(10),
  },
  actionBtnText: {
    ...F,
    color: '#fff',
    fontSize: fontScale(14),
    fontWeight: '600',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F3',
  },
  contactIcon: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(20),
    backgroundColor: '#FFF0EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  contactBody: {
    flex: 1,
  },
  contactLabel: {
    ...F,
    color: '#777E90',
    fontSize: fontScale(12),
  },
  contactValue: {
    ...F,
    color: '#23262F',
    fontSize: fontScale(14),
    lineHeight: fontScale(20),
    marginTop: verticalScale(2),
  },
});

export default CmsScreen;
