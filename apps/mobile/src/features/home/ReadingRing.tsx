import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '@/components';

/** The arc's sweep. Fixed and decorative: it never encodes a reading, a score or a share of anything. */
const SWEEP = 0.74;

/**
 * Decorative ring on the Home reading card (dashboard reference "Skin Health" ring, without its number): a pale lilac
 * track, a plum-to-pink arc with round caps, and a pastel disc holding the glyph. No figure, no percentage, and the
 * whole thing is hidden from TalkBack; the card's own label says the skin type.
 */
export function ReadingRing({ icon = 'droplet', size = 104 }: { icon?: IconName; size?: number }) {
  const t = useTheme();
  const c = t.colors;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const disc = size - stroke * 2 - 20;
  const id = `ring${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size} height={size} style={{ position: 'absolute', top: 0, left: 0 }}>
        <Defs>
          <LinearGradient id={id} x1="0" y1="0" x2="1" y2="1">
            <Stop offset={0} stopColor={c.plum} />
            <Stop offset={1} stopColor={c.accentPink} />
          </LinearGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={c.tileLilac} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={`url(#${id})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${len * SWEEP} ${len}`}
          // Start at twelve o'clock and run clockwise.
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ width: disc, height: disc, borderRadius: disc / 2, backgroundColor: c.tilePink, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.icon.lg} color={c.plum} />
      </View>
    </View>
  );
}
