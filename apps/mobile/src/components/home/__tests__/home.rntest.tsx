import { describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { COPY, DEMO_KEY, type KeyProfile } from '@skinkey/contracts';
import type { ColorScheme } from '@skinkey/design';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { PIN_TIP, ShareTeachingCard, sharePathFor } from '@/components/home/ShareTeachingCard';
import { KeyChip, keyChipText } from '@/features/home/KeyChip';
import { PasteLinkField } from '@/features/home/PasteLinkField';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));

const wrap = (ui: ReactNode, scheme: ColorScheme = 'light') => render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>);
const scanned: KeyProfile = { ...DEMO_KEY, source: 'youcam_hd', scanDate: '2026-11-02T10:00:00.000Z', photoDeleted: true };

describe('ShareTeachingCard', () => {
  it('shows the chrome-S art, one store path at a time and the pin tip', async () => {
    const onDismiss = jest.fn();
    await wrap(<ShareTeachingCard onDismiss={onDismiss} />, 'dark');
    expect(screen.getByLabelText(`Share menu with ${COPY.appName} highlighted`)).toBeTruthy();
    expect(screen.getByText(COPY.sharePaths[0])).toBeTruthy();
    expect(screen.getByText(PIN_TIP)).toBeTruthy();
    await fireEvent.press(screen.getByTestId('share-store-amazon'));
    expect(screen.getByTestId('amazon-coach-mark').props.children).toBe(COPY.amazonCoachMark);
    expect(screen.getByTestId('share-store-amazon').props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(screen.getByRole('button', { name: 'Got it' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('maps every store to its COPY.sharePaths line', () => {
    expect(sharePathFor('Flipkart')).toBe('Flipkart: Share → Silver Mirror');
    expect(sharePathFor('Amazon')).toBe(COPY.amazonCoachMark);
    expect(sharePathFor('Nykaa')).toBe('Nykaa: Share → Silver Mirror');
  });
});

describe('Home reading card', () => {
  it('uses the reading glossary', () => {
    expect(keyChipText(null, false).title).toBe('No reading yet');
    expect(keyChipText(DEMO_KEY, true).title).toBe('Demo reading');
    expect(keyChipText(scanned, false)).toEqual({ title: 'Your reading', sub: 'Scan 2 Nov · photo deleted' });
  });

  it('is one target with one label in visual order', async () => {
    const onPress = jest.fn();
    await wrap(<KeyChip keyProfile={scanned} isDemo={false} onPress={onPress} />);
    const card = screen.getByTestId('key-chip');
    expect(card.props.accessibilityLabel).toMatch(/^Your reading\. .*Scan 2 Nov · photo deleted\. Oiliness /);
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('empty: Start scan and Use the Demo reading', async () => {
    const onPress = jest.fn();
    const onUseDemo = jest.fn();
    await wrap(<KeyChip keyProfile={null} isDemo={false} onPress={onPress} onUseDemo={onUseDemo} />, 'dark');
    await fireEvent.press(screen.getByRole('button', { name: 'Start scan' }));
    await fireEvent.press(screen.getByRole('button', { name: COPY.reading.useDemo }));
    expect(onPress).toHaveBeenCalled();
    expect(onUseDemo).toHaveBeenCalled();
  });
});

describe('PasteLinkField', () => {
  it('submits the trimmed value from the inline Check pill and explains an empty submit', async () => {
    const onSubmit = jest.fn();
    await wrap(<PasteLinkField onSubmit={onSubmit} />);
    await fireEvent.press(screen.getByTestId('paste-submit'));
    expect(screen.getByText('Type a product name to check.')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByTestId('paste-input'), '  Minimalist SPF 50 ');
    await fireEvent.press(screen.getByTestId('paste-submit'));
    expect(onSubmit).toHaveBeenCalledWith('Minimalist SPF 50');
  });
});
