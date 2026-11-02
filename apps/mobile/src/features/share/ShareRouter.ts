import { useEffect } from 'react';
import { usePathname, useRootNavigationState, useRouter } from 'expo-router';
import { useShareIntentContext } from 'expo-share-intent';
import { postShare, shareRoute } from './inbox';
import { inputFromShareIntent } from './parse';

/**
 * Mounted once at the root. Every share intent — cold start, or warm start via onNewIntent while
 * the app is open or backgrounded — is parsed, posted to the inbox under a fresh id, cleared from
 * the native module, and routed to /check?share=<id>. The check screen resets for each new id.
 */
export function useShareRouter() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const router = useRouter();
  const pathname = usePathname();
  const navReady = !!useRootNavigationState()?.key;

  useEffect(() => {
    if (!hasShareIntent || !navReady) return;
    const input = inputFromShareIntent(shareIntent);
    resetShareIntent();
    if (!input) return;
    const route = shareRoute(pathname, postShare(input));
    if (route.kind === 'setParams') router.setParams({ share: route.share });
    else router.push({ pathname: '/check', params: { share: route.share } });
    // pathname is read at the moment the share lands; it must not re-trigger the effect.
  }, [hasShareIntent, shareIntent, navReady]); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Renders nothing; lets the root layout host the share listener inside the navigator tree. */
export function ShareRouter() {
  useShareRouter();
  return null;
}
