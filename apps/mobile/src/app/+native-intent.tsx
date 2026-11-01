import { getShareExtensionKey } from 'expo-share-intent';

export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    return path.includes(`dataUrl=${getShareExtensionKey()}`) ? '/check' : path;
  } catch {
    return '/';
  }
}
