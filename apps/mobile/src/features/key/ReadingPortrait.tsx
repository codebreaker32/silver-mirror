import { useState, type ReactNode } from 'react';
import { Image } from 'expo-image';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Rect, Stop } from 'react-native-svg';
import { PHOTOS } from '@/components/photos';
import { useTheme } from '@/theme/ThemeProvider';

/** portrait.jpg is 864 × 1080 (4:5). */
const ASPECT = 1080 / 864;
/** Slight close-up so the face, not the white studio wall, fills the plate. */
const ZOOM = 1.3;
/** Point of the photo (fractions of its width/height) kept at the plate's centre: between the eyes and the mouth. */
const FOCUS = { x: 0.5, y: 0.4 };
/** The subject's left cheek (right side of the photo), as an ellipse in photo fractions. */
const CHEEK = { cx: 0.607, cy: 0.428, rx: 0.046, ry: 0.05 };
const DOT_GAP = 5;
const DOT_R = 1.15;

/**
 * Reading plate (experience reference "Your Reading"): the licensed portrait (photos/portrait.jpg, credits in
 * docs/CREDITS.md) cover-cropped into a radius-16 plate, a light neutral tint, a soft dot grid over the cheek drawn in
 * white at 40% (the "measured here" cue, not data), and a subtle neutral scrim along the bottom for overlaid text.
 * Entirely decorative: the reading's own label carries the meaning. `children` sit on top (the demo chip).
 */
export function ReadingPortrait({ height, children }: { height: number; children?: ReactNode }) {
  const t = useTheme();
  const [w, setW] = useState(0);
  const imgW = w * ZOOM;
  const imgH = imgW * ASPECT;
  const left = Math.min(0, Math.max(w - imgW, w / 2 - FOCUS.x * imgW));
  const top = Math.min(0, Math.max(height - imgH, height / 2 - FOCUS.y * imgH));

  const dots: { x: number; y: number; o: number }[] = [];
  if (w > 0) {
    const cx = left + CHEEK.cx * imgW;
    const cy = top + CHEEK.cy * imgH;
    const rx = CHEEK.rx * imgW;
    const ry = CHEEK.ry * imgH;
    for (let y = cy - ry; y <= cy + ry; y += DOT_GAP) {
      for (let x = cx - rx; x <= cx + rx; x += DOT_GAP) {
        const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
        // Full strength in the middle of the cheek, feathering out to nothing at the ellipse edge.
        if (d <= 1) dots.push({ x, y, o: Math.min(1, 1.6 * (1 - d)) });
      }
    }
  }

  return (
    <View
      testID="reading-portrait"
      onLayout={(e) => setW(e.nativeEvent.layout.width)}
      style={{ height, borderRadius: 16, overflow: 'hidden', backgroundColor: t.colors.bgSunken }}
    >
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        {w > 0 ? (
          <Image
            source={PHOTOS.portrait}
            contentFit="cover"
            cachePolicy="none"
            accessible={false}
            style={{ position: 'absolute', left, top, width: imgW, height: imgH, borderRadius: 16 }}
          />
        ) : null}
        <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
          <Defs>
            <LinearGradient id="reading-scrim" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#1B1A22" stopOpacity={0} />
              <Stop offset="1" stopColor="#1B1A22" stopOpacity={0.2} />
            </LinearGradient>
          </Defs>
          {/* light neutral tint so the white dots read on a high-key photo */}
          <Rect x={0} y={0} width="100%" height="100%" fill="#3C3848" opacity={0.08} />
          <G opacity={0.4}>
            {dots.map((d, i) => (
              <Circle key={i} cx={d.x} cy={d.y} r={DOT_R} fill="#FFFFFF" opacity={d.o} />
            ))}
          </G>
          {w > 0 ? <Rect x={0} y={height * 0.55} width={w} height={height * 0.45} fill="url(#reading-scrim)" /> : null}
        </Svg>
      </View>
      {children}
    </View>
  );
}
