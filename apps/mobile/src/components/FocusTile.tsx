import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export interface FocusItem {
  /** From the published facet map only, worded cosmetically ("Lighter textures", "Hydration", "Fragrance-free"). */
  label: string;
  icon: IconName;
}

/** Square greige tile with a 24dp line icon and a label (component.focusTile). */
export function FocusTile({ label, icon, wide = false }: FocusItem & { wide?: boolean }) {
  const t = useTheme();
  const f = t.components.focusTile;
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={
        wide
          ? { flex: 1, minHeight: t.touch.min + t.space[2], borderRadius: f.radius, padding: f.padding, backgroundColor: f.bg, gap: t.space[3], flexDirection: 'row', alignItems: 'center' }
          : { flex: 1, minHeight: f.minHeight, borderRadius: f.radius, padding: f.padding, backgroundColor: f.bg, gap: f.gap, justifyContent: 'space-between' }
      }
    >
      <Icon name={icon} size={f.icon} color={f.fg} />
      <Text {...t.textProps.label} style={[f.label, { color: f.fg }]}>
        {label}
      </Text>
    </View>
  );
}

/** Up to three tiles across (focusTile.columns), sharing the row; one item becomes a wide row. Extra ones are dropped. */
export function FocusTiles({ items, accessibilityLabel = 'What this means for products' }: { items: readonly FocusItem[]; accessibilityLabel?: string }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const shown = items.slice(0, f.columns);
  return (
    <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', gap: t.space[3] }}>
      {/* One trait: a full-width row instead of a lone square beside empty space. Two or three share the row. */}
      {shown.map((it) => (
        <FocusTile key={it.label} {...it} wide={shown.length === 1} />
      ))}
    </View>
  );
}
