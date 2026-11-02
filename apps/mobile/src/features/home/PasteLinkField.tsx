import { useState, type ComponentRef, type Ref } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from '@/components';

/** Visible label, never placeholder-only (components.md §5). Pasting a share link or typing a name both work. */
export type PasteInputRef = ComponentRef<typeof TextInput>;

interface PasteLinkFieldProps {
  onSubmit: (value: string) => void;
  ref?: Ref<PasteInputRef>;
  /** Slate Check pill when this is the screen's main action; tonal when another primary (Start scan) is showing. */
  emphasis?: 'primary' | 'secondary';
}

/**
 * Paste field (component.field, DESIGN.md §8.2): label above, a 56dp pill with a 1dp strong edge and the inline
 * trailing Check pill (48dp target) inside it. Focus = 2dp focus-ring edge; error = 2dp text-colour edge, an info
 * icon and the message below.
 */
export function PasteLinkField({ onSubmit, ref, emphasis = 'primary' }: PasteLinkFieldProps) {
  const t = useTheme();
  const f = t.components.field;
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [focused, setFocused] = useState(false);
  const submit = () => {
    if (!value.trim()) {
      setError('Type a product name to check.');
      return;
    }
    setError(null);
    onSubmit(value.trim());
  };
  const edge = error ? { width: 2, color: t.colors.text } : focused ? { width: f.focusBorderWidth, color: f.focusBorder } : { width: f.borderWidth, color: f.border };
  const inset = (f.minHeight - f.trailingActionTarget) / 2;
  const primary = emphasis === 'primary';
  return (
    <View style={{ gap: t.space[2] }}>
      <Text nativeID="paste-label" {...t.textProps.label} style={[f.label, { color: f.labelColor }]}>
        Product link or name
      </Text>
      <View
        style={{
          minHeight: f.minHeight,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: f.bg,
          borderRadius: f.radius,
          borderWidth: edge.width,
          borderColor: edge.color,
          // Keep the text from shifting when the edge thickens on focus or error.
          paddingLeft: f.paddingX - (edge.width - f.borderWidth),
          paddingRight: inset - (edge.width - f.borderWidth),
          gap: t.space[2],
        }}
      >
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Icon name="paste" size={t.icon.md} color={t.colors.textMuted} />
        </View>
        <TextInput
          ref={ref}
          testID="paste-input"
          accessibilityLabelledBy="paste-label"
          accessibilityLabel="Product link or name"
          placeholder="Paste a link or name"
          placeholderTextColor={f.placeholder}
          value={value}
          onChangeText={(v) => {
            setValue(v);
            if (error) setError(null);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={submit}
          returnKeyType="go"
          autoCapitalize="none"
          autoCorrect={false}
          multiline={false}
          maxFontSizeMultiplier={t.textProps.body.maxFontSizeMultiplier}
          style={{ ...f.value, flex: 1, minWidth: 0, color: f.fg, minHeight: f.trailingActionTarget, paddingVertical: 0, outlineWidth: 0 }}
        />
        <Pressable
          testID="paste-submit"
          onPress={submit}
          accessibilityRole="button"
          accessibilityLabel="Check"
          accessibilityHint="Checks this product against your reading"
          android_ripple={{ color: primary ? t.colors.state.rippleOnAccent : t.colors.state.ripple }}
          style={({ pressed }) => ({
            minHeight: f.trailingActionTarget,
            minWidth: f.trailingActionTarget,
            paddingHorizontal: t.space[5],
            borderRadius: t.radius.full,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: primary ? (pressed ? t.colors.accentPressed : t.colors.accent) : pressed ? t.colors.secondaryBgPressed : t.colors.secondaryBg,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <Text {...t.textProps.button} style={[t.typography.button, { color: primary ? t.colors.onAccent : t.colors.onSecondary }]}>
            Check
          </Text>
        </Pressable>
      </View>
      {error ? (
        <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'center' }} accessibilityLiveRegion="polite">
          <Icon name="info" size={t.icon.sm} color={t.colors.text} />
          <Text {...t.textProps.bodySm} style={[t.typography.bodySm, { color: t.colors.text }]}>
            {error}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
