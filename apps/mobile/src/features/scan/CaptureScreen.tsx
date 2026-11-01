import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { loadScanConsent } from '../key';
import { hintForError } from './captureHints';
import { CaptureGuide, type CapturedPhoto } from './CaptureGuide';
import { prepareScanCapture } from './native';
import { scanSession } from './session';

export function CaptureScreen() {
  const router = useRouter();
  const { hint } = useLocalSearchParams<{ hint?: string }>();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    void loadScanConsent().then((c) => {
      if (!c) router.replace('/scan');
      else setChecked(true);
    });
  }, [router]);

  const onCaptured = async (photo: CapturedPhoto) => {
    scanSession.setCapture(await prepareScanCapture(photo));
    router.replace('/scan/processing');
  };

  if (!checked) return null;
  return <CaptureGuide variant="scan" hint={hintForError(hint)} onCaptured={(p) => void onCaptured(p)} onCancel={() => router.back()} />;
}
