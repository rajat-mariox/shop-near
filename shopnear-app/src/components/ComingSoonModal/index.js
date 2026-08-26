import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, Text, TouchableOpacity, View, Image } from 'react-native';
import { styles } from './styles';

/**
 * Reusable "Coming Soon" popup — card spring-scale + fade in, icon gently
 * bounces, overlay tap ya button se band hota hai.
 */
const ComingSoonModal = ({ visible, onClose, title = 'Coming Soon', subtitle, icon, iconTint }) => {
  const cardScale = useRef(new Animated.Value(0.7)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      cardScale.setValue(0.7);
      cardOpacity.setValue(0);
      iconBounce.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon soft float loop
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(iconBounce, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [visible, cardScale, cardOpacity, iconBounce]);

  const iconTranslate = iconBounce.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <Animated.View
          style={[styles.card, { opacity: cardOpacity, transform: [{ scale: cardScale }] }]}
          onStartShouldSetResponder={() => true}>
          <View style={styles.iconOuterRing}>
            <Animated.View style={[styles.iconInnerCircle, { transform: [{ translateY: iconTranslate }] }]}>
              {icon ? (
                <Image
                  source={icon}
                  style={[styles.iconImage, iconTint ? { tintColor: iconTint } : null]}
                  resizeMode="contain"
                />
              ) : null}
            </Animated.View>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>COMING SOON</Text>
          </View>

          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ComingSoonModal;
