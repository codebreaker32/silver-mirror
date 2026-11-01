import { Text, View } from 'react-native';
import type { Band, Concern } from '@skinkey/contracts';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { CONCERN_LABEL } from '../format';

const FILLED: Record<Band, number> = { Low: 1, Medium: 2, High: 3 };

/** Compact band chip (components.md §8): the text is the information, the neutral-ink meter is an echo. */
export function BandChip({ concern, level, selfReported }: { concern: Concern; level: Band; selfReported: boolean }) {
  const t = useTheme();
  const c = t.components.bandChip;
  const m = c.meter;
  const label = `${CONCERN_LABEL[concern]} · ${level}${selfReported ? ` · ${COPY.selfReported}` : ''}`;
  return (
    <View
      accessible
      accessibilityLabel={`${CONCERN_LABEL[concern]} reading: ${level.toLowerCase()}${selfReported ? `, ${COPY.selfReported}` : ''}.`}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space[2],
        minHeight: c.visualMinHeight,
        paddingHorizontal: c.paddingX,
        borderRadius: c.radius,
        backgroundColor: c.bg,
      }}
    >
      <Text style={[c.type, { color: c.fg }]}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: m.segmentGap }} importantForAccessibility="no-hide-descendants">
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              width: m.segmentWidth,
              height: m.segmentHeight,
              borderRadius: m.segmentRadius,
              backgroundColor: i <= FILLED[level] ? m.filled : m.emptyFill,
              borderWidth: i <= FILLED[level] ? 0 : m.emptyStrokeWidth,
              borderColor: m.emptyStroke,
            }}
          />
        ))}
      </View>
    </View>
  );
}
