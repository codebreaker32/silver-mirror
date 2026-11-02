import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { SHEEN_GRADIENT } from './geometry';

interface SheenBackdropProps {
  style?: StyleProp<ViewStyle>;
  /** Corner radius when the sheen fills a card or plate rather than the whole screen. */
  radius?: number;
}

/**
 * The liquid-silver sheen (texture.sheen): a static diagonal pearl -> lavender -> silver gradient with one
 * soft highlight. Allowed on hero zones, empty-state plates and the face frame only; never behind reasons,
 * the ledger, forms or the verdict head. Never animated. Decorative and untouchable.
 */
export function SheenBackdrop({ style, radius = 0 }: SheenBackdropProps) {
  const { colors, dark } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const h = SHEEN_GRADIENT.highlight;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }, style]}
    >
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`sheen${uid}`} x1="0" y1="0" x2="1" y2="1">
            {SHEEN_GRADIENT.stops.map((s) => (
              <Stop key={s.role} offset={s.offset} stopColor={colors.sheen[s.role]} />
            ))}
          </LinearGradient>
          <RadialGradient id={`sheenHi${uid}`} cx={h.cx} cy={h.cy} r={h.r}>
            <Stop offset={0} stopColor={colors.mark.glint} stopOpacity={dark ? h.opacity * 0.12 : h.opacity} />
            <Stop offset={1} stopColor={colors.mark.glint} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sheen${uid})`} />
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#sheenHi${uid})`} />
      </Svg>
    </View>
  );
}
