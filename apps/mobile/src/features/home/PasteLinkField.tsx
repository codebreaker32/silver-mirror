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
  /** Drop the visible "Product link or name" line when a section head right above names the field (Home). The
   *  input keeps its accessible name. */
  hideLabel?: boolean;
}

/**
 * Paste field (Silver & graphite): optional label above, a 56dp surface-tone row (radius 16, no line, no shadow) with the
 * inline graphite Check pill (48dp target). Focus = 2dp steel focus ring; error = 2dp ink edge, an info icon and the
 * message below.
 */
export function PasteLinkField({ onSubmit, ref, emphasis = 'primary', hideLabel = false }: PasteLinkFieldProps) {
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
  // Silver & graphite: the field is a surface-tone row on the page, radius 16, no line and no shadow at rest. Focus
  // draws the 2dp steel focus ring, an error a 2dp ink edge; the edge is always 2dp wide (transparent at rest) so the
  // text never shifts.
  const edgeColor = error ? t.colors.text : focused ? t.colors.focusRing : 'transparent';
  const inset = (f.minHeight - f.trailingActionTarget) / 2;
  const primary = emphasis === 'primary';
  return (
    <View style={{ gap: t.space[2] }}>
      {hideLabel ? null : (
        <Text nativeID="paste-label" {...t.textProps.label} style={[f.label, { color: f.labelColor }]}>
          Product link or name
        </Text>
      )}
      <View
        style={{
          minHeight: f.minHeight,
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: t.colors.surface,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: edgeColor,
          paddingLeft: f.paddingX - 2,
          paddingRight: inset - 2,
          gap: t.space[2],
        }}
      >
        <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
          <Icon name="paste" size={t.icon.md} color={t.colors.textMuted} />
        </View>
        <TextInput
          ref={ref}
          testID="paste-input"
          accessibilityLabelledBy={hideLabel ? undefined : 'paste-label'}
          accessibilityLabel="Product link or name"
          placeholder="Paste a link or name"
          placeholderTextColor={t.colors.textSubtle}
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
