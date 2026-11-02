import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * raised: white card with the soft slate shadow in light; graphite-850 with a hairline and the 1dp sheen edge in dark.
 * surface: plain pearl-25 / graphite-900 card with a hairline, no shadow.
 * sunken: bg-sunken well, no edge (chips track, thumbnails, quiet rows).
 * hero: the sheen lavender fill (first match card, empty-state plate). No nested cards.
 */
export type CardVariant = 'raised' | 'surface' | 'sunken' | 'hero';

export interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  /** Inner padding; defaults to spacing.insetCard (20). */
  padding?: number;
  /** Corner radius; defaults to radius.lg (20). */
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
  switch (variant) {
    case 'raised':
      return t.dark
        ? { backgroundColor: t.colors.surfaceRaised, borderRadius: r, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge }
        : { ...t.elevation['1'].style, borderRadius: r };
    case 'surface':
      return { backgroundColor: t.colors.surface, borderRadius: r, borderWidth: 1, borderColor: t.colors.border };
    case 'sunken':
      return { backgroundColor: t.colors.bgSunken, borderRadius: r };
    case 'hero':
      return { backgroundColor: t.components.productMatchCard.heroBg, borderRadius: r };
  }
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
  if (!onPress) {
    return (
      <View testID={testID} accessible={accessibilityLabel ? true : undefined} accessibilityLabel={accessibilityLabel} style={[base, inner, style]}>
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
      {children}
    </Pressable>
  );
}
