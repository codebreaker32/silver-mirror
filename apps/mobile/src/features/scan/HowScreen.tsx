import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { COPY, type DeleteState, type HowThisWasMade, type LedgerEntry, type LedgerFeature } from '@skinkey/contracts';
import { Body, Button, Caption, Card, Divider, Heading, Icon, Screen, SectionHeader, StepChecklist, Tag, Txt, type ChecklistStep } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { loadScanLedger } from '../key';
import { deleteStateLabel, isFinalDeleteState } from './deleteCopy';
import { recordLedger, useLedgers, type LedgerKind } from './ledgerStore';
import { findStoredImages } from './native';

const FEATURE: Record<LedgerFeature, string> = {
  file_upload: 'File upload',
  skin_analysis_hd: 'Skin Analysis HD',
  skin_tone: 'Facial Color Tones',
  makeup_vto: 'Makeup VTO',
  task_delete: 'Task delete',
  claude_resolve: 'Claude: listing resolver',
  claude_label_ocr: 'Claude: label reader',
};

const KIND_TITLE: Record<LedgerKind, string> = {
  scan: `${COPY.reading.yours}: the scan`,
  tryon: 'Last try-on',
  resolve: 'Last product match',
  labelOcr: 'Last label photo',
};

const ORDER: readonly LedgerKind[] = ['scan', 'tryon', 'resolve', 'labelOcr'];

/** The delete lifecycle of every upload, in order (spec §2). */
const DELETE_STEPS = ['Uploaded', 'Task created', 'Running', 'Finished', 'Result read', 'Delete requested', 'Deleted from YouCam'] as const;

