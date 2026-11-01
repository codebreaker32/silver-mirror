import { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { COPY, type HowThisWasMade, type LedgerEntry, type LedgerFeature } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { loadScanLedger } from '../key';
import { deleteStateLabel } from './deleteCopy';
import { recordLedger, useLedgers, type LedgerKind } from './ledgerStore';
import { findStoredImages } from './native';
import { Body, Button, Heading, Overline, Screen, Tag } from './ui';

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
  scan: 'Your Key scan',
  tryon: 'Last try-on',
  resolve: 'Last product match',
  labelOcr: 'Last label photo',
};

const ORDER: readonly LedgerKind[] = ['scan', 'tryon', 'resolve', 'labelOcr'];

function Row({ k, v }: { k: string; v: string }) {
  const theme = useTheme();
  const l = theme.components.provenanceLedger;
  return (
    <View
      accessible
      accessibilityLabel={`${k}: ${v}`}
      style={{ flexDirection: 'row', gap: l.keyGap, paddingVertical: theme.space[2], borderBottomWidth: 1, borderBottomColor: l.rowDivider }}
    >
      <Text style={[{ ...l.key, textTransform: 'uppercase' }, { color: l.keyColor, width: l.keyWidth + theme.space[6] }]}>{k}</Text>
      <Text style={[l.value, { color: l.valueColor, flex: 1, fontVariant: ['tabular-nums'] }]} selectable>
        {v}
      </Text>
    </View>
  );
}

function EntryBlock({ entry }: { entry: LedgerEntry }) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[1], paddingTop: theme.space[2] }}>
      <Text style={[theme.type.label, { color: theme.colors.text }]}>{FEATURE[entry.feature]}</Text>
      {entry.taskId ? <Row k="Task id" v={entry.taskId} /> : null}
      {entry.fileId ? <Row k="File id" v={entry.fileId} /> : null}
      {entry.model ? <Row k="Model" v={entry.model} /> : null}
      <Row k="Units" v={String(entry.units)} />
      <Row k="Latency" v={`${entry.latencyMs} ms`} />
      <Row k="Status" v={entry.status === 'ok' ? 'OK' : `Did not finish${entry.errorCode ? ` (${entry.errorCode})` : ''}`} />
      {entry.deleteState ? <Row k="Delete" v={deleteStateLabel(entry.deleteState)} /> : null}
    </View>
  );
}

function LedgerSection({ kind, ledger, at }: { kind: LedgerKind; ledger: HowThisWasMade; at?: string }) {
  const theme = useTheme();
  const l = theme.components.provenanceLedger;
  return (
    <View style={{ borderTopWidth: 1.5, borderTopColor: l.topRule, paddingTop: theme.space[3], gap: theme.space[2] }}>
      <Text accessibilityRole="header" style={[l.title, { color: l.titleColor }]}>
        {KIND_TITLE[kind]}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
        {ledger.mock ? <Tag label="Mock YouCam: recorded fixtures" variant="outline" /> : <Tag label="Live YouCam API" variant="outline" />}
        {at ? <Tag label={new Date(at).toLocaleString()} /> : null}
      </View>
      <Row k="Total units" v={String(ledger.totalUnits)} />
      <Row k="Total time" v={`${(ledger.totalLatencyMs / 1000).toFixed(1)} s`} />
      {ledger.files.map((f) => (
        <View key={f.fileId} style={{ gap: theme.space[1] }}>
          <Row k="Uploaded file" v={f.fileId} />
          <Row k="Delete" v={deleteStateLabel(f.state)} />
          {f.taskIds.length > 0 ? <Row k="Tasks" v={f.taskIds.join(', ')} /> : null}
        </View>
      ))}
      {ledger.entries.map((e, i) => (
        <EntryBlock key={`${e.feature}-${e.taskId ?? i}`} entry={e} />
      ))}
    </View>
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

  return (
    <Screen title="How this was made">
      <Heading>How this was made</Heading>
      <Body muted>
        Task ids, units, time and delete status for each YouCam and Claude call, as recorded by the SkinKey Worker. Claude reads labels and
        listings. Our published rules decide the verdict.
      </Body>

      <View style={{ gap: theme.space[2] }}>
        <Overline>Photos on this phone</Overline>
        <Text accessibilityLiveRegion="polite" style={[theme.type.bodyStrong, { color: theme.colors.text }]}>
          {images === null ? 'Checking…' : images.length === 0 ? 'No photos stored by SkinKey ✓' : `${images.length} image file(s) found in app storage`}
        </Text>
        {images && images.length > 0
          ? images.map((p) => (
              <Text key={p} style={[theme.type.caption, { color: theme.colors.textMuted }]} selectable>
                {p}
              </Text>
            ))
          : null}
        <Button label="Check again" variant="secondary" onPress={check} />
      </View>

      {present.length === 0 ? (
        <Body>No calls recorded on this phone yet. Run a scan, a try-on or a product check, then come back here.</Body>
      ) : (
        present.map((k) => <LedgerSection key={k} kind={k} ledger={ledgers[k]!.ledger} at={ledgers[k]!.at} />)
      )}

      <View style={{ gap: theme.space[2] }}>
        <Overline>Delete steps</Overline>
        <Body small>Uploaded → task created → running → finished → result read → delete requested → deleted.</Body>
        <Body small muted>
          If an upload never became a task: {COPY.orphanUpload}
        </Body>
        <Body small muted>
          If a delete call fails: {COPY.deleteFailed}
        </Body>
        <Body small muted>
          {COPY.privacyQualifier}
        </Body>
      </View>
      <Body muted small>
        {COPY.footer}
      </Body>
    </Screen>
  );
}
