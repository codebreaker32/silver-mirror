import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { Picks } from '@/features/home/Picks';
import { BandMeter } from '@/features/home/BandMeter';
import { spreadByCategory, type HomePick } from '@/features/home/usePicks';

const pick = (i: number, category: HomePick['category']): HomePick => ({
  productId: `p${i}`,
  brand: `Brand ${i}`,
  name: `Product ${i}`,
  category,
  query: `Brand ${i} Product ${i}`,
  a11y: `Brand ${i} Product ${i}. Fits your reading. Opens a check for this product.`,
});

describe('Home picks', () => {
  it('spreads picks across categories, keeping rank order inside each', () => {
    const items = [pick(1, 'sunscreen'), pick(2, 'sunscreen'), pick(3, 'serum'), pick(4, 'sunscreen'), pick(5, 'moisturiser')];
    expect(spreadByCategory(items, 4).map((p) => p.productId)).toEqual(['p1', 'p3', 'p5', 'p2']);
    expect(spreadByCategory(items, 10)).toHaveLength(5);
  });

  it('shows name and brand with a fit line, never the bare verdict word or a number, and opens the check by name', async () => {
    const onOpen = jest.fn();
    const onViewAll = jest.fn();
    await render(
      <ThemeProvider scheme="light">
        <Picks picks={[pick(1, 'serum'), pick(2, 'sunscreen')]} onOpen={onOpen} onViewAll={onViewAll} />
      </ThemeProvider>,
    );
    expect(screen.getByText('Chosen for you')).toBeTruthy();
    expect(screen.getAllByText('Fits your reading')).toHaveLength(2);
    expect(screen.getByText('Product 2')).toBeTruthy();
    expect(screen.getByText('Brand 2')).toBeTruthy();
    // Never the bare verdict word: QA waits for ^FITS$ (case-insensitive) after a share, so Home must never show it.
    expect(screen.queryByText(/^fits$/i)).toBeNull();
    expect(screen.queryByText(/%|₹|\d+\s*\/\s*\d+/)).toBeNull();
    await fireEvent.press(screen.getByTestId('home-pick-1'));
    expect(onOpen).toHaveBeenCalledWith('Brand 2 Product 2');
    await fireEvent.press(screen.getByTestId('home-picks-all'));
    expect(onViewAll).toHaveBeenCalled();
  });

  it('band meter shows the band word, never a figure', async () => {
    await render(
      <ThemeProvider scheme="light">
        <BandMeter label="Oiliness" level="Medium" />
      </ThemeProvider>,
    );
    expect(screen.getByText('Oiliness')).toBeTruthy();
    expect(screen.getByText('Medium')).toBeTruthy();
    expect(screen.queryByText(/\d/)).toBeNull();
  });
});
