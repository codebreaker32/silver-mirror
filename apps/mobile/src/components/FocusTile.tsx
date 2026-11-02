import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';
import { IconDisc } from './IconButton';

export interface FocusItem {
  /** From the published facet map only, worded cosmetically ("Lighter textures", "Hydration", "Fragrance-free"). */
  label: string;
  icon: IconName;
}

/**
 * Focus tile (component.focusTile, showcase 04_report "Recommended Focus"): a white tile, radius 20, hairline + the
 * soft violet shadow (graphite-850 + sheen edge in dark), a centred 48dp lavender disc with a 24dp line icon, and the
 * label centred, at most two lines. `wide` keeps the old one-row layout for callers that still ask for it.
 */
export function FocusTile({ label, icon, wide = false }: FocusItem & { wide?: boolean }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const surface = t.dark
    ? { backgroundColor: f.bg, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge }
    : { ...t.elevation['1'].style, backgroundColor: f.bg };
  if (wide) {
    return (
      <View accessible accessibilityLabel={label} style={[surface, { flex: 1, minHeight: t.touch.min + t.space[2], borderRadius: f.radius, padding: f.padding, gap: t.space[3], flexDirection: 'row', alignItems: 'center' }]}>
        <IconDisc icon={icon} />
        <Text {...t.textProps.label} style={[f.label, { color: f.fg, flex: 1 }]}>
          {label}
        </Text>
      </View>
    );
  }
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={[surface, { flex: 1, minHeight: f.minHeight, borderRadius: f.radius, paddingHorizontal: t.space[2], paddingVertical: t.space[4], gap: f.gap, alignItems: 'center', justifyContent: 'flex-start' }]}
    >
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ width: f.disc, height: f.disc, borderRadius: t.radius.full, backgroundColor: f.discBg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={f.icon} color={f.iconColor} />
      </View>
      <Text {...t.textProps.label} numberOfLines={2} style={[f.label, { color: f.fg, textAlign: 'center' }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Three tiles across with 12dp gaps (focusTile.columns). Fewer than three keep the one-third width and sit left
 * (never stretched); extra ones are dropped. `aside` (an explanation caption) fills the empty columns beside a short
 * row, centred vertically, instead of blank spacers.
 */
export function FocusTiles({ items, aside, accessibilityLabel = 'What this means for products' }: { items: readonly FocusItem[]; aside?: ReactNode; accessibilityLabel?: string }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const shown = items.slice(0, f.columns);
  const spacers = Math.max(0, f.columns - shown.length);
  // Flat row so a tile is exactly one third: the aside spans the spare columns plus the gaps between them.
  const gap = t.space[3];
  return (
    <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', gap }}>
      {shown.map((it) => (
        <FocusTile key={it.label} {...it} />
      ))}
      {spacers > 0 && aside ? (
        <View style={{ flex: spacers, marginLeft: (spacers - 1) * gap, justifyContent: 'center' }}>{aside}</View>
      ) : (
        Array.from({ length: spacers }, (_, i) => <View key={`spacer${i}`} style={{ flex: 1 }} importantForAccessibility="no" />)
      )}
    </View>
  );
}
