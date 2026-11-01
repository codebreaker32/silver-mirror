import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import type { InciChip } from '../chips';
import type { LabelState } from '../flow';
import { Body, Button } from '../ui';
import { InciChipEditor } from './InciChipEditor';

interface Props {
  catalogCount: number | null;
  label: LabelState;
  onSnap: () => void;
  onChips: (chips: InciChip[]) => void;
  onRun: (chips: InciChip[]) => void;
}

/** Designed UNKNOWN (spec §2D): a next step and the live catalogue count, never an error state. */
export function UnknownPanel({ catalogCount, label, onSnap, onChips, onRun }: Props) {
  const t = useTheme();
  if (label.step === 'review') {
    return <InciChipEditor chips={label.chips} unreadable={label.unreadable} onChange={onChips} onRun={onRun} onRetake={onSnap} />;
  }
  return (
    <View testID="unknown-panel" style={{ gap: t.space[4] }}>
      {catalogCount != null ? <Body testID="catalog-count">{COPY.catalogCount(catalogCount)}</Body> : null}
      <Button
        testID="snap-label"
        label={COPY.snapLabel}
        leadingIcon="camera"
        onPress={onSnap}
        busy={label.step === 'reading'}
        busyLabel="Reading the label…"
        accessibilityHint="Opens the camera. Claude reads the ingredient names; you confirm them before any check runs."
      />
      {label.step === 'reading' ? (
        <Body muted accessibilityLiveRegion="polite">
          Reading the ingredient names (Claude). You'll check them next.
        </Body>
      ) : null}
      {label.step === 'error' ? (
        <Body accessibilityLiveRegion="polite">{label.message}</Body>
      ) : (
        <Body muted>Photograph the ingredient list on the pack. Claude reads the names; you check them; our rules decide.</Body>
      )}
    </View>
  );
}
