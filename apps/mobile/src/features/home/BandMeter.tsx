import { Text, View } from 'react-native';
import type { Band } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { homeType } from '@/components/home/homeType';

/** Segments filled per band: Low fills one of three, Medium two, High three. Never a figure. */
export const BAND_SEGMENTS: Record<Band, 1 | 2 | 3> = { Low: 1, Medium: 2, High: 3 };

/**
 * One reading row on the Home reading surface: the band name, a three-segment bar (filled segments in ink, the rest in
 * the well tone) and the band word. The word always carries the reading; the bar only repeats it. TalkBack reads the
 * row as "Oiliness, High" through the parent card label, so the row itself is hidden from it.
 */
export function BandMeter({ label, level }: { label: string; level: Band }) {
  const t = useTheme();
  const lit = BAND_SEGMENTS[level];
  return (
    <View testID={`band-${label.toLowerCase()}`} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[3], minHeight: 24 }}>
      <Text numberOfLines={1} style={[homeType.body, { flex: 1, color: t.colors.text }]}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 22, height: 6, borderRadius: 3, backgroundColor: i < lit ? t.colors.text : t.colors.bgSunken }} />
        ))}
      </View>
      <Text numberOfLines={1} style={[homeType.bodyStrong, { width: 64, textAlign: 'right', color: t.colors.text }]}>
        {level}
      </Text>
    </View>
  );
}
