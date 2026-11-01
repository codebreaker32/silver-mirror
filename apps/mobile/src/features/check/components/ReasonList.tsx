import { useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { reasonsHeading, type ReasonView } from '../present';
import { BandChip, Overline, TextLink, textStyle } from '../ui';
import { useReveal } from './useReveal';

const VISIBLE = 3;

function ReasonRow({ reason, order }: { reason: ReasonView; order: number }) {
  const t = useTheme();
  const r = t.components.reasonRow;
  const reveal = useReveal(reason.id, (order + 1) * t.motion.duration.reasonStagger);
  return (
    <Animated.View
      testID={`reason-${reason.index}`}
      accessible
      accessibilityLabel={reason.a11y}
      style={[{ flexDirection: 'row', paddingVertical: r.paddingY, borderBottomWidth: 1, borderBottomColor: r.divider }, reveal]}
    >
      <Text style={[textStyle(r.index), { color: r.indexColor, width: r.indexWidth }]}>{reason.index}</Text>
      <View style={{ flex: 1, gap: t.space[2] }}>
        {reason.kindNote ? <Overline>{reason.kindNote}</Overline> : null}
        {reason.reading ? <Text style={[r.reading, { color: r.readingColor }]}>{reason.reading}</Text> : null}
        <Text style={[r.fact, { color: r.factColor }]}>{reason.fact}</Text>
        {reason.chip ? (
          <View style={{ marginTop: t.space[1] }}>
            <BandChip {...reason.chip} />
          </View>
        ) : null}
        <Text style={[t.type.caption, { color: t.colors.textMuted }]}>{reason.ruleTag}</Text>
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
    <View testID="reasons">
      <Overline accessibilityRole="header">{reasonsHeading(reasons.length)}</Overline>
      {emptyNote ? (
        <Text style={[t.components.reasonRow.reading, { color: t.colors.text, paddingVertical: t.space[4] }]}>{emptyNote}</Text>
      ) : null}
      {shown.map((r, i) => (
        <ReasonRow key={r.id} reason={r} order={i} />
      ))}
      {hidden > 0 ? <TextLink label={`Show ${hidden} more reason${hidden === 1 ? '' : 's'}`} onPress={() => setAll(true)} /> : null}
    </View>
  );
}
