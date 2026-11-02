import { Text, View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { SilverMark } from '@/brand';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName } from '../Icon';

/** Generic app tiles around the real chrome-S tile. No store or third-party logos: plain line glyphs only. */
type Tile = { kind: 'generic'; glyph: IconName; label: string } | { kind: 'mark' } | { kind: 'more' };
const TILES: readonly Tile[] = [
  { kind: 'generic', glyph: 'document', label: 'Messages' },
  { kind: 'mark' },
  { kind: 'generic', glyph: 'paste', label: 'Copy link' },
  { kind: 'more' },
];

/**
 * Mini share-sheet strip (component.shareTeachingCard art): a sheet handle, then a row of app tiles where the
 * highlighted one is the real Silver Mirror mark with its label. `moreLit` rings the "More" tile (Amazon's path).
 * One TalkBack node: "Share menu with Silver Mirror highlighted".
 */
export function ShareStrip({ moreLit = false }: { moreLit?: boolean }) {
  const t = useTheme();
  const c = t.components.shareTeachingCard;
  const tile = 44;
  const label = (text: string, strong: boolean) => (
    <Text
      {...t.textProps.labelSm}
      numberOfLines={1}
      style={[strong ? t.typography.labelSm : t.typography.labelSmRegular, { color: strong ? t.colors.text : t.colors.textMuted, textAlign: 'center' }]}
    >
      {text}
    </Text>
  );

  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Share menu with ${COPY.appName} highlighted`}
      testID="share-strip"
      style={{ backgroundColor: c.illustrationBg, borderRadius: t.radius.md, paddingTop: t.space[2], paddingBottom: t.space[3], paddingHorizontal: t.space[3], gap: t.space[3] }}
    >
      <View style={{ alignSelf: 'center', width: 36, height: 4, borderRadius: t.radius.full, backgroundColor: c.illustrationStroke, opacity: 0.5 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-start' }}>
        {TILES.map((item, i) => {
          if (item.kind === 'mark') {
            return (
              <View key={i} style={{ alignItems: 'center', gap: t.space[1], width: 88 }}>
                <View style={{ padding: 3, borderRadius: t.radius.md + 3, borderWidth: c.highlightWidth, borderColor: c.highlight }}>
                  <SilverMark size={40} />
                </View>
                {label(COPY.appName, true)}
              </View>
            );
          }
          const lit = item.kind === 'more' && moreLit;
          return (
            <View key={i} style={{ alignItems: 'center', gap: t.space[1], width: 68, paddingTop: 5 }}>
              <View
                style={{
                  width: tile - 4,
                  height: tile - 4,
                  borderRadius: t.radius.md - 2,
                  backgroundColor: item.kind === 'more' ? t.colors.surfaceRaised : t.colors.surface,
                  borderWidth: lit ? c.highlightWidth : 1,
                  borderStyle: lit ? 'dashed' : 'solid',
                  borderColor: lit ? c.highlight : t.colors.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name={item.kind === 'more' ? 'more-horizontal' : item.glyph} size={t.icon.md} color={item.kind === 'more' ? t.colors.text : c.illustrationStroke} />
              </View>
              {item.kind === 'more' ? label('More', lit) : label(item.label, false)}
            </View>
          );
        })}
      </View>
    </View>
  );
}
