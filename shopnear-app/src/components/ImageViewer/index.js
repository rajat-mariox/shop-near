import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Image,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { moderateScale, scale as hScale } from '../../utils/responsive';

// Full-screen product photo viewer: swipe se photos badlo, pinch ya double-tap
// se zoom, zoom hone par ungli se photo ghumao. Pure JS (PanResponder) - Android
// ScrollView zoom support nahi karta aur iske liye native lib ki zaroorat nahi.

const MAX_ZOOM = 4;
const DOUBLE_TAP_ZOOM = 2.5;
const DOUBLE_TAP_MS = 280;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const touchDistance = (t) => Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);

const ZoomableImage = ({ uri, width, height, active, onZoomChange }) => {
  const scaleV = useRef(new Animated.Value(1)).current;
  const txV = useRef(new Animated.Value(0)).current;
  const tyV = useRef(new Animated.Value(0)).current;
  const st = useRef({
    scale: 1, x: 0, y: 0,
    startScale: 1, startX: 0, startY: 0, startDist: 0,
    pinching: false, moved: false, lastTap: 0, zoomed: false,
  }).current;
  // PanResponder ek baar banta hai - latest props ref se padho
  const props = useRef({});
  props.current = { width, height, onZoomChange };

  const setZoomed = (z) => {
    if (st.zoomed !== z) {
      st.zoomed = z;
      props.current.onZoomChange?.(z);
    }
  };

  // Zoomed photo screen ke bahar na khiske
  const clampPos = (s, x, y) => {
    const mx = (props.current.width * (s - 1)) / 2;
    const my = (props.current.height * (s - 1)) / 2;
    return [clamp(x, -mx, mx), clamp(y, -my, my)];
  };

  const apply = (s, x, y) => {
    st.scale = s; st.x = x; st.y = y;
    scaleV.setValue(s); txV.setValue(x); tyV.setValue(y);
  };

  const animateTo = (s, x, y) => {
    st.scale = s; st.x = x; st.y = y;
    setZoomed(s > 1.01);
    Animated.parallel([
      Animated.spring(scaleV, { toValue: s, useNativeDriver: true, friction: 7 }),
      Animated.spring(txV, { toValue: x, useNativeDriver: true, friction: 7 }),
      Animated.spring(tyV, { toValue: y, useNativeDriver: true, friction: 7 }),
    ]).start();
  };

  // Tap point ke aas-paas zoom (zoomed ho to wapas normal)
  const toggleZoomAt = (locX, locY) => {
    if (st.scale > 1.01) {
      animateTo(1, 0, 0);
      return;
    }
    const s = DOUBLE_TAP_ZOOM;
    const { width: w, height: h } = props.current;
    const [x, y] = clampPos(s, (w / 2 - locX) * (s - 1), (h / 2 - locY) * (s - 1));
    animateTo(s, x, y);
  };

  const isDoubleTap = () => {
    const now = Date.now();
    const dbl = now - st.lastTap < DOUBLE_TAP_MS;
    st.lastTap = dbl ? 0 : now;
    return dbl;
  };

  // Do ungli (pinch) ya zoomed photo par pan - tab hi gesture lo, warna
  // FlatList ka swipe chalne do
  const wants = (e) => e.nativeEvent.touches.length >= 2 || st.scale > 1.01;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponderCapture: wants,
      onMoveShouldSetPanResponderCapture: wants,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => {
        st.moved = false;
        st.pinching = false;
        st.startX = st.x;
        st.startY = st.y;
        if (e.nativeEvent.touches.length >= 2) {
          st.pinching = true;
          st.startDist = touchDistance(e.nativeEvent.touches);
          st.startScale = st.scale;
        }
      },
      onPanResponderMove: (e, g) => {
        const touches = e.nativeEvent.touches;
        if (Math.abs(g.dx) > 4 || Math.abs(g.dy) > 4) st.moved = true;
        if (touches.length >= 2) {
          const dist = touchDistance(touches);
          if (!st.pinching || !st.startDist) {
            st.pinching = true;
            st.startDist = dist;
            st.startScale = st.scale;
            st.startX = st.x;
            st.startY = st.y;
            return;
          }
          st.moved = true;
          const s = clamp((st.startScale * dist) / st.startDist, 0.9, MAX_ZOOM);
          const ratio = s / st.startScale;
          const [x, y] = clampPos(s, st.startX * ratio, st.startY * ratio);
          apply(s, x, y);
          setZoomed(s > 1.01);
        } else {
          if (st.pinching) {
            // Ek ungli uthi - bachi ungli se pan continue, jump nahi
            st.pinching = false;
            st.startX = st.x - g.dx;
            st.startY = st.y - g.dy;
          }
          if (st.scale <= 1.01) return;
          const [x, y] = clampPos(st.scale, st.startX + g.dx, st.startY + g.dy);
          apply(st.scale, x, y);
        }
      },
      onPanResponderRelease: (e) => {
        if (!st.moved && isDoubleTap()) {
          toggleZoomAt(e.nativeEvent.locationX, e.nativeEvent.locationY);
          return;
        }
        if (st.scale < 1.05) animateTo(1, 0, 0);
        else setZoomed(true);
      },
      onPanResponderTerminate: () => {
        if (st.scale < 1.05) animateTo(1, 0, 0);
      },
    }),
  ).current;

  // Doosri photo par swipe hote hi yeh wali normal size par
  useEffect(() => {
    if (!active && st.scale !== 1) {
      st.zoomed = false;
      apply(1, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // Zoom na ho tab double-tap: Pressable FlatList swipe ke saath chalta hai
  const onPress = (e) => {
    if (isDoubleTap()) toggleZoomAt(e.nativeEvent.locationX, e.nativeEvent.locationY);
  };

  return (
    <View style={{ width, height, overflow: 'hidden' }} {...responder.panHandlers}>
      <Pressable onPress={onPress} style={{ width, height }}>
        <Animated.Image
          source={{ uri }}
          // scale: poori resolution decode ho, zoom par blur na aaye
          resizeMethod="scale"
          resizeMode="contain"
          style={{
            width,
            height,
            transform: [{ translateX: txV }, { translateY: tyV }, { scale: scaleV }],
          }}
        />
      </Pressable>
    </View>
  );
};

const ImageViewer = ({ visible, images = [], initialIndex = 0, onClose }) => {
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const thumbsRef = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [size, setSize] = useState(null);

  useEffect(() => {
    if (visible) {
      setIndex(initialIndex);
      setZoomed(false);
    }
  }, [visible, initialIndex]);

  // Active thumbnail hamesha dikhta rahe
  useEffect(() => {
    thumbsRef.current?.scrollTo({ x: Math.max(0, (index - 2) * THUMB_STEP), animated: true });
  }, [index]);

  const goTo = (i) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  };

  return (
    <Modal visible={visible} animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <View style={[styles.topBar, { paddingTop: insets.top + moderateScale(8) }]}>
          <Text style={styles.counter}>
            {images.length ? `${index + 1} / ${images.length}` : ''}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={[styles.closeBtn, { top: insets.top + moderateScale(4) }]}>
            <AntDesign name="close" size={moderateScale(24)} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1 }} onLayout={(e) => setSize(e.nativeEvent.layout)}>
          {size && (
            <FlatList
              ref={listRef}
              data={images}
              keyExtractor={(uri, i) => `${i}-${uri}`}
              horizontal
              pagingEnabled
              scrollEnabled={!zoomed}
              showsHorizontalScrollIndicator={false}
              initialScrollIndex={Math.min(initialIndex, Math.max(images.length - 1, 0))}
              getItemLayout={(_, i) => ({ length: size.width, offset: size.width * i, index: i })}
              windowSize={3}
              initialNumToRender={1}
              maxToRenderPerBatch={2}
              onMomentumScrollEnd={(e) =>
                setIndex(Math.round(e.nativeEvent.contentOffset.x / size.width))
              }
              renderItem={({ item, index: i }) => (
                <ZoomableImage
                  active={i === index}
                  uri={item}
                  width={size.width}
                  height={size.height}
                  onZoomChange={setZoomed}
                />
              )}
            />
          )}
        </View>

        <Text style={styles.hint}>
          {zoomed ? 'Double-tap to zoom out' : 'Pinch or double-tap to zoom'}
        </Text>

        {images.length > 1 && (
          <ScrollView
            ref={thumbsRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flexGrow: 0 }}
            contentContainerStyle={[
              styles.thumbs,
              { paddingBottom: insets.bottom + moderateScale(12) },
            ]}>
            {images.map((uri, i) => (
              <TouchableOpacity key={`${i}-${uri}`} onPress={() => goTo(i)} activeOpacity={0.8}>
                <Image
                  source={{ uri }}
                  style={[styles.thumb, i === index && styles.thumbActive]}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const THUMB = moderateScale(56);
const THUMB_GAP = hScale(8);
const THUMB_STEP = THUMB + THUMB_GAP;

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  topBar: {
    alignItems: 'center',
    paddingBottom: moderateScale(8),
  },
  counter: {
    color: '#fff',
    fontSize: moderateScale(15),
    fontWeight: '600',
    fontFamily: 'sans-serif',
  },
  closeBtn: {
    position: 'absolute',
    right: hScale(16),
    padding: moderateScale(6),
  },
  hint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: moderateScale(12),
    textAlign: 'center',
    marginVertical: moderateScale(8),
    fontFamily: 'sans-serif',
  },
  thumbs: {
    paddingHorizontal: hScale(12),
    gap: THUMB_GAP,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: moderateScale(6),
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbActive: { borderColor: '#FF6051' },
});

export default ImageViewer;
