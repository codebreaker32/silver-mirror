import { describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { COPY, DEMO_KEY, type KeyProfile } from '@skinkey/contracts';
import type { ColorScheme } from '@skinkey/design';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { ShareSteps, sharePathFor } from '@/components/home/ShareSteps';
import { KeyChip, keyChipText } from '@/features/home/KeyChip';
import { PasteLinkField } from '@/features/home/PasteLinkField';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));

const wrap = (ui: ReactNode, scheme: ColorScheme = 'light') => render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>);
const scanned: KeyProfile = { ...DEMO_KEY, source: 'youcam_hd', scanDate: '2026-11-02T10:00:00.000Z', photoDeleted: true };

describe('ShareSteps', () => {
  it('shows three thumb-tile steps for one store at a time, with the store path as the summary', async () => {
    const onDismiss = jest.fn();
    await wrap(<ShareSteps onDismiss={onDismiss} testID="share-tip" dismissTestID="share-tip-dismiss" />, 'dark');
    expect(screen.getByText('Share from a store app')).toBeTruthy();
    for (const step of COPY.shareSteps('Flipkart')) expect(screen.getByText(step.title)).toBeTruthy();
    expect(screen.getByText('On the product page in Flipkart')).toBeTruthy();
    expect(screen.getByTestId('share-paths').props.accessibilityLabel).toMatch(/^Flipkart: Share → Silver Mirror\. Tap Share: /);
    await fireEvent.press(screen.getByTestId('share-store-amazon'));
    expect(screen.getByTestId('share-store-amazon').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByText('Tap More first, then Silver Mirror')).toBeTruthy();
    expect(screen.getByTestId('amazon-coach-mark')).toBeTruthy();
    expect(screen.getByTestId('share-paths').props.accessibilityLabel).toMatch(new RegExp(`^${COPY.amazonCoachMark}`));
    await fireEvent.press(screen.getByTestId('share-tip-dismiss'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('maps every store to its COPY.sharePaths line', () => {
    expect(sharePathFor('Flipkart')).toBe('Flipkart: Share → Silver Mirror');
    expect(sharePathFor('Amazon')).toBe(COPY.amazonCoachMark);
    expect(sharePathFor('Nykaa')).toBe('Nykaa: Share → Silver Mirror');
  });
});

describe('Home skin-type card', () => {
  it('uses the reading glossary', () => {
    expect(keyChipText(null, false).title).toBe('No reading yet');
    expect(keyChipText(null, false).value).toBe('Scan once, about a minute');
    expect(keyChipText(DEMO_KEY, true).sub).toBe('Demo reading · sample, not a scan');
    expect(keyChipText(scanned, false)).toMatchObject({ title: 'Your skin type', sub: 'Scan 2 Nov · photo deleted' });
    expect(keyChipText(scanned, false).value.length).toBeGreaterThan(0);
  });

  it('is one target with one label in visual order', async () => {
    const onPress = jest.fn();
    await wrap(<KeyChip keyProfile={scanned} isDemo={false} onPress={onPress} />);
    const card = screen.getByTestId('key-chip');
    expect(card.props.accessibilityLabel).toMatch(
      /^Your skin type, \w+\. Scan 2 Nov · photo deleted\. Oiliness (Low|Medium|High), Moisture (Low|Medium|High), Pores (Low|Medium|High)\. Open your reading$/,
    );
    // Three band rows, each with its band word, never a figure.
    for (const id of ['band-oiliness', 'band-moisture', 'band-pores']) expect(screen.getByTestId(id, { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText(/\d+\s*%/)).toBeNull();
    await fireEvent.press(card);
    expect(onPress).toHaveBeenCalled();
  });

  it('empty: Start scan and Use the Demo reading', async () => {
    const onPress = jest.fn();
    const onUseDemo = jest.fn();
    await wrap(<KeyChip keyProfile={null} isDemo={false} onPress={onPress} onUseDemo={onUseDemo} />, 'dark');
    expect(screen.getByText('No reading yet')).toBeTruthy();
    expect(screen.getByText('Scan once, about a minute')).toBeTruthy();
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
