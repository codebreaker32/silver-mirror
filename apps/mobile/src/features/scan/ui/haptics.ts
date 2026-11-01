import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type Moment = 'contextClick' | 'confirm' | 'toggleOn' | 'toggleOff' | 'reject';

const ANDROID: Record<Moment, Haptics.AndroidHaptics> = {
  contextClick: Haptics.AndroidHaptics.Context_Click,
  confirm: Haptics.AndroidHaptics.Confirm,
  toggleOn: Haptics.AndroidHaptics.Toggle_On,
  toggleOff: Haptics.AndroidHaptics.Toggle_Off,
  reject: Haptics.AndroidHaptics.Reject,
};

export function haptic(moment: Moment): void {
  const run = Platform.OS === 'android' ? Haptics.performAndroidHapticsAsync(ANDROID[moment]) : Haptics.selectionAsync();
  run.catch(() => {});
}
