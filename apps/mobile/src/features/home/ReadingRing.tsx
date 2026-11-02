import { useId } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import type { Band } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '@/components';

/** Segments lit per band: the ring shows the band word as one, two or three of three arcs. Never a figure. */
export const BAND_SEGMENTS: Record<Band, 1 | 2 | 3> = { Low: 1, Medium: 2, High: 3 };

/**
 * Ring on the Home reading card (dashboard reference "Skin Health" ring, without its number). With a `level` it is a
 * three-arc band ring: Low lights one arc, Medium two, High three, plum-to-pink with round caps, the rest in the pale
 * lilac track. The card prints the same band as a word beside it, so the ring never carries meaning alone. Without a
 * level (no reading yet) it is the plain pale track around the glyph. A pastel disc holds the glyph. Hidden from
 * TalkBack; the card's own label says the skin type and the band.
 */
export function ReadingRing({ icon = 'droplet', level, size = 96 }: { icon?: IconName; level?: Band; size?: number }) {
  const t = useTheme();
  const c = t.colors;
  const stroke = 9;
  const r = (size - stroke) / 2;
  const len = 2 * Math.PI * r;
  const disc = size - stroke * 2 - 18;
  const id = `ring${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const centre = size / 2;
  // Round caps reach stroke/2 past each end, so the visible gap between arcs is `gap - stroke`.
  const gap = stroke + 7;
  const seg = len / 3 - gap;
  const lit = level ? BAND_SEGMENTS[level] : 0;
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
        {level ? (
          [0, 1, 2].map((i) => (
            <Circle
              key={i}
              cx={centre}
              cy={centre}
              r={r}
              stroke={i < lit ? `url(#${id})` : c.tileLilac}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${seg} ${len}`}
              // Arc i starts just past twelve o'clock plus i thirds, clockwise; half a gap either side.
              transform={`rotate(${-90 + i * 120 + ((gap / 2) / len) * 360} ${centre} ${centre})`}
            />
          ))
        ) : (
          <Circle cx={centre} cy={centre} r={r} stroke={c.tileLilac} strokeWidth={stroke} fill="none" />
        )}
      </Svg>
      <View style={{ width: disc, height: disc, borderRadius: disc / 2, backgroundColor: c.tilePink, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={t.icon.lg} color={c.plum} />
      </View>
    </View>
  );
}
