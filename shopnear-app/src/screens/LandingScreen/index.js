import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, Dimensions, StatusBar } from 'react-native';
import styles from './style';
import { AppImages } from '../../constants/app.image';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    key: '1',
    image: AppImages.landing1,
    title: 'Find Stores\nAround You Instantly',
    subtitle: 'Explore trusted clothing and grocery shops near your location — all in one app.',
  },
  {
    key: '2',
    image: AppImages.landing2,
    title: 'One App\nfor Every Local Need',
    subtitle: 'From fashion to essentials — ShopNear connects you to your neighborhood’s best stores in seconds.',
  },
  {
    key: '3',
    image: AppImages.landing3,
    title: 'Support Local,\nGet What You Need Fast',
    subtitle: 'Browse real nearby stores, check available products, and shop directly without waiting.',
  },
];

const LandingScreen = ({ navigation }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);

  const onMomentumScrollEnd = (e) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  useEffect(() => {
    if (activeIndex >= SLIDES.length - 1) return;
    const timer = setTimeout(() => {
      const nextIndex = activeIndex + 1;
      listRef.current?.scrollToOffset({ offset: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearTimeout(timer);
  }, [activeIndex]);

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.topSection}>
        <Image source={item.image} style={styles.topImage} resizeMode="cover" />
      </View>
      <View style={styles.bottomCard}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <View style={styles.dotsContainer}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.activeDot]} />
          ))}
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.termsText}>
          By continuing you agree to our{' '}
          <Text style={styles.linkText}>Terms of Services</Text> and{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
      />
    </View>
  );
};

export default LandingScreen;
