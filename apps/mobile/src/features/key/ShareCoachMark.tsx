import { View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { Button, Card, Txt } from '@/components';
import { ShareStrip } from '@/components/scan';
import { useTheme } from '@/theme/ThemeProvider';

const STEPS = [
  'Open the product in Flipkart, Amazon.in or Nykaa',
  'Tap Share (in Amazon, tap More first)',
  `Pick ${COPY.appName}, then long-press it to pin it`,
];

/** One-time share coach mark after the first reading: the share-strip art with the chrome-S tile, three ordered steps. */
export function ShareCoachMark({ onDismiss }: { onDismiss: () => void }) {
  const theme = useTheme();
  const t = theme.components.shareTeachingCard;
  return (
    <Card variant="raised" gap={theme.space[4]} testID="share-coach">
      <ShareStrip />
      <Txt accessibilityRole="header" variant="section" style={t.title}>
        {COPY.coachMark}
      </Txt>
      <View accessibilityRole="list" style={{ gap: theme.space[2] }}>
        {STEPS.map((step, i) => (
          <View key={step} accessible accessibilityLabel={`Step ${i + 1}: ${step}`} style={{ flexDirection: 'row', gap: theme.space[3] }}>
            <View
              style={{
                width: theme.icon.lg,
                height: theme.icon.lg,
                borderRadius: theme.radius.full,
                backgroundColor: theme.colors.bgSunken,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Txt variant="labelSm" style={{ color: t.stepIndexColor }}>
                {String(i + 1)}
              </Txt>
            </View>
            <Txt variant="body" style={[t.body, { flex: 1 }]}>
              {step}
            </Txt>
          </View>
        ))}
      </View>
      <View testID="share-paths" style={{ gap: theme.space[1] }}>
        {COPY.sharePaths.map((path) => (
          <Txt key={path} variant="bodySm" tone="muted">
            {path}
          </Txt>
        ))}
      </View>
      <Button label="Got it" variant="secondary" onPress={onDismiss} />
    </Card>
  );
}
