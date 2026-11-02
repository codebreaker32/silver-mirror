import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { COPY } from '@skinkey/contracts';
import { ThemeProvider } from '@/theme/ThemeProvider';
import WelcomeScreen from '@/features/home/WelcomeScreen';
import { welcomeSeen } from '@/features/home/welcomeStore';

const mockReplace = jest.fn();
const mockEnableDemo = jest.fn();
const mockStore = new Map<string, string>();

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: mockReplace, canGoBack: () => false }) }));
jest.mock('@/features/key', () => ({ useKey: () => ({ key: null, isDemo: false, loading: false, useDemo: mockEnableDemo, refresh: jest.fn() }) }));
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  setItemAsync: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
}));

describe('WelcomeScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockEnableDemo.mockClear();
  });

  it('reads wordmark, tagline, then the two actions; Get started marks the welcome seen and goes Home', async () => {
    await render(
      <ThemeProvider scheme="light">
        <WelcomeScreen />
      </ThemeProvider>,
    );
    expect(screen.getByLabelText(COPY.appName)).toBeTruthy();
    expect(screen.getByText(COPY.welcome.tagline)).toBeTruthy();
    expect(screen.getByRole('button', { name: COPY.reading.useDemo })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: /^Get started/ }));
    expect(mockReplace).toHaveBeenCalledWith('/');
    expect(mockEnableDemo).not.toHaveBeenCalled();
    expect(await welcomeSeen()).toBe(true);
  });

  it('Use the Demo reading turns on the Demo reading, then goes Home', async () => {
    await render(
      <ThemeProvider scheme="dark">
        <WelcomeScreen />
      </ThemeProvider>,
    );
    await fireEvent.press(screen.getByRole('button', { name: COPY.reading.useDemo }));
    expect(mockEnableDemo).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
