import { useId } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';

/**
 * The welcome screen's liquid silver (showcase 01_welcome), drawn rather than photographed: the full-bleed sheen, two
 * wide liquid ribbons filled with a lavender -> silver -> white sweep, a bright crest just inside each ribbon's edge,
 * and droplets with a white highlight and rim. Static, decorative, hidden from TalkBack. No face, no product. Drawn in
 * a 390 x 844 box and scaled to cover (slice), so the ribbons keep their shape on any phone.
 *
 * Light (2.1 fidelity pass): the field sits on lavender-grey mist (#EFECF2 -> #E7E3EC -> mist.200), never near-white,
 * with one soft white glow top-left; ribbon A sweeps from x 150 at the top to the right edge at y 420, ribbon B from
 * the left edge at y 470 to x 360 at the bottom, each with a 3.5dp crest. Dark: the earlier, smaller ribbons in
 * graphite -> lavender-800 at half strength (unchanged).
 */
const LIGHT = {
  ribA: 'M150 -20 C 190 90, 260 172, 322 250 C 362 302, 394 360, 420 420 L 420 -20 Z',
  ribAInner: 'M214 -20 C 250 74, 304 142, 352 200 C 384 240, 404 282, 420 316 L 420 -20 Z',
  crestA: 'M164 -20 C 204 88, 272 168, 332 244 C 370 294, 398 348, 420 398',
  ribB: 'M-30 470 C 40 520, 112 600, 182 690 C 232 754, 292 812, 360 864 L -30 864 Z',
  ribBInner: 'M-30 584 C 38 628, 98 690, 148 752 C 184 796, 218 834, 248 864 L -30 864 Z',
  crestB: 'M-30 488 C 40 538, 110 616, 176 704 C 226 768, 284 822, 342 864',
  crestWidth: 3.5,
  crestOpacity: 0.8,
};
const DARK = {
  ribA: 'M232 -20 C 262 70, 300 120, 352 176 C 384 210, 404 262, 420 300 L 420 -20 Z',
  ribAInner: 'M276 -20 C 300 60, 334 110, 372 150 C 396 176, 410 206, 420 226 L 420 -20 Z',
  crestA: 'M232 -20 C 262 70, 300 120, 352 176 C 384 210, 404 262, 420 300',
  ribB: 'M-30 560 C 40 600, 90 650, 150 720 C 190 768, 236 812, 300 864 L -30 864 Z',
  ribBInner: 'M-30 640 C 30 672, 74 712, 118 764 C 146 798, 176 830, 210 864 L -30 864 Z',
  crestB: 'M-30 560 C 40 600, 90 650, 150 720 C 190 768, 236 812, 300 864',
  crestWidth: 1.5,
  crestOpacity: 1,
};

export function LiquidBackdrop({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors, dark } = useTheme();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const id = (k: string) => `${k}${uid}`;
  const s = colors.sheen;
  // Ribbon sweep stops (color.liquid): light = lavender -> silver -> white; dark = graphite -> lavender-800 -> graphite.
  const l = colors.liquid;
  const rib = [l.ribbonStart, l.ribbonMid, l.ribbonEnd];
  const ribOpacity = dark ? 0.5 : 0.75;
  const g = dark ? DARK : LIGHT;
  // Light field: mist, not near-white (the sheen tokens stay for the dark field and the contrast gate).
  const bg = dark ? [s.start, s.lavender, s.silver, s.end] : [colors.bg, l.drop, colors.bgSunken, colors.segmentTrack];
  const crest = l.crest;
  const rim = l.rim;
  const dropFill = l.drop;
  return (
    <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={[StyleSheet.absoluteFill, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={id('bg')} x1="0" y1="0" x2="1" y2="1">
            <Stop offset={0} stopColor={bg[0]} />
            <Stop offset={0.42} stopColor={bg[1]} />
            <Stop offset={0.75} stopColor={bg[2]} />
            <Stop offset={1} stopColor={bg[3]} />
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
          <RadialGradient id={id('glow')} cx={dark ? 0.3 : 0.18} cy={dark ? 0.12 : 0.08} r={dark ? 0.75 : 0.5}>
            <Stop offset={0} stopColor={colors.mark.glint} stopOpacity={dark ? 0.06 : 0.5} />
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

        {/* Ribbon A: top edge to the right edge. */}
        <Path d={g.ribA} fill={`url(#${id('ribA')})`} />
        <Path d={g.ribAInner} fill={`url(#${id('ribA')})`} />
        <Path d={g.crestA} stroke={crest} strokeOpacity={g.crestOpacity} strokeWidth={g.crestWidth} fill="none" strokeLinecap="round" />

        {/* Ribbon B: left edge to the bottom edge. */}
        <Path d={g.ribB} fill={`url(#${id('ribB')})`} />
        <Path d={g.ribBInner} fill={`url(#${id('ribB')})`} />
        <Path d={g.crestB} stroke={crest} strokeOpacity={g.crestOpacity} strokeWidth={g.crestWidth} fill="none" strokeLinecap="round" />

        {/* Droplets: one large on the right; the small bubbles are gone (round 1), the ribbons carry the liquid. */}
        <Ellipse cx="318" cy="592" rx="40" ry="44" fill={`url(#${id('drop')})`} stroke={rim} strokeWidth={1} />
        <Ellipse cx="306" cy="576" rx="12" ry="8" fill={colors.mark.glint} opacity={dark ? 0.12 : 0.7} />
      </Svg>
    </View>
  );
}
