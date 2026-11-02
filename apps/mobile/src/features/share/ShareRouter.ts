import { useEffect, useRef } from 'react';
import { useShareIntentContext } from 'expo-share-intent';
import { inputFromShareIntent, type CheckInput } from './parse';

/** Hands each incoming share to `onInput` once, then clears it so a back-and-forth doesn't re-run it. */
export function useIncomingShare(onInput: (input: CheckInput) => void) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const handler = useRef(onInput);
  handler.current = onInput;

  useEffect(() => {
    if (!hasShareIntent) return;
    const input = inputFromShareIntent(shareIntent);
    resetShareIntent();
    if (input) handler.current(input);
  }, [hasShareIntent, shareIntent, resetShareIntent]);

  return hasShareIntent;
}
