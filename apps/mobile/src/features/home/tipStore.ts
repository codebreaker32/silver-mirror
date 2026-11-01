import * as SecureStore from 'expo-secure-store';

const KEY = 'skinkey.shareTipDismissed';

export async function shareTipDismissed(): Promise<boolean> {
  try {
    return (await SecureStore.getItemAsync(KEY)) === '1';
  } catch {
    return false;
  }
}

export async function dismissShareTip(): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, '1');
  } catch {
    // Shown again next launch; nothing else depends on it.
  }
}
