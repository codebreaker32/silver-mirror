import { parseShareText, type CheckInput } from './parse';

/** Labelled sample listing for "Try a sample share". Shaped like a Flipkart share (text + URL). */
export const SAMPLE_SHARE_TEXT =
  'Garnier Super UV Invisible Serum Sunscreen SPF 50+ PA++++ 30ml https://www.flipkart.com/garnier-super-uv-invisible-serum-sunscreen/p/skinkey-sample';

export const SAMPLE_LABEL = 'Sample share';

export function sampleInput(): CheckInput {
  return { kind: 'text', source: 'sample', parsed: parseShareText(SAMPLE_SHARE_TEXT) };
}
