import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The welcome screen's liquid silver (showcase 01_welcome), drawn rather than photographed: the full-bleed sheen, two
 * wide liquid ribbons (top-right and bottom-left) filled with a lavender -> silver -> white sweep, a thin bright crest
 * along each ribbon, and two small droplets with a white highlight and rim. Static, decorative, hidden from TalkBack.
 * Dark: the same shapes in graphite -> lavender-800 at half strength. No face, no product. Drawn in a 390 x 844 box
 * and scaled to cover (slice), so the ribbons keep their shape on any phone.
 */
export function LiquidBackdrop({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors, dark } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (k: string) => `${k}${uid}`;
  const s = colors.sheen;
  // Ribbon sweep stops (color.liquid): light = lavender -> silver -> white; dark = graphite -> lavender-800 -> graphite.
  const l = colors.liquid;
  const rib = [l.ribbonStart, l.ribbonMid, l.ribbonEnd];
  const ribOpacity = dark ? 0.5 : 0.6;
  const crest = l.crest;
  const rim = l.rim;
  const dropFill = l.drop;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
            <Stop offset={0} stopColor={s.start} />
            <Stop offset={0.42} stopColor={s.lavender} />
            <Stop offset={0.75} stopColor={s.silver} />
            <Stop offset={1} stopColor={s.end} />
          </LinearGradient>
          <LinearGradient id={id('ribA')} x1="0" y1="0" x2="1" y2="1">
            <Stop offset={0} stopColor={rib[0]} stopOpacity={ribOpacity} />
            <Stop offset={0.55} stopColor={rib[1]} stopOpacity={ribOpacity * 0.9} />
            <Stop offset={1} stopColor={rib[2]} stopOpacity={ribOpacity * 0.7} />
          </LinearGradient>
          <LinearGradient id={id('ribB')} x1="1" y1="0" x2="0" y2="1">
            <Stop offset={0} stopColor={rib[2]} stopOpacity={ribOpacity * 0.7} />
            <Stop offset={0.45} stopColor={rib[1]} stopOpacity={ribOpacity * 0.9} />
            <Stop offset={1} stopColor={rib[0]} stopOpacity={ribOpacity} />
          </LinearGradient>
          <RadialGradient id={id('glow')} cx="0.3" cy="0.12" r="0.75">
            <Stop offset={0} stopColor={colors.mark.glint} stopOpacity={dark ? 0.06 : 0.55} />
            <Stop offset={1} stopColor={colors.mark.glint} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id={id('drop')} cx="0.36" cy="0.3" r="0.7">
            <Stop offset={0} stopColor={colors.mark.glint} stopOpacity={dark ? 0.35 : 0.95} />
            <Stop offset={0.45} stopColor={dropFill} stopOpacity={dark ? 0.5 : 0.55} />
            <Stop offset={1} stopColor={dropFill} stopOpacity={dark ? 0.25 : 0.15} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="390" height="844" fill={`url(#${id('bg')})`} />
        <Rect x="0" y="0" width="390" height="844" fill={`url(#${id('glow')})`} />

        {/* Top-right ribbon: a wide liquid fold sweeping in from the corner. */}
        <Path d="M232 -20 C 262 70, 300 120, 352 176 C 384 210, 404 262, 420 300 L 420 -20 Z" fill={`url(#${id('ribA')})`} />
        <Path d="M276 -20 C 300 60, 334 110, 372 150 C 396 176, 410 206, 420 226 L 420 -20 Z" fill={`url(#${id('ribA')})`} />
        <Path d="M232 -20 C 262 70, 300 120, 352 176 C 384 210, 404 262, 420 300" stroke={crest} strokeWidth={1.5} fill="none" strokeLinecap="round" />

        {/* Bottom-left ribbon. */}
        <Path d="M-30 560 C 40 600, 90 650, 150 720 C 190 768, 236 812, 300 864 L -30 864 Z" fill={`url(#${id('ribB')})`} />
        <Path d="M-30 640 C 30 672, 74 712, 118 764 C 146 798, 176 830, 210 864 L -30 864 Z" fill={`url(#${id('ribB')})`} />
        <Path d="M-30 560 C 40 600, 90 650, 150 720 C 190 768, 236 812, 300 864" stroke={crest} strokeWidth={1.5} fill="none" strokeLinecap="round" />

        {/* Droplets: one large on the right, one small near the top ribbon. */}
        <Ellipse cx="318" cy="592" rx="40" ry="44" fill={`url(#${id('drop')})`} stroke={rim} strokeWidth={1} />
        <Ellipse cx="306" cy="576" rx="12" ry="8" fill={colors.mark.glint} opacity={dark ? 0.12 : 0.7} />
        <Circle cx="292" cy="236" r="9" fill={`url(#${id('drop')})`} stroke={rim} strokeWidth={1} />
        <Circle cx="70" cy="520" r="5" fill={`url(#${id('drop')})`} stroke={rim} strokeWidth={0.75} />
      </Svg>
    </View>
  );
}
