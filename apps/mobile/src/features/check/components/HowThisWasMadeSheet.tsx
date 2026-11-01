import { Text, View } from 'react-native';
import { COPY, type DeleteState, type HowThisWasMade, type LedgerFeature } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { shortHash } from '../present';
import { Body, Caption, Sheet, Tag } from '../ui';

const FEATURE: Record<LedgerFeature, string> = {
  file_upload: 'YouCam file upload',
  skin_analysis_hd: 'YouCam Skin Analysis HD',
  skin_tone: 'YouCam skin tone',
  makeup_vto: 'YouCam Makeup VTO',
  task_delete: 'YouCam task delete',
  claude_resolve: 'Claude: read the listing',
  claude_label_ocr: 'Claude: read the label photo',
};

export const deleteStateLine = (s: DeleteState): string => {
  switch (s) {
    case 'deleted':
      return 'Deleted from YouCam ✓';
    case 'delete_failed':
      return COPY.deleteFailed;
    case 'orphan':
      return `Orphan upload: ${COPY.orphanUpload}`;
    default:
      return s.replace(/_/g, ' ');
  }
};

export function mergeLedgers(ledgers: readonly HowThisWasMade[]): HowThisWasMade {
  return {
    mock: ledgers.some((l) => l.mock),
    entries: ledgers.flatMap((l) => l.entries),
    files: ledgers.flatMap((l) => l.files),
    totalUnits: ledgers.reduce((n, l) => n + l.totalUnits, 0),
    totalLatencyMs: ledgers.reduce((n, l) => n + l.totalLatencyMs, 0),
  };
}

export function HowThisWasMadeSheet({
  visible,
  onClose,
  ledgers,
  rulesetHash,
}: {
  visible: boolean;
  onClose: () => void;
  ledgers: readonly HowThisWasMade[];
  rulesetHash: string;
}) {
  const t = useTheme();
  const l = mergeLedgers(ledgers);
  return (
    <Sheet visible={visible} title="How this was made" onClose={onClose} testID="how-made">
      {l.mock ? <Tag label="Recorded replay, not a live call" variant="outline" /> : null}
      <Body>Claude reads. Our rules decide. The verdict was worked out on this phone by published rules v{shortHash(rulesetHash)}.</Body>
      {l.entries.length === 0 ? <Caption>No calls were needed for this check.</Caption> : null}
      {l.entries.map((e, i) => (
        <View
          key={`${e.feature}-${i}`}
          accessible
          style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.space[3], gap: t.space[1] }}
        >
          <Text style={[t.type.label, { color: t.colors.text }]}>{FEATURE[e.feature]}</Text>
          {e.taskId ? <Caption selectable>Task {e.taskId}</Caption> : null}
          <Caption>
            {e.units} unit{e.units === 1 ? '' : 's'} · {e.latencyMs} ms · {e.status === 'ok' ? 'finished' : `stopped (${e.errorCode ?? 'error'})`}
            {e.model ? ` · ${e.model}` : ''}
          </Caption>
          {e.deleteState ? <Caption>{deleteStateLine(e.deleteState)}</Caption> : null}
        </View>
      ))}
      {l.files.map((f) => (
        <View key={f.fileId} accessible style={{ borderTopWidth: 1, borderTopColor: t.colors.border, paddingTop: t.space[3] }}>
          <Text style={[t.type.label, { color: t.colors.text }]}>File {f.fileId}</Text>
          <Caption>{deleteStateLine(f.state)}</Caption>
        </View>
      ))}
      <Caption>
        Total: {l.totalUnits} unit{l.totalUnits === 1 ? '' : 's'} · {l.totalLatencyMs} ms
      </Caption>
    </Sheet>
  );
}
