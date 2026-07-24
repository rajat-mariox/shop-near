import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Always treat the shorter side as width so scaling stays stable in landscape
const [shortDimension, longDimension] = width < height ? [width, height] : [height, width];

// Design baseline (iPhone X / common design reference)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// Scales horizontally (widths, horizontal padding/margin)
export const scale = size => (shortDimension / guidelineBaseWidth) * size;

// Scales vertically (heights, vertical padding/margin)
export const verticalScale = size => (longDimension / guidelineBaseHeight) * size;

// Scales with a dampening factor so elements don't blow up on tablets
// (use for paddings, margins, border radii, icon sizes)
export const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Font sizes: moderate scaling rounded to the nearest pixel
export const fontScale = size => Math.round(PixelRatio.roundToNearestPixel(moderateScale(size)));

export const screenWidth = width;
export const screenHeight = height;