/** "a1b2c3…e9f0" for display; the full id stays in the TalkBack label. */
const shortId = (id: string) => (id.length > 14 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id);
const units = (n: number) => `${n} unit${n === 1 ? '' : 's'}`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)} s`;

function DeleteTag({ state }: { state: DeleteState }) {
  return <Tag label={deleteStateLabel(state)} icon={state === 'deleted' ? 'check-circle' : 'info'} variant={state === 'deleted' ? 'neutral' : 'outline'} />;
}

/** One recorded call as a compact row: service, short task id, units, time, status / delete chip. */
function EntryRow({ entry }: { entry: LedgerEntry }) {
  const theme = useTheme();
  const id = entry.taskId ?? entry.fileId;
  const status = entry.status === 'ok' ? 'OK' : `Did not finish${entry.errorCode ? ` (${entry.errorCode})` : ''}`;
  const meta = [id ? `${entry.taskId ? 'Task' : 'File'} ${shortId(id)}` : null, entry.model ?? null, units(entry.units), `${entry.latencyMs} ms`].filter(Boolean).join(' · ');
  return (
    <View
      accessible
      accessibilityLabel={[FEATURE[entry.feature], id ? `${entry.taskId ? 'task' : 'file'} id ${id}` : null, entry.model, units(entry.units), `${entry.latencyMs} milliseconds`, status, entry.deleteState ? deleteStateLabel(entry.deleteState) : null]
        .filter(Boolean)
        .join(', ')}
      style={{ gap: theme.space[1], paddingVertical: theme.space[3] }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexWrap: 'wrap' }}>
        <Txt variant="bodyStrong" style={{ flex: 1 }}>
          {FEATURE[entry.feature]}
        </Txt>
        {entry.deleteState ? <DeleteTag state={entry.deleteState} /> : <Tag label={status} variant={entry.status === 'ok' ? 'neutral' : 'outline'} />}
      </View>
      <Caption style={{ fontVariant: ['tabular-nums'] }} selectable>
        {meta}
      </Caption>
    </View>
  );
}

function LedgerCard({ kind, ledger, at }: { kind: LedgerKind; ledger: HowThisWasMade; at?: string }) {
  const theme = useTheme();
  return (
    <Card variant="raised" gap={0} testID={`ledger-${kind}`}>
      <View style={{ gap: theme.space[2], paddingBottom: theme.space[2] }}>
        <Txt accessibilityRole="header" variant="section">
          {KIND_TITLE[kind]}
        </Txt>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
          <Tag label={ledger.mock ? 'Mock YouCam: recorded fixtures' : 'Live YouCam API'} variant="outline" />
          {at ? <Tag label={new Date(at).toLocaleString()} /> : null}
        </View>
        <Caption>{`Total ${units(ledger.totalUnits)} · ${seconds(ledger.totalLatencyMs)}`}</Caption>
      </View>
      {ledger.files.map((f) => (
        <View key={f.fileId}>
          <Divider />
          <View
            accessible
            accessibilityLabel={`Uploaded file ${f.fileId}: ${deleteStateLabel(f.state)}${f.taskIds.length ? `. Tasks ${f.taskIds.join(', ')}` : ''}`}
            style={{ gap: theme.space[1], paddingVertical: theme.space[3] }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2], flexWrap: 'wrap' }}>
              <Txt variant="bodyStrong" style={{ flex: 1 }}>
                Uploaded file
              </Txt>
              <DeleteTag state={f.state} />
            </View>
            <Caption selectable>{[`File ${shortId(f.fileId)}`, f.taskIds.length ? `${f.taskIds.length} task${f.taskIds.length === 1 ? '' : 's'}` : null].filter(Boolean).join(' · ')}</Caption>
          </View>
        </View>
      ))}
      {ledger.entries.map((e, i) => (
        <View key={`${e.feature}-${e.taskId ?? i}`}>
          <Divider />
          <EntryRow entry={e} />
        </View>
      ))}
    </Card>
  );
}

export function HowScreen() {
  const theme = useTheme();
  const ledgers = useLedgers();
  const [images, setImages] = useState<string[] | null>(null);

  useEffect(() => {
    if (!ledgers.scan) void loadScanLedger().then((l) => l && recordLedger('scan', l));
  }, [ledgers.scan]);

  const check = useCallback(() => setImages(findStoredImages()), []);
  useEffect(check, [check]);

  const present = ORDER.filter((k) => ledgers[k]);
  const scanFiles = ledgers.scan?.ledger.files ?? [];
  const scanDeleted = scanFiles.length > 0 && scanFiles.every((f) => f.state === 'deleted');
  const scanFinal = scanFiles.length > 0 && scanFiles.every((f) => isFinalDeleteState(f.state));
  const deleteSteps: ChecklistStep[] = DELETE_STEPS.map((label, i) => ({ id: `d${i}`, label, state: scanDeleted ? 'done' : 'pending' }));
  const noPhotos = images !== null && images.length === 0;

  return (
    <Screen title="How this was made">
      <View style={{ gap: theme.space[3] }}>
        <Heading>{COPY.howMadeBoundary}</Heading>
        <Body muted>
          {`Task ids, units, time and delete status for each YouCam and Claude call, as recorded by the ${COPY.appName} Worker. Claude reads labels and listings. Our published rules decide the verdict.`}
        </Body>
      </View>

      <Card variant="raised" gap={theme.space[3]} testID="photos-on-phone">
        <View accessible accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[3] }}>
          <Icon name={images === null ? 'circle' : noPhotos ? 'check-circle' : 'info'} size={theme.icon.lg} color={theme.colors.text} />
          <View style={{ flex: 1, gap: 2 }}>
            <Txt variant="section">Photos on this phone</Txt>
            <Body small>
              {images === null ? 'Checking…' : noPhotos ? `No photos stored by ${COPY.appName}` : `${images.length} image file(s) found in app storage`}
            </Body>
          </View>
        </View>
        {images && images.length > 0
          ? images.map((p) => (
              <Caption key={p} selectable>
                {p}
              </Caption>
            ))
          : null}
        <Button label="Check again" variant="secondary" fullWidth={false} onPress={check} />
      </Card>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader
          title="Delete steps"
          supporting={scanDeleted ? 'Every upload from your last scan went through each step.' : scanFinal ? 'Your last scan ended early; see its card below.' : 'What happens to every upload, in order.'}
        />
        <StepChecklist steps={deleteSteps} announcement={null} />
        <DeleteNotes lines={[`If an upload never became a task: ${COPY.orphanUpload}`, `If a delete call fails: ${COPY.deleteFailed}`, COPY.privacyQualifier]} />
      </View>

      <View style={{ gap: theme.space[3] }}>
        <SectionHeader title="Recorded calls" />
        {present.length === 0 ? (
          <Body muted>No calls recorded on this phone yet. Run a scan, a try-on or a product check, then come back here.</Body>
        ) : (
          present.map((k) => <LedgerCard key={k} kind={k} ledger={ledgers[k]!.ledger} at={ledgers[k]!.at} />)
        )}
      </View>

      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}

function DeleteNotes({ lines }: { lines: readonly string[] }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[2] }}>
      {lines.map((l) => (
        <Body key={l} small muted>
          {l}
        </Body>
      ))}
    </View>
  );
}
