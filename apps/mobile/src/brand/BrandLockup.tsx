import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { SilverMark } from './SilverMark';
import { Wordmark } from './Wordmark';

interface BrandLockupProps {
  /** "header" = 36dp tile + 15dp-cap wordmark in a row (Home top bar). "welcome" = stacked, 96dp tile, 24dp cap. */
  variant: 'header' | 'welcome';
  /** Optional one-line tagline under the welcome lockup, in the light sans. */
  tagline?: string;
}

/** Mark + wordmark, spaced from component.brand. The mark is decorative; the wordmark carries the name. */
export function BrandLockup({ variant, tagline }: BrandLockupProps) {
  const theme = useTheme();
  const b = theme.components.brand;
  if (variant === 'header') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: b.gap }}>
        <SilverMark size={b.headerMark} />
        <Wordmark capHeight={b.wordmarkHeader} header />
      </View>
    );
  }
  return (
    <View style={{ alignItems: 'flex-start', gap: b.gap }}>
      <SilverMark size={b.welcomeMark} />
      <Wordmark capHeight={b.wordmarkWelcome} header />
      {tagline ? (
        <Text {...theme.textProps.bodySm} style={[b.tagline, { color: b.taglineColor }]}>
          {tagline}
        </Text>
      ) : null}
    </View>
  );
}
