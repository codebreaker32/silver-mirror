import { View } from 'react-native';
import { SilverMark } from '@/brand';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Txt } from '../Text';

/**
 * Mini share-sheet strip (component.shareTeachingCard illustration): three generic app tiles where the highlighted
 * one is the real chrome-S labelled "Silver Mirror". Generic tiles carry no logos. One image node for TalkBack.
 */
export function ShareStrip() {
  const t = useTheme();
  const s = t.components.shareTeachingCard;
  const tile = 44;
  const generic = (i: number) => (
    <View key={i} style={{ alignItems: 'center', gap: t.space[1], width: 72 }}>
      <View style={{ width: tile, height: tile, borderRadius: t.radius.md, borderWidth: 1, borderColor: s.illustrationStroke, backgroundColor: t.colors.surface }} />
      <View style={{ width: 40, height: 6, borderRadius: 3, backgroundColor: s.illustrationStroke, opacity: 0.5 }} />
    </View>
  );
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Share menu with ${COPY.appName} highlighted`}
      style={{ backgroundColor: s.illustrationBg, borderRadius: t.radius.md, paddingVertical: t.space[4], paddingHorizontal: t.space[3], flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' }}
    >
      {generic(0)}
      <View style={{ alignItems: 'center', gap: t.space[1], width: 88 }} importantForAccessibility="no-hide-descendants">
        <View style={{ padding: 3, borderRadius: t.radius.md + 3, borderWidth: s.highlightWidth, borderColor: s.highlight }}>
          <SilverMark size={tile} />
        </View>
        <Txt variant="labelSm" numberOfLines={1} style={{ color: t.colors.text }}>
          {COPY.appName}
        </Txt>
      </View>
      {generic(1)}
    </View>
  );
}
