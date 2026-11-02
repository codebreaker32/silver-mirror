import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from './Icon';

export interface FocusItem {
  /** From the published facet map only, worded cosmetically ("Lighter textures", "Hydration", "Fragrance-free"). */
  label: string;
  icon: IconName;
}

/**
 * Quiet tile surface (tokens 2.3): the surface tone, one step up from the page, radius 16; no hairline, no shadow.
 * Graphite + sheen edge in dark.
 */
function useTileSurface() {
  const t = useTheme();
  const f = t.components.focusTile;
  return t.dark
    ? { backgroundColor: f.bg, borderWidth: 1, borderColor: t.colors.border, borderTopColor: t.colors.sheenEdge }
    : { backgroundColor: f.bg };
}

const TILE_RADIUS = 16;

/**
 * One focus trait as a row (tokens 2.3): a 20dp ink line icon, no disc and no tile, then the label in body type.
 * Rows sit together on one surface (FocusTiles); they are never a row of identical icon-topped cards.
 */
export function FocusTile({ label, icon }: FocusItem & { /** @deprecated rows have one layout now */ wide?: boolean }) {
  const t = useTheme();
  const f = t.components.focusTile;
  return (
    <View accessible accessibilityLabel={label} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3], minHeight: t.touch.min }}>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        <Icon name={icon} size={t.icon.md} color={f.iconColor} />
      </View>
      <Text {...t.textProps.body} style={[t.typography.body, { flex: 1, color: f.fg }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * "What this means for products" (component.focusTile, tokens 2.3): up to three traits as rows on ONE surface-tone
 * card, separated by spacing. Extra traits past the third are dropped.
 */
export function FocusTiles({ items, accessibilityLabel = 'What this means for products' }: { items: readonly FocusItem[]; accessibilityLabel?: string }) {
  const t = useTheme();
  const f = t.components.focusTile;
  const surface = useTileSurface();
  const shown = items.slice(0, f.columns);
  return (
    <View
      accessibilityRole="list"
      accessibilityLabel={accessibilityLabel}
      style={[surface, { borderRadius: TILE_RADIUS, paddingHorizontal: t.spacing.insetCard, paddingVertical: t.space[2] }]}
    >
      {shown.map((it) => (
        <FocusTile key={it.label} {...it} />
      ))}
    </View>
  );
}
