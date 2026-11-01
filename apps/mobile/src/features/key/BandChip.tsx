import { Text, View } from 'react-native';
import type { BandReading, Concern } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Tag } from '../scan/ui';
import { BANDS, CONCERN_LABEL, SELF_REPORTED_TAG } from './model';

export function BandChip({ concern, reading }: { concern: Concern; reading: BandReading }) {
  const theme = useTheme();
  const c = theme.components.bandChip;
  const l = theme.components.bandList;
  const filled = BANDS.indexOf(reading.level) + 1;
  return (
    <View
      accessible
      accessibilityLabel={`${CONCERN_LABEL[concern]} reading: ${reading.level.toLowerCase()}${reading.selfReported ? `, ${SELF_REPORTED_TAG}` : ''}.`}
      style={{ flexGrow: 1, flexBasis: '45%', minHeight: c.target, padding: c.paddingX, borderRadius: c.radius, backgroundColor: c.bg, gap: theme.space[2] }}
    >
      <Text style={[l.name, { color: l.nameColor }]}>{CONCERN_LABEL[concern]}</Text>
      <Text style={[l.value, { color: l.valueColor }]}>{reading.level}</Text>
      <View style={{ flexDirection: 'row', gap: c.meter.segmentGap }} importantForAccessibility="no-hide-descendants">
        {BANDS.map((b, i) => (
          <View
            key={b}
            style={{
              width: 18,
              height: c.meter.segmentHeight,
              borderRadius: c.meter.segmentRadius,
              backgroundColor: i < filled ? c.meter.filled : c.meter.emptyFill,
              borderWidth: i < filled ? 0 : c.meter.emptyStrokeWidth,
              borderColor: c.meter.emptyStroke,
            }}
          />
        ))}
      </View>
      <Text style={[c.meter.label, { color: c.meter.labelColor }]} importantForAccessibility="no">
        Low · Medium · High
      </Text>
      {reading.selfReported ? <Tag label={SELF_REPORTED_TAG} variant="outline" /> : null}
    </View>
  );
}
