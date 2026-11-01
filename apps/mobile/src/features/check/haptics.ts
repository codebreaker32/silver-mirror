import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** CONTEXT_CLICK: shutter and every verdict landing, the same for each label. Never REJECT (components.md §1.5). */
export async function contextClick(): Promise<void> {
  try {
    if (Platform.OS === 'android') await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Context_Click);
    else await Haptics.selectionAsync();
  } catch {
    // Haptics are optional.
  }
}
