import { useEffect, useRef, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { COPY, type YouCamErrorCode } from '@skinkey/contracts';
import { demo } from '@/demo';
import { call } from '@/lib/api';
import { useTheme } from '@/theme/ThemeProvider';
import { ResolvingFaceFrame } from '@/components/scan';
import { loadScanConsent, saveKey, saveScanLedger, useKey } from '../key';
import { PHOTO_DELETED_STAMP } from './deleteCopy';
import { hintForError, isRetakeError } from './captureHints';
import { cancelJob, ensureInstallToken } from './install';
import { friendlyError } from './errors';
import { recordLedger } from './ledgerStore';
import { deleteLocal, sleep, uploadToSlot } from './native';
import { runScan, type ScanDeps, type ScanProgress } from './runScan';
import { scanSession } from './session';
import { scanDisplaySteps, type DisplayStep } from './steps';
import { Body, Button, Heading, Screen, Stepper, haptic } from './ui';

const scanDeps: ScanDeps = {
  start: async (body) => {
    await ensureInstallToken();
    return call('scanStart', { body });
  },
  submit: (scanId) => call('scanSubmit', { body: { scanId } }),
  status: (id) => call('scanStatus', { params: { id } }),
  cancel: (id) => cancelJob('scan', id),
  upload: uploadToSlot,
  deleteLocal,
  sleep,
  now: () => Date.now(),
};

const DONE_HOLD_MS = 600;

export function ProcessingScreen() {
  const theme = useTheme();
  const router = useRouter();
  const started = useRef(false);
  const alive = useRef(true);
  const { width, height: winHeight } = useWindowDimensions();
  const { key, isDemo, useDemo: enableDemo } = useKey();
  const [progress, setProgress] = useState<ScanProgress>(
    () => demo?.scanProgress ?? { phase: 'uploading', steps: scanDisplaySteps(undefined, 'pending') },
  );
  const deletedAt = useRef<Date | null>(null);
  if (!deletedAt.current && progress.steps.some((s) => s.id === 'delete' && s.state === 'done')) deletedAt.current = new Date();

  useEffect(() => {
    alive.current = true;
    if (started.current) return;
    started.current = true;
    // Web `?demo=` only: hold a mid-scan state for screenshots; no capture, no Worker call.
    if (demo) return;
    const capture = scanSession.takeCapture();
    void (async () => {
      const consent = await loadScanConsent();
      if (!capture || !consent) {
        if (capture) deleteLocal(capture.uri);
        router.replace('/scan');
        return;
      }
      const result = await runScan(scanDeps, capture, consent, (p) => alive.current && setProgress(p));
      if (result.status) recordLedger('scan', result.status.ledger);
      if (result.phase !== 'done' || !result.status.key) {
        haptic('reject');
        return;
      }
      await saveKey(result.status.key);
      await saveScanLedger(result.status.ledger);
      scanSession.setResult(result.status);
      haptic('confirm');
      await sleep(DONE_HOLD_MS);
      if (alive.current) router.replace('/scan/result');
    })();
    return () => {
      alive.current = false;
    };
  }, [router]);

  const failed = progress.phase === 'failed';
  const youcamCode: YouCamErrorCode | undefined = failed ? progress.status?.error?.code : undefined;
  const retake = youcamCode !== undefined && isRetakeError(youcamCode);
  const friendly = failed && !retake ? friendlyError(progress.error, 'scan') : null;
  const doneCount = progress.steps.filter((s) => s.state === 'done').length;
  const steps = withDeleteStamp(progress.steps, deletedAt.current);
  // Showcase 03_analyze: the frame runs the full content width, close to square, so the checklist and the line under
  // it still sit above the fold on a 6.1" phone. The FaceFrame (aspect 0.8) sits centred on its own sheen plate.
  const plateW = Math.max(0, width - theme.spacing.gutter * 2);
  const plateH = Math.round(Math.min(plateW / theme.components.faceFrame.aspect, Math.max(240, winHeight * 0.5)));
  const frameW = Math.round((plateH - theme.space[2] * 2) * theme.components.faceFrame.aspect);

  return (
    <Screen
      title={failed ? undefined : COPY.reading.making}
      onBack={() => router.replace('/')}
      footer={
        failed ? (
          <>
            {retake ? (
              <Button label="Retake photo" onPress={() => router.replace({ pathname: '/scan/capture', params: { hint: youcamCode } })} />
            ) : friendly?.retryable ? (
              <Button label="Try again" onPress={() => router.replace('/scan/capture')} />
            ) : null}
            {!key || isDemo ? (
              <Button
                label={COPY.reading.useDemo}
                variant="secondary"
                onPress={() => {
                  enableDemo();
                  router.replace('/');
                }}
              />
            ) : null}
            <Button label="Try later" variant="tertiary" fullWidth onPress={() => router.replace('/')} />
          </>
        ) : undefined
      }
    >
      <View
        style={{
          height: plateH,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.surface,
          borderWidth: theme.dark ? 1 : 0,
          borderColor: theme.colors.border,
          borderTopColor: theme.dark ? theme.colors.sheenEdge : theme.colors.border,
        }}
      >
        <ResolvingFaceFrame tile={false} width={frameW} progress={failed ? 0 : doneCount / progress.steps.length} />
      </View>
      {failed ? (
        <View style={{ gap: theme.space[2] }}>
          <Heading>{retake ? 'Let’s take that again' : friendly?.title}</Heading>
          <Body>{retake ? hintForError(youcamCode) : friendly?.body}</Body>
        </View>
      ) : null}
      <View style={{ gap: theme.space[4] }}>
        <Stepper steps={steps} />
        <Body muted small>
          {failed ? COPY.privacyLine : 'Stay on this screen. This takes about 10 seconds.'}
        </Body>
      </View>
    </Screen>
  );
}

const pad = (n: number) => String(n).padStart(2, '0');

/** "Photo deleted · 21:04" on the delete row once YouCam confirms the delete. */
function withDeleteStamp(steps: readonly DisplayStep[], at: Date | null): DisplayStep[] {
  return steps.map((s) =>
    s.id === 'delete' && s.state === 'done' && s.label === COPY.scanStepsDone.delete && at
      ? { ...s, stamp: `${PHOTO_DELETED_STAMP} · ${pad(at.getHours())}:${pad(at.getMinutes())}` }
      : s,
  );
}
