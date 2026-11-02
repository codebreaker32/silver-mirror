import { Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COPY } from '@skinkey/contracts';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { Tag } from './Chip';
import { VerdictIcon } from './Icon';
import { textStyle } from './Text';

const LABEL: Record<Exclude<Verdict, 'medicine'>, string> = { fits: 'FITS', caution: 'CAUTION', unknown: 'UNKNOWN' };
const SPOKEN: Record<Verdict, string> = { fits: 'Fits', caution: 'Caution', unknown: 'Unknown', medicine: 'Medicine' };

export interface VerdictHeadProps {
  tone: Verdict;
  /** Caps label; defaults to FITS / CAUTION / UNKNOWN. Ignored for medicine (no label). */
  label?: string | null;
  /** The verdict sentence, set in the serif verdictLine (medicine: the one serif title line). */
  line: string;
  /** Checked from the product name only: dashed edge + the qualifier line. */
  nameOnly?: boolean;
  /** Qualifier under the label when nameOnly; defaults to "based on product name only". */
  qualifier?: string;
  /** The Demo reading is in use: greige badge in the head. */
  demo?: boolean;
  /** Defaults to "Fits. <line>" etc. */
  accessibilityLabel?: string;
  /** Entrance animation style (opacity / scale) from the caller's reveal hook. */
  revealStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  testID?: string;
}

/**
 * The only block that carries the verdict tint (component.verdictCard.head): radius 20, padding 20, a 40dp white disc
 * holding the 24dp verdict icon, the caps label in the verdict fg, the serif sentence in full text colour, 1dp edge
 * (dashed for UNKNOWN and name-only). No leading stripe. MEDICINE: no box and no label, the 32dp pharmacist icon
 * over one serif line.
 */
export function VerdictHead({ tone, label, line, nameOnly = false, qualifier = 'based on product name only', demo = false, accessibilityLabel, revealStyle, testID = 'verdict-head' }: VerdictHeadProps) {
  const t = useTheme();
  const head = t.components.verdictCard.head;
  const c = head[tone];
  const a11y = accessibilityLabel ?? `${SPOKEN[tone]}. ${nameOnly ? `${qualifier}. ` : ''}${line}`;

  if (tone === 'medicine') {
    const g = t.components.verdictCard.medicineGate;
    return (
      <Animated.View testID={testID} accessible accessibilityRole="header" accessibilityLabel={accessibilityLabel ?? line} style={[{ gap: g.iconGap }, revealStyle]}>
        <VerdictIcon tone="medicine" size={c.iconSize} color={c.icon} />
        <Text {...t.textProps.title} style={[g.line, { color: g.lineColor }]}>
          {line}
        </Text>
      </Animated.View>
    );
  }

  const shownLabel = label === null ? null : (label ?? LABEL[tone]);
  return (
    <Animated.View
      testID={testID}
      accessible
      accessibilityRole="header"
      accessibilityLabel={a11y}
      style={[
        {
          backgroundColor: c.bg,
          borderColor: c.border,
          borderWidth: c.borderWidth,
          borderStyle: (nameOnly ? t.components.verdictCard.nameOnly.borderStyle : c.borderStyle) as 'solid' | 'dashed',
          borderRadius: head.radius,
          padding: head.padding,
          gap: t.space[3],
        },
        revealStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: head.iconGap }}>
        <View style={{ width: c.iconDiscSize, height: c.iconDiscSize, borderRadius: t.radius.full, backgroundColor: c.iconDisc, alignItems: 'center', justifyContent: 'center' }}>
          <VerdictIcon tone={tone} size={c.iconSize} color={c.icon} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          {shownLabel && c.showLabel ? (
            <Text {...t.textProps.verdictLabel} style={[textStyle(head.label), { color: c.fg }]}>
              {shownLabel}
            </Text>
          ) : null}
          {nameOnly ? (
            <Text {...t.textProps.label} style={[t.components.verdictCard.nameOnly.qualifier, { color: t.components.verdictCard.nameOnly.qualifierColor }]}>
              {qualifier}
            </Text>
          ) : null}
        </View>
        {demo ? <Tag label={COPY.reading.demo} variant="demo" /> : null}
      </View>
      <Text {...t.textProps.verdictLine} style={[c.subtitle, { color: head.subtitleColor }]}>
        {line}
      </Text>
    </Animated.View>
  );
}
