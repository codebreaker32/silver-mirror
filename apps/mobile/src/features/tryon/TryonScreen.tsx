import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COPY, TryonMode, type ConsentRecord } from '@skinkey/contracts';
import { demo } from '@/demo';
import { call } from '@/lib/api';
import { hintForError, isRetakeError } from '../scan/captureHints';
import { CaptureGuide, type CapturedPhoto } from '../scan/CaptureGuide';
import { makeConsent, TRYON_CONSENT_VERSION } from '../scan/consent';
import { friendlyError } from '../scan/errors';
import { cancelJob, ensureInstallToken } from '../scan/install';
import { recordLedger } from '../scan/ledgerStore';
import { deleteLocal, sleep, uploadToSlot } from '../scan/native';
import { tryonDisplaySteps } from '../scan/steps';
import { Body, Button, EmptyState, Heading, Screen, haptic } from '@/components';
import { useTheme } from '@/theme/ThemeProvider';
import { Stepper } from '../scan/ui';
import { prepareSelfie } from './prepareSelfie';
import { runTryon, type TryonDeps, type TryonProgress } from './runTryon';
import { TryonConsent } from './TryonConsent';
import { TryonResult } from './TryonResult';

const tryonDeps: TryonDeps = {
  start: async (body) => {
    await ensureInstallToken();
    return call('tryonStart', { body });
  },
  submit: (id) => call('tryonSubmit', { params: { id } }),
  status: (id) => call('tryonStatus', { params: { id } }),
  cancel: (id) => cancelJob('tryon', id),
  upload: uploadToSlot,
  deleteLocal,
  sleep,
  now: () => Date.now(),
};

type Phase = { name: 'consent' } | { name: 'capture'; hint: string | null } | { name: 'running'; progress: TryonProgress };

export function TryonScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ productId?: string; mode?: string; shadeName?: string; productName?: string; productSize?: string }>();
  // Pack size on its own meta line (DESIGN.md §9.3), never inline in the heading where " ·" can dangle at a wrap.
  const productSize = params.productSize?.trim() || null;
  const mode = TryonMode.catch('multi').parse(params.mode);
  const [phase, setPhase] = useState<Phase>({ name: 'consent' });
  const consent = useRef<ConsentRecord | null>(null);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      consent.current = null;
    };
  }, []);

  const close = () => {
    setPhase({ name: 'consent' });
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  if (!params.productId) {
    return (
      <Screen title="Try-on" onBack={close}>
        <EmptyState title="Pick a tinted product first" body="Try-on starts from a product check." plate={{ icon: 'tag-check' }}>
          <Button label="Back" variant="secondary" onPress={close} />
        </EmptyState>
      </Screen>
    );
  }
  const productId = params.productId;

  const onCaptured = async (photo: CapturedPhoto) => {
    const record = consent.current;
    if (!record) {
      deleteLocal(photo.uri);
      setPhase({ name: 'consent' });
      return;
    }
    setPhase({ name: 'running', progress: { phase: 'uploading', steps: tryonDisplaySteps(undefined, 'active', mode) } });
    let selfie: { uri: string; fileSize: number };
    try {
      selfie = await prepareSelfie(photo);
    } catch (error) {
      setPhase({ name: 'running', progress: { phase: 'failed', steps: tryonDisplaySteps(undefined, 'failed', mode), error } });
      return;
    }
    const result = await runTryon(
      tryonDeps,
      { productId, mode, ...(params.shadeName ? { shadeName: params.shadeName } : {}), selfie, consent: record },
      (progress) => alive.current && setPhase({ name: 'running', progress }),
    );
    if (result.status) recordLedger('tryon', { ...result.status.ledger });
    haptic(result.phase === 'done' ? 'confirm' : 'reject');
  };

  if (phase.name === 'consent') {
    return (
      <TryonConsent
        productName={params.productName ? [params.productName, productSize].filter(Boolean).join(' · ') : undefined}
        mode={mode}
        onDecline={close}
        onAccept={() => {
          consent.current = makeConsent(TRYON_CONSENT_VERSION, true);
          if (demo) {
            // Web `?demo=` only: skip the camera and show labelled placeholder renders; no upload, no Worker call.
            const status = demo.tryon(productId, mode, params.shadeName);
            setPhase({ name: 'running', progress: { phase: 'done', status, steps: tryonDisplaySteps(status.steps, 'done', mode, status.deleteState) } });
            return;
          }
          setPhase({ name: 'capture', hint: null });
        }}
      />
    );
  }

  if (phase.name === 'capture') {
    return <CaptureGuide variant="tryon" hint={phase.hint} onCaptured={(p) => void onCaptured(p)} onCancel={close} />;
  }

  const { progress } = phase;
  const failed = progress.phase === 'failed';
  const code = failed ? progress.status?.error?.code : undefined;
  const retake = code !== undefined && isRetakeError(code);
  const friendly = failed && !retake ? friendlyError(progress.error, 'tryon') : null;

  if (progress.phase === 'done') {
    return (
      <Screen title="Try-on" onBack={close} footer={<Button label="Close" onPress={close} />}>
        <View style={{ gap: theme.space[2] }}>
          <Heading>Your preview</Heading>
          {params.productName ? (
            <Body muted numberOfLines={2}>
              {[params.productName, productSize].filter(Boolean).join(' · ')}
            </Body>
          ) : null}
        </View>
        <TryonResult status={progress.status} steps={progress.steps} />
        <Button label="How this was made" variant="tertiary" trailingIcon="chevron-right" onPress={() => router.push('/how')} />
        <Body muted small>
          {COPY.footer}
        </Body>
      </Screen>
    );
  }

  return (
    <Screen
      title="Try-on"
      onBack={close}
      footer={
        failed ? (
          <>
            {retake || friendly?.retryable ? (
              <Button label="Retake photo" onPress={() => setPhase({ name: 'capture', hint: retake ? hintForError(code) : null })} />
            ) : null}
            <Button label="Not now" variant="tertiary" onPress={close} />
          </>
        ) : undefined
      }
    >
      <Heading>{failed ? (retake ? 'Let’s take that again' : friendly?.title) : 'Making your preview'}</Heading>
      {failed ? <Body>{retake ? hintForError(code) : friendly?.body}</Body> : <Body muted>Real steps from YouCam. Your photo was resized on this phone and deleted after upload.</Body>}
      <Stepper steps={progress.steps} />
      <Body muted small>
        {COPY.privacyLine}
      </Body>
    </Screen>
  );
}
