import { useId, type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * Silver & graphite (tokens 2.3): a card is a tone step, never a line or a shadow.
 * raised / surface: the surface tone (#F8F8FA) one step up from the page, radius 16, no border, no shadow.
 * sunken: the well tone (#E1E3E8) one step down (chip tracks, thumbnails, quiet rows).
 * hero / gradient: legacy names; both draw the flat surface tone now (no gradient fill).
 * Never nest a card inside a card: group with spacing, or use a sunken well for the inner thing.
 */
export type CardVariant = 'raised' | 'surface' | 'sunken' | 'hero' | 'gradient';

/**
 * The skin gradient as an absolute-fill layer (react-native-svg, no extra dependency). 120 deg as in CSS: the line
 * runs left -> right and slightly down. Decorative.
 */
export function SkinGradient({ radius = 0 }: { radius?: number }) {
  const t = useTheme();
  const g = t.colors.skinGradient;
  const mid = t.components.readingCard.gradientMid;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}>
      <Svg width="100%" height="100%">
        <Defs>
          <LinearGradient id={`skin${uid}`} x1="0" y1="0.21" x2="1" y2="0.79">
            <Stop offset={0} stopColor={g.start} />
            <Stop offset={mid} stopColor={g.mid} />
            <Stop offset={1} stopColor={g.end} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#skin${uid})`} />
      </Svg>
    </View>
  );
}

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  /** Inner padding; defaults to spacing.insetCard (20). */
  padding?: number;
  /** Corner radius; defaults to radius.lg (16). */
  radius?: number;
  /** Gap between children; defaults to space.3. */
  gap?: number;
  /** Makes the whole card one pressable target with one label (read in visual order). */
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'button' | 'link';
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

export function useCardStyle(variant: CardVariant, radius?: number): ViewStyle {
  const t = useTheme();
  const r = radius ?? t.radius.lg;
  if (t.dark) {
    if (variant === 'sunken') return { backgroundColor: t.colors.bgSunken, borderRadius: r };
    return { backgroundColor: t.colors.surfaceRaised, borderRadius: r, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge };
  }
  if (variant === 'sunken') return { backgroundColor: t.colors.bgSunken, borderRadius: r };
  return { backgroundColor: t.colors.surface, borderRadius: r };
}

export function Card({
  children,
  variant = 'raised',
  padding,
  radius,
  gap,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  testID,
  style,
}: CardProps) {
  const t = useTheme();
  const base = useCardStyle(variant, radius);
  const inner: ViewStyle = { padding: padding ?? t.spacing.insetCard, gap: gap ?? t.space[3] };
  const fill = null;
  if (!onPress) {
    return (
      <View testID={testID} accessible={accessibilityLabel ? true : undefined} accessibilityLabel={accessibilityLabel} style={[base, inner, style]}>
        {fill}
        {children}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [base, inner, { minHeight: t.touch.min, overflow: 'hidden', transform: [{ scale: pressed ? 0.99 : 1 }] }, style]}
    >
      {fill}
      {children}
    </Pressable>
  );
}
