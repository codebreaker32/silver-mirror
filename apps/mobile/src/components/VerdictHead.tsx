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

// Silver & graphite (2.3): the head is a surface-tone card (radius 16, no hairline, no shadow). The verdict carries by
// a bare 20dp seal glyph in the verdict icon colour inline with the word (13 semibold, normal tracking); the sentence
// is the 17 line under it. No tinted disc: the surface tone step carries the card.
const SEAL = 20;
const LABEL_TYPE = { fontFamily: 'Geist_600SemiBold', fontSize: 13, lineHeight: 18, letterSpacing: 0 } as const;
const QUALIFIER_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 13, lineHeight: 18, letterSpacing: 0 } as const;
const LINE_TYPE = { fontFamily: 'Geist_500Medium', fontSize: 17, lineHeight: 24, letterSpacing: 0 } as const;

export interface VerdictHeadProps {
  tone: Verdict;
  /** Caps label; defaults to FITS / CAUTION / UNKNOWN. Ignored for medicine (no label). */
  label?: string | null;
  /** The verdict sentence, set in type.verdictLine, Geist 600 18/26 (medicine: the one title line). */
  line: string;
  /** Checked from the product name only: the qualifier line under the label. */
  nameOnly?: boolean;
  /** Qualifier under the label when nameOnly; defaults to "based on product name only". */
  qualifier?: string;
  /** The Demo reading is in use: small lavender-grey chip in the head. */
  demo?: boolean;
  /** Defaults to "Fits. <line>" etc. */
  accessibilityLabel?: string;
  /** Entrance animation style (opacity / scale) from the caller's reveal hook. */
  revealStyle?: Animated.WithAnimatedValue<StyleProp<ViewStyle>>;
  testID?: string;
}

/**
 * Verdict head (component.verdictCard.head, tokens 2.3): the same surface-tone card as every other card, radius 16,
 * padding 16, no hairline and no shadow (graphite + sheen edge in dark). The verdict is a bare 20dp seal icon in
 * verdict.*.icon inline with the word in the verdict fg at 13 semibold, then the sentence at 17 medium. No leading stripe; name-only is carried by the qualifier line. MEDICINE:
 * no box and no label, the 32dp pharmacist icon over one title line.
 */
export function VerdictHead({ tone, label, line, nameOnly = false, qualifier = 'based on product name only', demo = false, accessibilityLabel, revealStyle, testID = 'verdict-head' }: VerdictHeadProps) {
  const t = useTheme();
  const head = t.components.verdictCard.head;
  const c = head[tone];
  const a11y = accessibilityLabel ?? `${SPOKEN[tone]}. ${nameOnly ? `${qualifier}. ` : ''}${line}`;
  const raised = useCardStyle('raised');

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
          backgroundColor: t.dark ? c.bg : t.colors.surface,
          // Light: a tone step only (tokens 2.3); the verdict colour lives in the icon disc and the word.
          borderWidth: t.dark ? 1 : 0,
          borderStyle: 'solid' as const,
          borderColor: t.dark ? t.colors.border : 'transparent',
          borderRadius: t.radius.lg,
          paddingHorizontal: t.space[4],
          paddingVertical: t.space[4],
          gap: t.space[3],
        },
        t.dark ? { borderTopColor: t.colors.sheenEdge } : null,
        revealStyle,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[2] }}>
        <View testID={`${testID}-seal`} style={{ width: SEAL, height: 18, alignItems: 'center', justifyContent: 'center' }}>
          <VerdictIcon tone={tone} size={SEAL} color={c.icon} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          {shownLabel && c.showLabel ? (
            <Text {...t.textProps.verdictLabel} style={[textStyle(head.label), LABEL_TYPE, { color: c.fg }]}>
              {shownLabel}
            </Text>
          ) : null}
          {nameOnly ? (
            <Text {...t.textProps.label} style={[t.components.verdictCard.nameOnly.qualifier, QUALIFIER_TYPE, { color: t.colors.textMuted }]}>
              {qualifier}
            </Text>
          ) : null}
        </View>
        {demo ? <Tag label={COPY.reading.demo} variant="demo" /> : null}
      </View>
      <Text {...t.textProps.verdictLine} style={[c.subtitle, LINE_TYPE, { color: head.subtitleColor }]}>
        {line}
      </Text>
    </Animated.View>
  );
}
