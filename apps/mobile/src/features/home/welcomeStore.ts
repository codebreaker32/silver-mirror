import * as SecureStore from 'expo-secure-store';

const KEY = 'skinkey.welcomeSeen';

// Kept in memory as well, so a platform without SecureStore (web) cannot loop between Home and the welcome.
let seenThisRun = false;

/** True once the first-run welcome has been passed (DESIGN.md §9.1). Same KV as the share tip (tipStore). */
export async function welcomeSeen(): Promise<boolean> {
  if (seenThisRun) return true;
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function markWelcomeSeen(): Promise<void> {
  seenThisRun = true;
  try {
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // Remembered for this run only; at worst the welcome shows again next launch.
  }
}

/** Synchronous: true once the welcome was passed in this run (guards a gate that outlived the welcome). */
export function welcomeSeenThisRun(): boolean {
  return seenThisRun;
}
