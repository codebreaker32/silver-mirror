import { describe, expect, it, jest } from '@jest/globals';
import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { COPY } from '@skinkey/contracts';
import { lightTheme } from '@skinkey/design';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { chipsFromOcr } from '../chips';
import { InciChipEditor } from '../components/InciChipEditor';
import { SkuConfirmSheet } from '../components/SkuConfirmSheet';
import { UnknownPanel } from '../components/UnknownPanel';
import { VerdictSheet } from '../components/VerdictSheet';
import { CAUTION_VERDICT, FITS_VERDICT, MEDICINE_VERDICT, PRODUCT, SCANNED_KEY, UNKNOWN_VERDICT, resolveResponse } from '../fixtures';
import { presentVerdict } from '../present';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const wrap = (ui: ReactNode) => render(<ThemeProvider>{ui}</ThemeProvider>);

const ctx = { key: SCANNED_KEY, product: PRODUCT, catalogCount: 42 };
const flat = (style: unknown): Record<string, unknown> =>
  Array.isArray(style) ? Object.assign({}, ...style.map(flat)) : ((style as Record<string, unknown>) ?? {});

describe('VerdictSheet', () => {
  it('CAUTION: reasons as rows without numerals, sentence-case ledger, How link and matches', async () => {
    const onHowMade = jest.fn();
    await wrap(<VerdictSheet view={presentVerdict(CAUTION_VERDICT, ctx)} onHowMade={onHowMade} matches={<Text>MATCHES</Text>} />);

    const head = screen.getByTestId('verdict-head');
    expect(head.props.accessibilityLabel).toBe(`Caution. ${COPY.subtitle.CAUTION}`);
    expect(within(head).getByText('CAUTION')).toBeTruthy();
    expect(within(head).getByText(COPY.subtitle.CAUTION)).toBeTruthy();

    expect(screen.getByText('Why · 3 reasons')).toBeTruthy();
    const first = screen.getByTestId('reason-01');
    expect(within(first).queryByText('01')).toBeNull();
    expect(within(first).getByText("Listing says 'fragrance-free'.")).toBeTruthy();
    expect(within(first).getByText('Its ingredient list has Parfum (rule LC-\u20601a).')).toBeTruthy();
    expect(within(screen.getByTestId('reason-02')).getByText('Oiliness reading: High (whole face, scan 1 Nov).')).toBeTruthy();

    // The ledger rows carry the provenance; no repeated summary caption above them.
    expect(screen.queryByTestId('provenance-line')).toBeNull();
    expect(screen.getByText('Where this comes from')).toBeTruthy();
    for (const key of ['Reading', 'Product', 'Rules', 'Limits']) expect(screen.getByText(key)).toBeTruthy();
    expect(screen.getByText(COPY.accuracyNote)).toBeTruthy();
    expect(screen.getByText(COPY.footer)).toBeTruthy();
    expect(screen.getByText(COPY.notAffiliated)).toBeTruthy();

    await fireEvent.press(screen.getByTestId('how-made-link'));
    expect(onHowMade).toHaveBeenCalled();
    expect(screen.getByText('MATCHES')).toBeTruthy();
  });

  it('keeps the verdict tint inside the head (a glass card; the tint lives in its icon disc)', async () => {
    await wrap(<VerdictSheet view={presentVerdict(CAUTION_VERDICT, ctx)} />);
    const tint = lightTheme.colors.verdict.caution.bg;
    const head = flat(screen.getByTestId('verdict-head').props.style);
    // Palette 2.2: the head is a glass card with the white hairline.
    expect(head.backgroundColor).toBe(lightTheme.colors.glass);
    expect(head.borderColor).toBe(lightTheme.colors.glassEdge);
    expect(flat(screen.getByTestId('verdict-head-disc').props.style).backgroundColor).toBe(tint);
    expect(flat(screen.getByTestId('reason-01').props.style).backgroundColor).not.toBe(tint);
    expect(flat(screen.getByTestId('verdict-caution').props.style).backgroundColor).toBeUndefined();
  });

  it('FITS with no flags uses the fixed strings', async () => {
    await wrap(<VerdictSheet view={presentVerdict(FITS_VERDICT, ctx)} />);
    expect(screen.getByText('FITS')).toBeTruthy();
    expect(screen.getByText(COPY.subtitle.FITS)).toBeTruthy();
    expect(screen.getByText(COPY.fitsNoFlags)).toBeTruthy();
  });

  it('UNKNOWN is designed: catalogue count and Snap the ingredient list', async () => {
    const onSnap = jest.fn();
    await wrap(
      <VerdictSheet
        view={presentVerdict(UNKNOWN_VERDICT, { key: SCANNED_KEY, product: null, catalogCount: 42 })}
        unknown={<UnknownPanel catalogCount={42} label={{ step: 'none' }} onSnap={onSnap} onChips={jest.fn()} onRun={jest.fn()} />}
      />,
    );
    expect(screen.getByText(COPY.subtitle.UNKNOWN)).toBeTruthy();
    expect(screen.getByTestId('catalog-count').props.children).toBe(COPY.catalogCount(42));
    expect(screen.queryByText(/^Why ·/)).toBeNull();
    await fireEvent.press(screen.getByTestId('snap-label'));
    expect(onSnap).toHaveBeenCalled();
  });

  it('MEDICINE: one fixed line, nothing else', async () => {
    await wrap(<VerdictSheet view={presentVerdict(MEDICINE_VERDICT, ctx)} onHowMade={jest.fn()} matches={<Text>MATCHES</Text>} />);
    // Shown as a serif first sentence plus the rest as body, word for word; TalkBack hears the whole fixed string once.
    const line = COPY.medicine('adapalene');
    const cut = line.indexOf('. ');
    expect(screen.getByText(line.slice(0, cut + 1))).toBeTruthy();
    expect(screen.getByText(line.slice(cut + 2))).toBeTruthy();
    expect(screen.getByTestId('verdict-head').props.accessibilityLabel).toBe(line);
    expect(screen.queryByText('MEDICINE')).toBeNull();
    expect(screen.queryByTestId('reasons')).toBeNull();
    expect(screen.queryByText('Where this comes from')).toBeNull();
    expect(screen.queryByTestId('how-made-link')).toBeNull();
    expect(screen.queryByText('MATCHES')).toBeNull();
  });
});

