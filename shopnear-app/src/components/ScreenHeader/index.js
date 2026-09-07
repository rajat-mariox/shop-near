import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Colors } from '../../themes/Colors';

const { width: SCREEN_W } = Dimensions.get('window');
// Figma frame 402 wide; sab sizes width ke proportion me
const px = (n) => (SCREEN_W / 402) * n;
const SCALLOP_SIZE = px(24);
const SCALLOP_COUNT = Math.ceil(SCREEN_W / SCALLOP_SIZE) + 1;

// Figma header ka halka shopping-icons pattern (white, low opacity) — fixed
// positions taaki har render same dikhe. x/y frame-402 ke px me, rot degrees.
const PATTERN = [
  { icon: 'shopping-bag', x: 8, y: 6, s: 20, rot: -15 },
  { icon: 'tag', x: 52, y: 34, s: 16, rot: 20 },
  { icon: 'gift', x: 96, y: 4, s: 18, rot: 10 },
  { icon: 'heart', x: 138, y: 40, s: 14, rot: -10 },
  { icon: 'shopping-cart', x: 176, y: 8, s: 20, rot: 0 },
  { icon: 'percent', x: 222, y: 38, s: 16, rot: 15 },
  { icon: 'credit-card', x: 262, y: 6, s: 18, rot: -12 },
  { icon: 'star', x: 306, y: 36, s: 14, rot: 0 },
  { icon: 'shopping-bag', x: 344, y: 10, s: 18, rot: 18 },
  { icon: 'tag', x: 384, y: 40, s: 16, rot: -20 },
  { icon: 'truck', x: 30, y: 60, s: 18, rot: 0 },
  { icon: 'gift', x: 120, y: 66, s: 14, rot: -15 },
  { icon: 'heart', x: 250, y: 64, s: 16, rot: 12 },
  { icon: 'shopping-cart', x: 330, y: 62, s: 16, rot: -8 },
];

/**
 * Figma wala screen header: coral background + halka icon pattern + neeche
 * scallop (lehar) edge. Har stack screen apna content (back, title, icons)
 * children me deta hai; `style` = us screen ka purana header layout style
 * (padding/row); background yahan se aata hai.
 *
 *   <ScreenHeader style={styles.headerContainer}> ...back/title... </ScreenHeader>
 */
const ScreenHeader = ({ style, children }) => (
  <View style={styles.wrap}>
    <View style={[styles.bg, style]}>
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {PATTERN.map((p, i) => (
          <Feather
            key={i}
            name={p.icon}
            size={px(p.s)}
            color="#fff"
            style={{
              position: 'absolute',
              left: px(p.x),
              top: px(p.y),
              opacity: 0.16,
              transform: [{ rotate: `${p.rot}deg` }],
            }}
          />
        ))}
      </View>
      {children}
    </View>
    {/* Scallop edge: coral circles header ke neeche aadhe latke hue */}
    <View style={styles.scallopRow} pointerEvents="none">
      {Array.from({ length: SCALLOP_COUNT }).map((_, i) => (
        <View key={i} style={styles.scallop} />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    // Scallops neeche wale content ke upar dikhein
    zIndex: 2,
    elevation: 2,
  },
  bg: {
    backgroundColor: Colors.theme1,
    overflow: 'hidden',
  },
  scallopRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: -SCALLOP_SIZE / 2,
    marginBottom: 0,
  },
  scallop: {
    width: SCALLOP_SIZE,
    height: SCALLOP_SIZE,
    borderRadius: SCALLOP_SIZE / 2,
    backgroundColor: Colors.theme1,
    marginHorizontal: -px(1),
  },
});

export default ScreenHeader;
