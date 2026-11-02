import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export interface FocusItem {
  /** From the published facet map only, worded cosmetically ("Lighter textures", "Hydration", "Fragrance-free"). */
  label: string;
  icon: IconName;
}

/**
 * Quiet tile surface (showcase 04_report "Recommended Focus"): white, radius 18, a hairline and a very soft violet
 * shadow in light; graphite + sheen edge in dark. Kept local so the tile reads lighter than the raised cards.
 */
function useTileSurface() {
  const t = useTheme();
  const f = t.components.focusTile;
  return t.dark
    ? { backgroundColor: f.bg, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge }
    : {
        backgroundColor: f.bg,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: t.colors.border,
        shadowColor: t.colors.shadow,
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 1,
      };
}

/** Tile label: 13/17 medium (500), never semibold, centred. */
function useTileLabel() {
  const t = useTheme();
  const f = t.components.focusTile;
  return [f.label, { fontFamily: t.typography.labelSmRegular.fontFamily, fontSize: 13, lineHeight: 17, letterSpacing: 0, color: f.fg }];
}

const TILE_RADIUS = 18;

/**
 * Focus tile (component.focusTile, showcase 04_report "Recommended Focus"): a square white tile, a centred 44dp
 * lavender disc with a 22dp line icon, and the label centred, at most two lines. `wide` is the one-row layout the
 * grid uses when a reading has a single trait, so the row never shows an empty gap.
 */
export function FocusTile({ label, icon, wide = false }: FocusItem & { wide?: boolean }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const surface = useTileSurface();
  const labelStyle = useTileLabel();
  const disc = (
    <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: 44, height: 44, borderRadius: t.radius.full, backgroundColor: f.discBg, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={icon} size={22} color={f.iconColor} />
    </View>
  );
  if (wide) {
    return (
      <View accessible accessibilityLabel={label} style={[surface, { flex: 1, minHeight: t.touch.min + t.space[4], borderRadius: TILE_RADIUS, paddingHorizontal: t.space[4], paddingVertical: t.space[3], gap: t.space[3], flexDirection: 'row', alignItems: 'center' }]}>
        {disc}
        <Text {...t.textProps.labelSmRegular} style={[labelStyle, { flex: 1, fontSize: 14, lineHeight: 20 }]}>
          {label}
        </Text>
      </View>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[surface, { flex: 1, aspectRatio: 1, minHeight: f.minHeight, borderRadius: TILE_RADIUS, paddingHorizontal: t.space[2], paddingVertical: t.space[3], gap: t.space[2] + 2, alignItems: 'center', justifyContent: 'center' }]}
    >
      {disc}
      <Text {...t.textProps.labelSmRegular} numberOfLines={2} style={[labelStyle, { textAlign: 'center' }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * One even row of focus tiles with 10dp gaps, as showcase 04_report "Recommended Focus": three square tiles that
 * share the width. Two tiles share it the same way; a single trait becomes one wide row tile, so the row never
 * leaves an empty column. Extra tiles past the third are dropped.
 */
export function FocusTiles({ items, accessibilityLabel = 'What this means for products' }: { items: readonly FocusItem[]; accessibilityLabel?: string }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const shown = items.slice(0, f.columns);
  return (
    <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', gap: t.space[2] + 2 }}>
      {shown.map((it) => (
        <FocusTile key={it.label} {...it} wide={shown.length === 1} />
      ))}
    </View>
  );
}
