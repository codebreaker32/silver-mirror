import type { TextStyle } from 'react-native';
import { fonts } from '@skinkey/design';

/**
 * Home type scale (Silver & graphite): five sizes with clear steps, Geist for all UI, the serif display face only for
 * the greeting. Normal tracking throughout; no caps labels. Colour is set by the caller (ink for running text, muted
 * only for secondary lines).
 */
export const homeType = {
  greeting: { fontFamily: fonts.serifDisplay, fontSize: 34, lineHeight: 42, letterSpacing: -0.3, includeFontPadding: false },
  section: { fontFamily: fonts.serifDisplay, fontSize: 22, lineHeight: 28, letterSpacing: -0.2, includeFontPadding: false },
  wordmark: { fontFamily: fonts.serifDisplay, fontSize: 20, lineHeight: 26, letterSpacing: -0.1, includeFontPadding: false },
  value: { fontFamily: fonts.sansSemibold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, includeFontPadding: false },
  title: { fontFamily: fonts.sansSemibold, fontSize: 17, lineHeight: 22, letterSpacing: 0, includeFontPadding: false },
  body: { fontFamily: fonts.sansRegular, fontSize: 15, lineHeight: 22, letterSpacing: 0, includeFontPadding: false },
  bodyStrong: { fontFamily: fonts.sansMedium, fontSize: 15, lineHeight: 20, letterSpacing: 0, includeFontPadding: false },
  small: { fontFamily: fonts.sansRegular, fontSize: 13, lineHeight: 18, letterSpacing: 0, includeFontPadding: false },
  smallStrong: { fontFamily: fonts.sansSemibold, fontSize: 13, lineHeight: 18, letterSpacing: 0, includeFontPadding: false },
} as const satisfies Record<string, TextStyle>;
