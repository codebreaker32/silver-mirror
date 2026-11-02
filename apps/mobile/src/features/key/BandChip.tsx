import { View, useWindowDimensions } from 'react-native';
import type { BandReading, Concern, KeyProfile } from '@skinkey/contracts';
import { BandChip as KitBandChip, BandMeter, Tag, Txt } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { CONCERNS, CONCERN_LABEL, SELF_REPORTED_TAG } from './model';

/** One reading as a compact kit chip ("Oiliness · High ▮▮▮"). */
export function BandChip({ concern, reading }: { concern: Concern; reading: BandReading }) {
  return <KitBandChip name={CONCERN_LABEL[concern]} level={reading.level} selfReported={reading.selfReported} />;
}

/**
 * Reading bands as rows in a rounded card (component.bandList): name left, bodyStrong band word right with the
 * neutral three-segment meter under it, hairlines between rows, one Low · Medium · High legend. No numbers.
 * Each row is one TalkBack node. At 1.5× font the value stacks under the name.
 */
export function BandList({ keyProfile }: { keyProfile: KeyProfile }) {
  const t = useTheme();
  const l = t.components.bandList;
  const { fontScale } = useWindowDimensions();
  const stack = fontScale >= l.stackAtFontScale;
  return (
    <View
      style={{
        backgroundColor: t.colors.surface,
        borderRadius: t.radius.lg,
        borderWidth: 1,
        borderColor: t.colors.border,
        borderTopColor: t.dark ? t.colors.sheenEdge : t.colors.border,
        paddingHorizontal: t.spacing.insetCard,
        paddingVertical: t.space[2],
      }}
    >
      <Txt variant="caption" style={[l.legend, { color: l.legendColor, paddingVertical: t.space[2] }]} importantForAccessibility="no">
        Bands: Low · Medium · High
      </Txt>
      {CONCERNS.map((c) => {
        const r = keyProfile.bands[c];
        return (
          <View
            key={c}
            testID={`band-${c}`}
            accessible
            accessibilityLabel={`${CONCERN_LABEL[c]} reading: ${r.level.toLowerCase()}${r.selfReported ? `, ${SELF_REPORTED_TAG}` : ''}.`}
            style={{
              minHeight: l.rowMinHeight,
              paddingVertical: l.rowPaddingY,
              borderTopWidth: 1,
              borderTopColor: l.rowDivider,
              flexDirection: stack ? 'column' : 'row',
              alignItems: stack ? 'flex-start' : 'center',
              gap: t.space[2],
            }}
          >
            <View style={{ flex: stack ? undefined : 1, gap: t.space[1] }}>
              <Txt variant="body" style={[l.name, { color: l.nameColor }]}>
                {CONCERN_LABEL[c]}
              </Txt>
              {r.selfReported ? <Tag label={SELF_REPORTED_TAG} variant="outline" /> : null}
            </View>
            <View style={{ alignItems: stack ? 'flex-start' : 'flex-end', gap: l.meterGap }}>
              <Txt variant="bodyStrong" style={[l.value, { color: l.valueColor }]}>
                {r.level}
              </Txt>
              <BandMeter level={r.level} />
            </View>
          </View>
        );
      })}
    </View>
  );
}
