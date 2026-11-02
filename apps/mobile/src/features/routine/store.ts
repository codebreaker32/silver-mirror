import * as SecureStore from 'expo-secure-store';
import { parseChoices, type RoutineChoices } from './model';

/** Chosen product ids per routine step. Product ids only: no reading, no photo. Same on-phone store as the reading. */
const KEY = 'skinkey.routine.v1';

export async function loadChoices(): Promise<RoutineChoices> {
  try {
    return parseChoices(await SecureStore.getItemAsync(KEY));
  } catch {
    return parseChoices(null);
  }
}

export async function saveChoices(choices: RoutineChoices): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY, JSON.stringify(choices));
  } catch {
    // The swap still shows for this session; the next launch falls back to the first fitting product.
  }
}
