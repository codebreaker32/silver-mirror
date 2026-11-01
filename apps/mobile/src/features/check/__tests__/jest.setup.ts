import { jest } from '@jest/globals';
jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
jest.mock('expo-haptics', () => ({
  performAndroidHapticsAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  AndroidHaptics: { Context_Click: 'context-click' },
}));
