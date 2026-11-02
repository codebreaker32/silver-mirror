import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export interface FocusItem {
  /** From the published facet map only, worded cosmetically ("Lighter textures", "Hydration", "Fragrance-free"). */
  label: string;
  icon: IconName;
}

/** Square greige tile with a 24dp line icon and a label (component.focusTile). */
export function FocusTile({ label, icon }: FocusItem) {
  const t = useTheme();
  const f = t.components.focusTile;
  return (
    <View
      accessible
      accessibilityLabel={label}
      style={{ flex: 1, minHeight: f.minHeight, borderRadius: f.radius, padding: f.padding, backgroundColor: f.bg, gap: f.gap, justifyContent: 'space-between' }}
    >
      <Icon name={icon} size={f.icon} color={f.fg} />
      <Text {...t.textProps.label} style={[f.label, { color: f.fg }]}>
        {label}
      </Text>
    </View>
  );
}

/** Three tiles across (focusTile.columns). Pass at most three items; extra ones are dropped. */
export function FocusTiles({ items, accessibilityLabel = 'What this means for products' }: { items: readonly FocusItem[]; accessibilityLabel?: string }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const shown = items.slice(0, f.columns);
  return (
    <View accessibilityRole="list" accessibilityLabel={accessibilityLabel} style={{ flexDirection: 'row', gap: t.space[3] }}>
      {shown.map((it) => (
        <FocusTile key={it.label} {...it} />
      ))}
      {Array.from({ length: f.columns - shown.length }, (_, i) => (
        <View key={`pad-${i}`} style={{ flex: 1 }} />
      ))}
    </View>
  );
}
