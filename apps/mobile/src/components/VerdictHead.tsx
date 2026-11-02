import { Animated, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { COPY } from '@skinkey/contracts';
import type { Verdict } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { useCardStyle } from './Card';
import { Tag } from './Chip';
import { VerdictIcon } from './Icon';
import { textStyle, Txt } from './Text';

const LABEL: Record<Exclude<Verdict, 'medicine'>, string> = { fits: 'FITS', caution: 'CAUTION', unknown: 'UNKNOWN' };
const SPOKEN: Record<Verdict, string> = { fits: 'Fits', caution: 'Caution', unknown: 'Unknown', medicine: 'Medicine' };

export interface VerdictHeadProps {
  tone: Verdict;
  /** Caps label; defaults to FITS / CAUTION / UNKNOWN. Ignored for medicine (no label). */
  label?: string | null;
  /** The verdict sentence, set in type.verdictLine, Geist 600 18/26 (medicine: the one title line). */
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
 * Verdict head (component.verdictCard.head, 2.1 round 1): a white raised card like every other card (hairline + the
 * soft violet shadow; graphite + sheen edge in dark), radius 24, padding 20. The verdict lives in a 40dp tinted disc
 * holding the 24dp verdict icon and the caps label in the verdict fg; the sans sentence is in full text colour.
 * UNKNOWN and name-only get a dashed meaningful edge. No leading stripe. MEDICINE: no box and no label, the 32dp
 * pharmacist icon over one title line.
 */
export function VerdictHead({ tone, label, line, nameOnly = false, qualifier = 'based on product name only', demo = false, accessibilityLabel, revealStyle, testID = 'verdict-head' }: VerdictHeadProps) {
  const t = useTheme();
  const head = t.components.verdictCard.head;
  const c = head[tone];
  const a11y = accessibilityLabel ?? `${SPOKEN[tone]}. ${nameOnly ? `${qualifier}. ` : ''}${line}`;
  const raised = useCardStyle('raised', head.radius);

  if (tone === 'medicine') {
    const g = t.components.verdictCard.medicineGate;
    // The title line is only the first sentence ("This looks like a medicine (contains adapalene)."); the rest of the
    // fixed string follows as body, word for word, so the gate doesn't read as a five-line headline.
    const cut = line.indexOf('. ');
    const lead = cut > 0 ? line.slice(0, cut + 1) : line;
    const rest = cut > 0 ? line.slice(cut + 2) : '';
    return (
      <Animated.View testID={testID} accessible accessibilityRole="header" accessibilityLabel={accessibilityLabel ?? line} style={[{ gap: g.iconGap }, revealStyle]}>
        <VerdictIcon tone="medicine" size={c.iconSize} color={c.icon} />
        <View style={{ gap: t.space[2] }}>
          <Text {...t.textProps.title} style={[g.line, { color: g.lineColor }]}>
            {lead}
          </Text>
          {rest ? <Txt variant="body">{rest}</Txt> : null}
        </View>
      </Animated.View>
    );
  }

  const dashed = nameOnly || c.borderStyle === 'dashed';
  const dashEdge = c.borderStyle === 'dashed' ? c.border : t.colors.borderStrong;
  const shownLabel = label === null ? null : (label ?? LABEL[tone]);
  return (
    <Animated.View
      testID={testID}
      accessible
      accessibilityRole="header"
      accessibilityLabel={a11y}
      style={[
        raised,
        {
          backgroundColor: c.bg,
          borderWidth: c.borderWidth,
          borderRadius: head.radius,
          padding: head.padding,
          gap: t.space[3],
        },
        // A dashed edge carries meaning (UNKNOWN, checked by name only), so it is drawn in a visible ink, all round.
        dashed ? { borderStyle: 'dashed' as const, borderColor: dashEdge, borderTopColor: dashEdge } : { borderColor: c.border },
        revealStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: head.iconGap }}>
        <View testID={`${testID}-disc`} style={{ width: c.iconDiscSize, height: c.iconDiscSize, borderRadius: t.radius.full, backgroundColor: c.iconDisc, alignItems: 'center', justifyContent: 'center' }}>
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
