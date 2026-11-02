import type { KeyProfile } from '@skinkey/contracts';
import { RULES } from '@skinkey/rules';
import type { FocusItem } from '@/components/FocusTile';

/**
 * "What this means for products" tiles (DESIGN.md §9.9), derived only from which published fit rules the reading
 * triggers. Product-trait words only, never a promise about skin. Claude is never involved.
 */
const FOCUS: readonly (FocusItem & { rules: readonly string[] })[] = [
  { label: 'Lighter textures', icon: 'waves', rules: ['OCC-1', 'OCC-2', 'SUP-2'] },
  { label: 'Hydration', icon: 'droplet', rules: ['SUP-1', 'ALC-1'] },
  { label: 'Fragrance-free', icon: 'spray-off', rules: ['FRG-1'] },
];

function triggers(ruleId: string, key: KeyProfile): boolean {
  const rule = RULES.find((r) => r.ruleId === ruleId);
  if (!rule) return false;
  return rule.triggers.some((t) => {
    if (t.on === 'band') return t.levels.includes(key.bands[t.concern].level);
    if (t.on === 'zone' && key.copySet === 'A') {
      const value = key.zones[t.zone];
      return Boolean(value && t.classes.includes(value));
    }
    return false;
  });
}

export interface FocusTileItem extends FocusItem {
  /** Rule ids behind the tile, for the TalkBack label. */
  rules: string[];
}

export function focusTilesFor(key: KeyProfile): FocusTileItem[] {
  return FOCUS.map((f) => ({ label: f.label, icon: f.icon, rules: f.rules.filter((id) => triggers(id, key)) })).filter((f) => f.rules.length > 0);
}
