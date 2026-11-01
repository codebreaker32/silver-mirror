import { Text, View } from 'react-native';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Button, Icon, textStyle } from '@/features/check/ui';

const STEPS = ['Open the product in Flipkart', 'Tap Share', 'Pick SkinKey'];

/** Home tip (components.md §16 homeTip). Store-agnostic art, no store logos. */
export function ShareTipCard({ onDismiss, onPaste }: { onDismiss: () => void; onPaste: () => void }) {
  const t = useTheme();
  const c = t.components.shareTeachingCard;
  return (
    <View
      testID="share-tip"
      style={{ ...t.elevation['1'].style, backgroundColor: c.bg, borderColor: c.border, borderWidth: 1, borderRadius: c.radius, padding: c.padding, gap: t.space[3] }}
    >
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel="Share menu with SkinKey highlighted"
        style={{ backgroundColor: t.colors.bgSunken, borderRadius: t.radius.md, padding: t.space[4], flexDirection: 'row', gap: t.space[3], justifyContent: 'center' }}
      >
        {['', 'SkinKey', ''].map((label, i) => (
          <View
            key={i}
            style={{
              width: t.space[16],
              height: t.space[16],
              borderRadius: t.radius.lg,
              borderWidth: label ? 2 : 1,
              borderColor: label ? t.colors.text : c.illustrationStroke,
              alignItems: 'center',
              justifyContent: 'center',
              gap: t.space[1],
            }}
          >
            {label ? (
              <>
                <Icon name="share" size={t.icon.md} color={t.colors.text} />
                <Text style={[t.type.labelSm, { color: t.colors.text }]}>{label}</Text>
              </>
            ) : null}
          </View>
        ))}
      </View>
      <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
        In Flipkart, tap Share → SkinKey
      </Text>
      {STEPS.map((s, i) => (
        <View key={s} style={{ flexDirection: 'row', gap: t.space[3] }}>
          <Text style={[textStyle(c.stepIndex), { color: c.stepIndexColor, width: t.space[8] }]}>{String(i + 1).padStart(2, '0')}</Text>
          <Text style={[c.body, { color: t.colors.text, flex: 1 }]}>{s}</Text>
        </View>
      ))}
      <Text testID="amazon-coach-mark" style={[t.type.label, { color: t.colors.text }]}>
        {COPY.amazonCoachMark}
      </Text>
      <Text style={[t.type.bodySm, { color: t.colors.textMuted }]}>{COPY.coachMark}.</Text>
      <View style={{ gap: t.space[2] }}>
        <Button label="Got it" onPress={onDismiss} testID="share-tip-dismiss" />
        <Button label="Paste a link instead" variant="tertiary" onPress={onPaste} />
      </View>
    </View>
  );
}
