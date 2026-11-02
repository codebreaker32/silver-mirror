import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Card, Icon, PillButton, SectionHeader, Txt } from '@/components';
import type { InciChip } from '../chips';
import type { LabelState } from '../flow';
import { InciChipEditor } from './InciChipEditor';

interface Props {
  catalogCount: number | null;
  label: LabelState;
  onSnap: () => void;
  onChips: (chips: InciChip[]) => void;
  onRun: (chips: InciChip[]) => void;
}

/** The button drops the fixed string's trailing full stop (DESIGN.md §9.4); the copy itself is unchanged. */
const SNAP_LABEL = COPY.snapLabel.replace(/\.$/, '');

/**
 * Designed UNKNOWN (spec §2D, DESIGN.md §9.4): one next step as a grey in-content pill (the dock holds the slate primary), the real catalogue count,
 * never an error state. After the photo, the editable ingredient chips take its place.
 */
export function UnknownPanel({ catalogCount, label, onSnap, onChips, onRun }: Props) {
  const t = useTheme();
  if (label.step === 'review') {
    return <InciChipEditor chips={label.chips} unreadable={label.unreadable} onChange={onChips} onRun={onRun} onRetake={onSnap} />;
  }
  return (
    <View testID="unknown-panel" style={{ gap: t.space[3] }}>
      <SectionHeader title="Next step" />
      <Card variant="raised" gap={t.space[4]}>
        <View style={{ gap: t.space[1] }}>
          <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }}>
            <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
              <Icon name="document" size={t.icon.md} color={t.colors.text} />
            </View>
            <Txt variant="bodyStrong" style={{ fontFamily: 'Geist_600SemiBold', fontSize: 17, lineHeight: 22, flex: 1 }}>
              Check it from the pack
            </Txt>
          </View>
          <View>
            {label.step === 'error' ? (
              <Body small accessibilityLiveRegion="polite">
                {label.message}
              </Body>
            ) : (
              <Body small muted>
                Photograph the ingredient list on the pack.
              </Body>
            )}
          </View>
        </View>
        <PillButton
          testID="snap-label"
          label={SNAP_LABEL}
          variant="secondary"
          leadingIcon="camera"
          onPress={onSnap}
          busy={label.step === 'reading'}
          busyLabel="Reading the label…"
          accessibilityHint="Opens the camera."
        />
      </Card>
      {catalogCount != null ? (
        <Body small muted testID="catalog-count">
          {COPY.catalogCount(catalogCount)}
        </Body>
      ) : null}
    </View>
  );
}
