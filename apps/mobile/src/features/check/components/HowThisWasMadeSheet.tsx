import { View } from 'react-native';
import { COPY, type DeleteState, type HowThisWasMade, type LedgerFeature } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption, Icon, Sheet, Tag, Txt } from '@/components';
import { shortHash } from '../present';

const FEATURE: Record<LedgerFeature, string> = {
  file_upload: 'YouCam file upload',
  skin_analysis_hd: 'YouCam Skin Analysis HD',
  skin_tone: 'YouCam skin tone',
  makeup_vto: 'YouCam Makeup VTO',
  task_delete: 'YouCam task delete',
  claude_resolve: 'Claude: read the listing',
  claude_label_ocr: 'Claude: read the label photo',
};

/** Plain words for a delete state; the drawn check-circle (not a unicode tick) marks "deleted". */
export const deleteStateLine = (s: DeleteState): string => {
  switch (s) {
    case 'deleted':
      return 'Deleted from YouCam';
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

/** Checklist row for a delete state: check-circle when deleted, an empty ring otherwise. Never a red mark. */
function DeleteRow({ state }: { state: DeleteState }) {
  const t = useTheme();
  const done = state === 'deleted';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: t.space[2] }}>
      <View style={{ paddingTop: 1 }}>
        <Icon name={done ? 'check-circle' : 'circle'} size={t.icon.sm} color={done ? t.colors.text : t.colors.textMuted} />
      </View>
      <Txt variant={done ? 'label' : 'bodySm'} tone={done ? 'default' : 'muted'} style={{ flex: 1 }}>
        {deleteStateLine(state)}
      </Txt>
    </View>
  );
}

/** "How this was made": the serif boundary line, then each recorded call as a compact sunken card. */
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
  const card = { backgroundColor: t.colors.bgSunken, borderRadius: t.radius.md, padding: t.space[4], gap: t.space[1] };
  return (
    <Sheet visible={visible} title="How this was made" onClose={onClose} testID="how-made">
      <Txt variant="verdictLine">{COPY.howMadeBoundary}</Txt>
      <Body small muted>
        The verdict was worked out on this phone by published rules (version {shortHash(rulesetHash)}).
      </Body>
      {l.mock ? <Tag label="Recorded replay, not a live call" variant="outline" /> : null}
      {l.entries.length === 0 ? <Caption>No calls were needed for this check.</Caption> : null}
      <View style={{ gap: t.space[2] }}>
        {l.entries.map((e, i) => (
          <View key={`${e.feature}-${i}`} accessible style={card}>
            <Txt variant="label">{FEATURE[e.feature]}</Txt>
            {e.taskId ? (
              <Caption selectable numberOfLines={1}>
                Task {e.taskId}
              </Caption>
            ) : null}
            <Caption>
              {e.units} unit{e.units === 1 ? '' : 's'} · {e.latencyMs} ms · {e.status === 'ok' ? 'finished' : `stopped (${e.errorCode ?? 'error'})`}
              {e.model ? ` · ${e.model}` : ''}
            </Caption>
            {e.deleteState ? (
              <View style={{ marginTop: t.space[1] }}>
                <DeleteRow state={e.deleteState} />
              </View>
            ) : null}
          </View>
        ))}
        {l.files.map((f) => (
          <View key={f.fileId} accessible style={card}>
            <Txt variant="label">File {f.fileId}</Txt>
            <DeleteRow state={f.state} />
          </View>
        ))}
      </View>
      <Caption>
        Total: {l.totalUnits} unit{l.totalUnits === 1 ? '' : 's'} · {l.totalLatencyMs} ms
      </Caption>
    </Sheet>
  );
}
