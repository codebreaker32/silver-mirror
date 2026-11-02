import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { WORDMARK } from './wordmarkPaths';

interface WordmarkProps {
  /** Cap height in dp (component.brand.wordmarkHeader = 15 on Home, wordmarkWelcome = 24 on welcome). */
  capHeight: number;
  /** Defaults to component.brand.wordmarkColor (color.text). */
  color?: string;
  /** Set when the wordmark is the screen's name, e.g. Home's top bar. */
  header?: boolean;
}

/**
 * "Silver Mirror" in Noto Serif Display, outlined to SVG paths (scripts/brand/wordmark_outline.py), so the
 * logo is exact on every device and never falls back to a system serif. Read once by TalkBack as text.
 */
export function Wordmark({ capHeight, color, header = false }: WordmarkProps) {
  const theme = useTheme();
  const [x, y, w, h] = WORDMARK.viewBox;
  const scale = capHeight / WORDMARK.capHeight;
  // The accessible node is a View, not the Svg: on web, react-native-web turns an element with a role into that
  // role's tag (header -> <h1>), which would drop the <svg> and leave the wordmark invisible.
  return (
    <View accessible accessibilityRole={header ? 'header' : 'text'} accessibilityLabel={WORDMARK.text}>
      <Svg width={w * scale} height={h * scale} viewBox={`${x} ${y} ${w} ${h}`} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Path d={WORDMARK.d} fill={color ?? theme.components.brand.wordmarkColor} />
      </Svg>
    </View>
  );
}
