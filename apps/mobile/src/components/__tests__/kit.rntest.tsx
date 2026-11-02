import { describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import type { BottomTabBarProps } from 'expo-router/tabs';
import { darkTheme, lightTheme, type ColorScheme } from '@skinkey/design';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { AppBar, BandChip, Card, Chip, Ledger, PillButton, Segmented, SkinTypeCard, StepChecklist, TabBar, VerdictHead } from '@/components';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ useRouter: () => ({ push: mockPush, back: jest.fn(), replace: jest.fn(), canGoBack: () => true }) }));

const wrap = (ui: ReactNode, scheme: ColorScheme = 'light') => render(<ThemeProvider scheme={scheme}>{ui}</ThemeProvider>);
const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style as Record<string, unknown>) ?? {});

function tabProps(index: number) {
  const routes = [
    { key: 'index-k', name: 'index' },
    { key: 'reading-k', name: 'reading' },
  ];
  const emit = jest.fn((_event: unknown) => ({ defaultPrevented: false }));
  const navigateToTab = jest.fn();
  const descriptors = Object.fromEntries(routes.map((r) => [r.key, { options: {} }]));
  // Only the fields TabBar reads; the full navigator types are not needed here.
  const props = { state: { index, routes }, descriptors, emitter: { emit }, navigateToTab, insets: { top: 0, bottom: 24, left: 0, right: 0 } } as unknown as BottomTabBarProps;
  return { props, emit, navigateToTab };
}

describe('TabBar', () => {
  it('renders Check · Scan · Reading as tabs with the selected state on the focused route', async () => {
    const { props } = tabProps(0);
    await wrap(<TabBar {...props} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs.map((t) => t.props.accessibilityLabel)).toEqual(['Check, tab 1 of 3', 'Scan, tab 2 of 3', 'Reading, tab 3 of 3']);
    expect(tabs[0]!.props.accessibilityState).toEqual({ selected: true });
    expect(tabs[2]!.props.accessibilityState).toEqual({ selected: false });
    expect(screen.getByTestId('tab-bar').props.accessibilityRole).toBe('tablist');
  });

  it('switches tabs through the navigator and opens the scan flow from Scan', async () => {
    const { props, emit, navigateToTab } = tabProps(0);
    await wrap(<TabBar {...props} />);
    await fireEvent.press(screen.getByTestId('tab-reading'));
    expect(emit).toHaveBeenCalledWith({ type: 'tabPress', target: 'reading-k', canPreventDefault: true });
    expect(navigateToTab).toHaveBeenCalledWith('reading-k');
    await fireEvent.press(screen.getByTestId('tab-scan'));
    expect(mockPush).toHaveBeenCalledWith('/scan');
  });
});

describe('kit', () => {
  it('PillButton reads its destination with the label and reports disabled', async () => {
    const onPress = jest.fn();
    await wrap(<PillButton label="Search Nykaa" destination="Opens a Nykaa search" onPress={onPress} disabled />);
    const b = screen.getByRole('button');
    expect(b.props.accessibilityLabel).toBe('Search Nykaa. Opens a Nykaa search');
    expect(b.props.accessibilityState).toEqual({ disabled: true, busy: false });
  });

  it('UNKNOWN head is dashed and never uses the primary pill fill; medicine has no label', async () => {
    await wrap(<VerdictHead tone="unknown" line="We can't read this listing." />);
    const head = flat(screen.getByTestId('verdict-head').props.style);
    expect(head.borderStyle).toBe('dashed');
    expect(head.backgroundColor).not.toBe(lightTheme.colors.accent);
    expect(screen.getByText('UNKNOWN')).toBeTruthy();
    await screen.unmount();
    await wrap(<VerdictHead tone="medicine" line="This looks like a medicine." />);
    expect(screen.queryByText('MEDICINE')).toBeNull();
    expect(screen.getByTestId('verdict-head').props.accessibilityLabel).toBe('This looks like a medicine.');
  });

  it('follows the scheme: a raised card is graphite-850 in dark', async () => {
    await wrap(
      <Card testID="card">
        <Text>Body</Text>
      </Card>,
      'dark',
    );
    expect(flat(screen.getByTestId('card').props.style).backgroundColor).toBe(darkTheme.colors.surfaceRaised);
  });

  it('ledger rows are one node each with sentence-case keys', async () => {
    await wrap(<Ledger rows={[{ key: 'Reading', value: 'Your scan, 1 Nov' }, { key: 'Rules', value: 'Published rules' }]} />);
    expect(screen.getByLabelText('Reading: Your scan, 1 Nov.')).toBeTruthy();
    expect(screen.getByText('Where this comes from')).toBeTruthy();
  });

  it('band chip and checklist speak bands and step states, never numbers', async () => {
    await wrap(
      <>
        <BandChip name="Oiliness" level="High" />
        <StepChecklist announcement={null} steps={[{ id: 'upload', label: 'Uploaded', state: 'done' }, { id: 'delete', label: 'Deleting from YouCam', state: 'active' }]} />
        <Chip label="Fragrance-free" selected onPress={() => undefined} />
      </>,
    );
    expect(screen.getByLabelText('Oiliness reading: high.')).toBeTruthy();
    expect(screen.getByLabelText('Step 1 of 2: Uploaded, done.')).toBeTruthy();
    expect(screen.getByLabelText('Step 2 of 2: Deleting from YouCam, in progress.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Fragrance-free' }).props.accessibilityState).toEqual({ selected: true, disabled: false });
  });

  it('skin-type card is one target read in visual order; the empty card keeps its actions separate', async () => {
    const open = jest.fn();
    await wrap(
      <>
        <SkinTypeCard value="Combination" caption="Scan 1 Nov · photo deleted" onPress={open} />
        <SkinTypeCard value="Scan once, about a minute" label="No reading yet" icon="face-frame" quiet>
          <PillButton label="Start scan" onPress={() => undefined} />
        </SkinTypeCard>
      </>,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Your skin type, Combination, Scan 1 Nov · photo deleted' }));
    expect(open).toHaveBeenCalled();
    expect(screen.getByLabelText('No reading yet, Scan once, about a minute')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Start scan' })).toBeTruthy();
  });

  it('segmented marks the selected store with state and a tab role', async () => {
    const change = jest.fn();
    await wrap(<Segmented options={['Flipkart', 'Amazon', 'Nykaa'] as const} value="Amazon" onChange={change} accessibilityLabel="Store app" testID="store" />);
    expect(screen.getByTestId('store-amazon').props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(screen.getByTestId('store-nykaa'));
    expect(change).toHaveBeenCalledWith('Nykaa');
  });

  it('app bar keeps the Back label and centres the title', async () => {
    await wrap(<AppBar title="Before your scan" />);
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    expect(flat(screen.getByRole('header').props.style).textAlign).toBe('center');
  });
});
