import { parseShareText, type CheckInput } from './parse';

/**
 * Labelled sample listing for "Try a sample share". Shaped like a Flipkart share (text + URL). It names a catalogued
 * product, so the first demo moment is a verdict with reasons rather than UNKNOWN. The URL is never opened: the sample
 * dock goes back to Home.
 */
export const SAMPLE_SHARE_TEXT =
  'Minimalist Niacinamide 10% Face Serum 30ml https://www.flipkart.com/minimalist-niacinamide-10-face-serum/p/silver-mirror-sample';

export const SAMPLE_LABEL = 'Sample share';

export function sampleInput(): CheckInput {
  return { kind: 'text', source: 'sample', parsed: parseShareText(SAMPLE_SHARE_TEXT) };
}
