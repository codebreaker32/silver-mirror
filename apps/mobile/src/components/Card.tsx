import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';

/**
 * Lavender-grey & charcoal (tokens 2.4): a card is a tone step, never a line or a shadow at rest.
 * raised / surface: the near-white surface tone (#F7F6FA) one step up from the page, radius 16, no border.
 * Pressable cards scale to 0.98 and lift with one soft shadow only while pressed (PressableScale).
 * sunken: the well tone (#E4E2EB) one step down (chip tracks, thumbnails, quiet rows).
 * hero: legacy name; draws the flat surface tone (no gradient fill). The gradient variant is gone.
 * Never nest a card inside a card: group with spacing, or use a sunken well for the inner thing.
 */
export type CardVariant = 'raised' | 'surface' | 'sunken' | 'hero';

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
  if (!onPress) {
    return (
      <View testID={testID} accessible={accessibilityLabel ? true : undefined} accessibilityLabel={accessibilityLabel} style={[base, inner, style]}>
        {children}
      </View>
    );
  }
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={[base, inner, { minHeight: t.touch.min }, style]}
    >
      {children}
    </PressableScale>
  );
}
