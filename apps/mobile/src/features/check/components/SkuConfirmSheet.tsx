import { Pressable, Text, View } from 'react-native';
import type { ResolveCandidate } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { productLine } from '../flow';
import { Body, Button, Sheet } from '../ui';

interface SkuConfirmSheetProps {
  visible: boolean;
  mode: 'single' | 'choose';
  candidates: ResolveCandidate[];
  onConfirm: (c: ResolveCandidate) => void;
  onNotThis: () => void;
  onClose: () => void;
}

/** No verdict appears before the user confirms the SKU (spec §2B.2). */
export function SkuConfirmSheet({ visible, mode, candidates, onConfirm, onNotThis, onClose }: SkuConfirmSheetProps) {
  const t = useTheme();
  const top = candidates[0];

  if (mode === 'single' && top) {
    const line = productLine(top.product);
    return (
      <Sheet
        visible={visible}
        title="Is this the product?"
        onClose={onClose}
        testID="sku-confirm"
        actions={
          <>
            <Button label="Yes" onPress={() => onConfirm(top)} accessibilityLabel={`Yes, this is ${line}`} testID="sku-yes" />
            <Button label="Not this" variant="secondary" onPress={onNotThis} testID="sku-not-this" />
          </>
        }
      >
        <Text style={[t.type.reason, { color: t.colors.text }]}>
          We think this is <Text style={[t.type.headline, { color: t.colors.text }]}>{line}</Text>.
        </Text>
        {!top.product.verified ? <Body muted>Its ingredient list isn't checked by hand yet.</Body> : null}
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      title="Which product is this?"
      onClose={onClose}
      testID="sku-choose"
      actions={<Button label="None of these" variant="tertiary" onPress={onNotThis} testID="sku-none" />}
    >
      <Body muted>Pick the one you're looking at. We check nothing until you pick.</Body>
      <View style={{ gap: t.space[2] }}>
        {candidates.map((c, i) => {
          const line = productLine(c.product);
          return (
            <Pressable
              key={c.catalogId}
              testID={`sku-option-${i}`}
              onPress={() => onConfirm(c)}
              accessibilityRole="button"
              accessibilityLabel={`Option ${i + 1}. ${line}`}
              android_ripple={{ color: t.colors.state.ripple }}
              style={({ pressed }) => ({
                minHeight: t.components.listRow.minHeight,
                paddingHorizontal: t.space[4],
                paddingVertical: t.space[3],
                borderRadius: t.radius.lg,
                borderWidth: 1,
                borderColor: t.colors.borderStrong,
                backgroundColor: pressed ? t.colors.state.pressed : t.colors.surface,
                flexDirection: 'row',
                gap: t.space[3],
                alignItems: 'center',
              })}
            >
              <Text style={[t.type.reasonIndex, { color: t.colors.textMuted }]}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={[t.components.listRow.title, { color: t.colors.text, flex: 1 }]}>{line}</Text>
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
