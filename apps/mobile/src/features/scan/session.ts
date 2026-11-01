import type { ScanStatusResponse } from '@skinkey/contracts';
import type { Capture } from './runScan';

/** Memory-only scan hand-off between screens. Nothing here touches disk. */
let capture: Capture | null = null;
let overlay: string | null = null;

export const scanSession = {
  setCapture(c: Capture | null) {
    capture = c;
  },
  takeCapture(): Capture | null {
    const c = capture;
    capture = null;
    return c;
  },
  setResult(status: ScanStatusResponse) {
    overlay = status.overlayJpegBase64 ?? null;
  },
  peekOverlay: (): string | null => overlay,
  takeOverlay(): string | null {
    const o = overlay;
    overlay = null;
    return o;
  },
  clear() {
    capture = null;
    overlay = null;
  },
};
