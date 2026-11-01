import { Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Button } from '../scan/ui';

const STEPS = ['Open the product in Flipkart, Amazon.in or Nykaa', 'Tap Share (in Amazon, tap More first)', 'Pick SkinKey, then long-press it to pin it'];

function ShareSheetArt() {
  const theme = useTheme();
  const stroke = theme.components.shareTeachingCard.illustrationStroke;
  const tiles = [0, 1, 2, 3];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Share menu with SkinKey highlighted"
      style={{ backgroundColor: theme.colors.bgSunken, borderRadius: theme.radius.md, padding: theme.space[4], alignItems: 'center' }}
    >
      <Svg width={232} height={96} viewBox="0 0 232 96">
        <Rect x={1} y={1} width={230} height={94} rx={12} stroke={stroke} strokeWidth={1.5} fill="none" />
        {tiles.map((i) => {
          const x = 22 + i * 52;
          const lit = i === 0;
          return (
            <Rect
              key={i}
              x={x}
              y={22}
              width={36}
              height={36}
              rx={10}
              stroke={lit ? theme.colors.text : stroke}
              strokeWidth={lit ? 2 : 1}
              fill={lit ? theme.colors.surface : 'none'}
            />
          );
        })}
        <Circle cx={40} cy={40} r={7} stroke={theme.colors.text} strokeWidth={1.5} fill="none" />
        <Rect x={22} y={66} width={36} height={6} rx={3} fill={theme.colors.text} />
        {[1, 2, 3].map((i) => (
          <Rect key={i} x={22 + i * 52} y={66} width={36} height={6} rx={3} fill={stroke} opacity={0.4} />
        ))}
      </Svg>
    </View>
  );
}

export function ShareCoachMark({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme();
  const t = theme.components.shareTeachingCard;
  return (
    <View
      style={{
        ...theme.elevation['1'].style,
        backgroundColor: theme.colors.surfaceRaised,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: t.radius,
        padding: theme.space[5],
        gap: theme.space[4],
      }}
    >
      <ShareSheetArt />
      <Text accessibilityRole="header" style={[theme.type.headline, { color: theme.colors.text }]}>
        {COPY.coachMark}
      </Text>
      <View style={{ gap: theme.space[2] }}>
        {STEPS.map((step, i) => (
          <View key={step} style={{ flexDirection: 'row', gap: theme.space[3] }}>
            <Text style={[theme.type.reasonIndex, { color: t.stepIndexColor, width: 28 }]}>{`0${i + 1}`}</Text>
            <Text style={[t.body, { color: theme.colors.text, flex: 1 }]}>{step}</Text>
          </View>
        ))}
      </View>
      <View testID="share-paths" style={{ gap: theme.space[1] }}>
        {COPY.sharePaths.map((path) => (
          <Text key={path} style={[theme.type.bodySm, { color: theme.colors.textMuted }]}>
            {path}
          </Text>
        ))}
      </View>
      <Button label="Got it" variant="primary" onPress={onDismiss} />
    </View>
  );
}
