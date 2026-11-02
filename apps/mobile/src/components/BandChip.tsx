import { Text, View } from 'react-native';
import { COPY, type Band } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Tag } from './Chip';

const FILLED: Record<Band, number> = { Low: 1, Medium: 2, High: 3 };
const SELF_REPORTED = COPY.selfReported;

/** Three-segment neutral meter (Low / Medium / High). Never a number, ring or percentage. Decorative: the text carries it. */
export function BandMeter({ level, segmentWidth }: { level: Band | null; segmentWidth?: number }) {
  const t = useTheme();
  const m = t.components.bandChip.meter;
  const filled = level ? FILLED[level] : t.components.bandChip.noData.filledSegments;
  return (
    <View style={{ flexDirection: 'row', gap: m.segmentGap }} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            width: segmentWidth ?? m.segmentWidth,
            height: m.segmentHeight,
            borderRadius: m.segmentRadius,
            backgroundColor: i <= filled ? m.filled : m.emptyFill,
            borderWidth: i <= filled ? 0 : m.emptyStrokeWidth,
            borderColor: m.emptyStroke,
          }}
        />
      ))}
    </View>
  );
}

interface BandChipProps {
  /** Reading name, e.g. "Oiliness". */
  name: string;
  /** Low / Medium / High; null = not read in this scan. */
  level: Band | null;
  selfReported?: boolean;
  /**
   * chip: compact pill "Oiliness · High ▮▮▮" for reasons and the reading card (≤3 per card).
   * tile: two-column band tile with name, bodyStrong value, meter and the Low · Medium · High legend.
   */
  variant?: 'chip' | 'tile';
  testID?: string;
}

/** One skin reading as a band (component.bandChip). One TalkBack node: "Oiliness reading: high." */
export function BandChip({ name, level, selfReported = false, variant = 'chip', testID }: BandChipProps) {
  const t = useTheme();
  const c = t.components.bandChip;
  const l = t.components.bandList;
  const value = level ?? 'Not read';
  const a11y = `${name} reading: ${value.toLowerCase()}${selfReported ? `, ${SELF_REPORTED}` : ''}.`;

  if (variant === 'tile') {
    return (
      <View
        testID={testID}
        accessible
        accessibilityLabel={a11y}
        style={{ flexGrow: 1, flexBasis: '45%', minHeight: c.target, padding: c.paddingX, borderRadius: c.radius, backgroundColor: c.bg, gap: t.space[2] }}
      >
        <Text {...t.textProps.bodySm} style={[l.name, { color: l.nameColor }]}>
          {name}
        </Text>
        <Text {...t.textProps.bodyStrong} style={[l.value, { color: level ? l.valueColor : c.noData.valueColor }]}>
          {value}
        </Text>
        <BandMeter level={level} segmentWidth={18} />
        <Text {...t.textProps.caption} style={[c.meter.label, { color: c.meter.labelColor }]} importantForAccessibility="no">
          Low · Medium · High
        </Text>
        {selfReported ? <Tag label={SELF_REPORTED} variant="outline" /> : null}
      </View>
    );
  }

  return (
    <View
      testID={testID}
      accessible
      accessibilityLabel={a11y}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        minHeight: c.visualMinHeight,
        paddingHorizontal: c.paddingX,
        borderRadius: t.radius.full,
        backgroundColor: c.bg,
      }}
    >
      <Text {...t.textProps.label} style={[c.type, { color: c.fg }]}>
        {name}
        <Text style={{ color: c.separatorColor }}> · </Text>
        {value}
        {selfReported ? <Text style={{ color: c.separatorColor }}>{` · ${SELF_REPORTED}`}</Text> : null}
      </Text>
      <BandMeter level={level} />
    </View>
  );
}
