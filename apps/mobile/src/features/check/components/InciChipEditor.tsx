import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Caption, Card, Icon, IconButton, PillButton, SectionHeader, Txt } from '@/components';
import { addChip, editChip, removeChip, uncertainCount, type InciChip } from '../chips';

interface Props {
  chips: InciChip[];
  unreadable: number;
  onChange: (chips: InciChip[]) => void;
  onRun: (chips: InciChip[]) => void;
  onRetake: () => void;
}

/**
 * Editable INCI chips from the label photo (component.chip pills). Uncertain tokens are dashed outline pills with the
 * dashed-circle icon, so the state never rests on colour; nothing runs until the user confirms.
 */
export function InciChipEditor({ chips, unreadable, onChange, onRun, onRetake }: Props) {
  const t = useTheme();
  const c = t.components.chip;
  const f = t.components.field;
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState('');
  const [focused, setFocused] = useState<'edit' | 'add' | null>(null);
  const unsure = uncertainCount(chips);
  const field = (on: boolean) => ({
    ...f.value,
    minHeight: f.minHeight,
    paddingHorizontal: f.paddingX,
    borderRadius: f.radius,
    backgroundColor: f.bg,
    borderWidth: on ? f.focusBorderWidth : f.borderWidth,
    borderColor: on ? f.focusBorder : f.border,
    color: f.fg,
  });
  const hit = Math.max(0, (t.touch.min - c.visualMinHeight) / 2);

  const commit = () => {
    if (editing) onChange(editChip(chips, editing, draft));
    setEditing(null);
  };
  const add = () => {
    onChange(addChip(chips, adding));
    setAdding('');
  };

  return (
    <View testID="chip-editor" style={{ gap: t.space[3] }}>
      <SectionHeader
        title="Check the ingredients we read"
        supporting={`${chips.length} ingredients, in label order.${unsure ? ` ${unsure} dashed ${unsure === 1 ? 'one is' : 'ones are'} uncertain: tap to correct or remove.` : ' Tap any to correct or remove.'}`}
      />
      {unreadable > 0 ? <Caption>Part of the label was hard to read. Compare with the pack before you run the check.</Caption> : null}
      <Card variant="raised" gap={t.space[4]}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: c.gap, rowGap: t.space[3] }}>
          {chips.map((chip, i) => {
            const active = editing === chip.id;
            return (
              <Pressable
                key={chip.id}
                testID={`chip-${i}`}
                onPress={() => {
                  setEditing(chip.id);
                  setDraft(chip.text);
                }}
                hitSlop={{ top: hit, bottom: hit }}
                accessibilityRole="button"
                accessibilityLabel={`${i + 1}. ${chip.text}${chip.uncertain ? ', uncertain' : ''}. Edit`}
                accessibilityState={{ selected: active }}
                style={({ pressed }) => ({
                  minHeight: c.visualMinHeight,
                  paddingHorizontal: c.paddingX - (chip.uncertain || active ? 1 : 0),
                  borderRadius: c.radius,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: t.space[1] + 2,
                  backgroundColor: active ? c.selectedBg : pressed ? t.colors.state.pressed : chip.uncertain ? 'transparent' : c.bg,
                  borderWidth: chip.uncertain && !active ? 1 : 0,
                  borderStyle: chip.uncertain ? 'dashed' : 'solid',
                  borderColor: t.colors.borderStrong,
                })}
              >
                {chip.uncertain || active ? (
                  <Icon name={active ? 'check' : 'circle-dashed-dot'} size={t.icon.sm} color={active ? c.selectedFg : t.colors.textMuted} />
                ) : null}
                <Text {...t.textProps.label} style={[c.type, { color: active ? c.selectedFg : c.fg }]}>
                  {chip.text}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {editing ? (
          <View style={{ gap: t.space[2] }}>
            <Txt nativeID="chip-edit-label" variant="label" style={[f.label, { color: f.labelColor }]}>
              Ingredient name
            </Txt>
            <TextInput
              testID="chip-edit-input"
              accessibilityLabelledBy="chip-edit-label"
              value={draft}
              onChangeText={setDraft}
              onSubmitEditing={commit}
              onFocus={() => setFocused('edit')}
              onBlur={() => setFocused(null)}
              autoFocus
              autoCapitalize="words"
              placeholderTextColor={f.placeholder}
              style={field(focused === 'edit')}
            />
            <View style={{ flexDirection: 'row', gap: t.space[2], flexWrap: 'wrap', alignItems: 'center' }}>
              <PillButton label="Save" variant="secondary" fullWidth={false} onPress={commit} />
              <PillButton
                label="Remove"
                variant="tertiary"
                onPress={() => {
                  onChange(removeChip(chips, editing));
                  setEditing(null);
                }}
              />
            </View>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space[2] }}>
          <TextInput
            testID="chip-add-input"
            accessibilityLabel="Add an ingredient"
            placeholder="Add an ingredient"
            placeholderTextColor={f.placeholder}
            value={adding}
            onChangeText={setAdding}
            onSubmitEditing={add}
            onFocus={() => setFocused('add')}
            onBlur={() => setFocused(null)}
            style={[field(focused === 'add'), { flex: 1 }]}
          />
          <IconButton icon="plus" variant="tonal" accessibilityLabel="Add ingredient" onPress={add} />
        </View>
      </Card>
      <Body small muted>
        Claude read these names from your photo. Our rules decide once you run the check.
      </Body>
      <PillButton testID="chip-run" label={`Run the check on ${chips.length} ingredients`} disabled={chips.length === 0} onPress={() => onRun(chips)} />
      <PillButton label="Retake photo" variant="tertiary" leadingIcon="camera" onPress={onRetake} />
    </View>
  );
}
