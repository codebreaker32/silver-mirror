import { useState } from 'react';
import { Animated, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PillButton, SectionHeader, Txt } from '@/components';
import { BandChip } from '../ui/BandChip';
import { reasonsHeading, type ReasonView } from '../present';
import { useReveal } from './useReveal';

const VISIBLE = 3;
// Showcase card copy: the reading line 15 regular in text ink, the product fact 14 regular muted.
const READING_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 15, lineHeight: 21, letterSpacing: 0 } as const;
const FACT_TYPE = { fontFamily: 'Geist_400Regular', fontSize: 14, lineHeight: 20, letterSpacing: 0 } as const;

/**
 * One reason (component.reasonRow) as a white card (radius 18, hairline), three tiers: reading line (15 regular) →
 * product fact (14 regular muted) → under a 1dp rule (reasonRow.divider), the meta row: band chip and rule tag. No decorative numerals; one TalkBack node in visual order.
 */
function ReasonRow({ reason, order }: { reason: ReasonView; order: number }) {
  const t = useTheme();
  const r = t.components.reasonRow;
  const reveal = useReveal(reason.id, (order + 1) * t.motion.duration.reasonStagger);
  return (
    <Animated.View
      testID={`reason-${reason.index}`}
      accessible
      accessibilityLabel={reason.a11y}
      style={[
        {
          backgroundColor: r.bg,
          borderRadius: t.radius.lg,
          paddingHorizontal: r.paddingX,
          paddingVertical: r.paddingY,
          gap: 4,
          borderWidth: t.dark ? 1 : 0,
          borderColor: t.colors.border,
          borderTopColor: t.dark ? t.colors.sheenEdge : t.colors.border,
        },
        { backgroundColor: r.bg },
        reveal,
      ]}
    >
      {reason.kindNote ? (
        <Txt variant="overline" tone="muted">
          {reason.kindNote}
        </Txt>
      ) : null}
      {reason.reading ? <Txt variant="reason" style={[r.reading, READING_TYPE, { color: r.readingColor }]}>{reason.reading}</Txt> : null}
      <Txt variant="body" style={[r.fact, FACT_TYPE, { color: t.colors.textMuted }]}>
        {reason.fact}
      </Txt>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: r.chipGap,
          rowGap: t.space[2],
          marginTop: t.space[2],
          paddingTop: t.space[2] + 2,
          borderTopWidth: t.dark ? 1 : 0,
          borderTopColor: r.divider,
        }}
      >
        {reason.chip ? <BandChip {...reason.chip} /> : null}
        <Txt variant="caption" tone="muted">
          {reason.ruleTag}
        </Txt>
      </View>
    </Animated.View>
  );
}

export function ReasonList({ reasons, emptyNote }: { reasons: ReasonView[]; emptyNote: string | null }) {
  const t = useTheme();
  const [all, setAll] = useState(false);
  const shown = all ? reasons : reasons.slice(0, VISIBLE);
  const hidden = reasons.length - shown.length;

  return (
    <View testID="reasons" style={{ gap: t.space[3] }}>
      <SectionHeader title={reasonsHeading(reasons.length)} />
      {emptyNote ? (
        <Txt variant="reason" style={[t.components.reasonRow.reading, READING_TYPE, { color: t.colors.text }]}>
          {emptyNote}
        </Txt>
      ) : null}
      {shown.map((r, i) => (
        <ReasonRow key={r.id} reason={r} order={i} />
      ))}
      {hidden > 0 ? (
        <PillButton variant="tertiary" label={`Show ${hidden} more reason${hidden === 1 ? '' : 's'}`} trailingIcon="chevron-down" onPress={() => setAll(true)} />
      ) : null}
    </View>
  );
}
