import { useState, type ComponentRef, type Ref } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Button, Icon } from '@/features/check/ui';

/** Visible label, never placeholder-only (components.md §5). Pasting a share link or typing a name both work. */
export type PasteInputRef = ComponentRef<typeof TextInput>;

export function PasteLinkField({ onSubmit, ref }: { onSubmit: (value: string) => void; ref?: Ref<PasteInputRef> }) {
  const t = useTheme();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    if (!value.trim()) {
      setError('Type a product name to check.');
      return;
    }
    setError(null);
    onSubmit(value.trim());
  };
  return (
    <View style={{ gap: t.space[2] }}>
      <Text nativeID="paste-label" style={[t.components.field.label, { color: t.components.field.labelColor }]}>
        Product link or name
      </Text>
      <TextInput
        ref={ref}
        testID="paste-input"
        accessibilityLabelledBy="paste-label"
        accessibilityLabel="Product link or name"
        value={value}
        onChangeText={(v) => {
          setValue(v);
          if (error) setError(null);
        }}
        onSubmitEditing={submit}
        returnKeyType="go"
        autoCapitalize="none"
        autoCorrect={false}
        multiline={false}
        style={{
          ...t.components.field.value,
          color: t.components.field.fg,
          minHeight: t.components.field.minHeight,
          paddingHorizontal: t.components.field.paddingX,
          backgroundColor: t.components.field.bg,
          borderTopLeftRadius: t.components.field.radius,
          borderTopRightRadius: t.components.field.radius,
          borderBottomWidth: error ? t.components.stateView.fieldInvalid.borderWidth : t.components.field.borderWidth,
          borderBottomColor: error ? t.components.stateView.fieldInvalid.border : t.components.field.border,
        }}
      />
      {error ? (
        <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }} accessibilityLiveRegion="polite">
          <Icon name="info" size={t.icon.sm} color={t.colors.text} />
          <Text style={[t.type.bodySm, { color: t.colors.text }]}>{error}</Text>
        </View>
      ) : null}
      <Button label="Check it" variant="secondary" onPress={submit} testID="paste-submit" />
    </View>
  );
}
