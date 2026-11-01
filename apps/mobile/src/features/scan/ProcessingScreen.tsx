import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { COPY, type YouCamErrorCode } from '@skinkey/contracts';
import { call } from '@/lib/api';
import { useTheme } from '@/theme/ThemeProvider';
import { loadScanConsent, saveKey, saveScanLedger } from '../key';
import { hintForError, isRetakeError } from './captureHints';
import { cancelJob, ensureInstallToken } from './install';
import { friendlyError } from './errors';
import { recordLedger } from './ledgerStore';
import { deleteLocal, sleep, uploadToSlot } from './native';
import { runScan, type ScanDeps, type ScanProgress } from './runScan';
import { scanSession } from './session';
import { scanDisplaySteps } from './steps';
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
  const [progress, setProgress] = useState<ScanProgress>({ phase: 'uploading', steps: scanDisplaySteps(undefined, 'pending') });

  useEffect(() => {
    alive.current = true;
    if (started.current) return;
    started.current = true;
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

  return (
    <Screen
      title="Skin scan"
      onBack={() => router.replace('/')}
      footer={
        failed ? (
          <>
            {retake ? (
              <Button label="Retake photo" onPress={() => router.replace({ pathname: '/scan/capture', params: { hint: youcamCode } })} />
            ) : friendly?.retryable ? (
              <Button label="Try again" onPress={() => router.replace('/scan/capture')} />
            ) : null}
            <Button label="Try later" variant="tertiary" onPress={() => router.replace('/')} />
          </>
        ) : undefined
      }
    >
      <Heading>{failed ? (retake ? 'Let’s take that again' : friendly?.title) : 'Making your Key'}</Heading>
      {failed ? (
        <Body>{retake ? hintForError(youcamCode) : friendly?.body}</Body>
      ) : (
        <Body muted>Real steps from YouCam. Your photo is deleted from this phone as soon as it is uploaded.</Body>
      )}
      <View style={{ paddingTop: theme.space[2] }}>
        <Stepper steps={progress.steps} />
      </View>
      <Body muted small>
        {COPY.privacyLine}
      </Body>
    </Screen>
  );
}