describe('UNKNOWN panel', () => {
  it('UNKNOWN snap button drops the trailing full stop of the fixed string', async () => {
    await wrap(<UnknownPanel catalogCount={42} label={{ step: 'none' }} onSnap={jest.fn()} onChips={jest.fn()} onRun={jest.fn()} />);
    expect(screen.getByTestId('snap-label').props.accessibilityLabel).toBe(COPY.snapLabel.replace(/\.$/, ''));
  });
});

describe('label chips', () => {
  it('outlines uncertain tokens and runs only on confirm', async () => {
    const chips = chipsFromOcr([
      { raw: 'AQUA', cosingName: 'Aqua', confidence: 0.99, uncertain: false },
      { raw: 'Isopropy1', cosingName: null, confidence: 0.3, uncertain: true },
    ]);
    const onRun = jest.fn();
    await wrap(<InciChipEditor chips={chips} unreadable={1} onChange={jest.fn()} onRun={onRun} onRetake={jest.fn()} />);
    expect(screen.getByTestId('chip-1').props.accessibilityLabel).toBe('2. Isopropy1, uncertain. Edit');
    expect(flat(screen.getByTestId('chip-1').props.style).borderStyle).toBe('dashed');
    expect(onRun).not.toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('chip-run'));
    expect(onRun).toHaveBeenCalledWith(chips);
  });
});

describe('SKU confirmation', () => {
  it('shows the candidate card with Yes / Not this', async () => {
    const onConfirm = jest.fn();
    const onNotThis = jest.fn();
    const { candidates } = resolveResponse();
    await wrap(<SkuConfirmSheet visible mode="single" candidates={candidates} onConfirm={onConfirm} onNotThis={onNotThis} onClose={jest.fn()} />);
    expect(screen.getByText('Garnier · Super UV Invisible Serum Sunscreen')).toBeTruthy();
    expect(screen.getByText('30 ml')).toBeTruthy();
    expect(screen.getByTestId('sku-yes').props.accessibilityLabel).toBe('Yes, this is Garnier · Super UV Invisible Serum Sunscreen · 30 ml');
    await fireEvent.press(screen.getByTestId('sku-not-this'));
    expect(onNotThis).toHaveBeenCalled();
    await fireEvent.press(screen.getByTestId('sku-yes'));
    expect(onConfirm).toHaveBeenCalledWith(candidates[0]);
  });
});
