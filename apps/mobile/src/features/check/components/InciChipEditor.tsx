import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { addChip, editChip, removeChip, uncertainCount, type InciChip } from '../chips';
import { Body, Button, Caption, Icon } from '../ui';

interface Props {
  chips: InciChip[];
  unreadable: number;
  onChange: (chips: InciChip[]) => void;
  onRun: (chips: InciChip[]) => void;
  onRetake: () => void;
}

/** Editable INCI chips from the label photo. Uncertain tokens are outlined; nothing runs until the user confirms. */
export function InciChipEditor({ chips, unreadable, onChange, onRun, onRetake }: Props) {
  const t = useTheme();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [adding, setAdding] = useState('');
  const unsure = uncertainCount(chips);
  const f = t.components.field;
  const field = {
    ...f.value,
    minHeight: f.minHeight,
    paddingHorizontal: f.paddingX,
    borderTopLeftRadius: f.radius,
    borderTopRightRadius: f.radius,
    backgroundColor: f.bg,
    borderBottomWidth: f.borderWidth,
    borderBottomColor: f.border,
    color: f.fg,
  };

  const commit = () => {
    if (editing) onChange(editChip(chips, editing, draft));
    setEditing(null);
  };

  return (
    <View testID="chip-editor" style={{ gap: t.space[3] }}>
      <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
        Check the ingredients we read
      </Text>
      <Body muted>
        {`${chips.length} ingredients, in label order.`}
        {unsure ? ` ${unsure} outlined ${unsure === 1 ? 'one is' : 'ones are'} uncertain: tap to correct or remove.` : ' Tap any to correct or remove.'}
      </Body>
      {unreadable > 0 ? <Caption>Part of the label was hard to read. Compare with the pack before you run the check.</Caption> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space[2] }}>
        {chips.map((c, i) => (
          <Pressable
            key={c.id}
            testID={`chip-${i}`}
            onPress={() => {
              setEditing(c.id);
              setDraft(c.text);
            }}
            accessibilityRole="button"
            accessibilityLabel={`${i + 1}. ${c.text}${c.uncertain ? ', uncertain' : ''}. Edit`}
            style={({ pressed }) => ({
              minHeight: t.touch.min,
              justifyContent: 'center',
              paddingHorizontal: t.space[3],
              borderRadius: t.radius.sm,
              backgroundColor: pressed ? t.colors.state.pressed : c.uncertain ? 'transparent' : t.components.tag.bg,
              borderWidth: c.uncertain || editing === c.id ? 1.5 : 0,
              borderStyle: c.uncertain ? 'dashed' : 'solid',
              borderColor: editing === c.id ? t.colors.focusRing : t.colors.borderStrong,
            })}
          >
            <Text style={[t.type.label, { color: t.colors.text }]}>{c.text}</Text>
          </Pressable>
        ))}
      </View>
      {editing ? (
        <View style={{ gap: t.space[2] }}>
          <Text nativeID="chip-edit-label" style={[t.type.label, { color: t.colors.text }]}>
            Ingredient name
          </Text>
          <TextInput
            testID="chip-edit-input"
            accessibilityLabelledBy="chip-edit-label"
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commit}
            autoFocus
            autoCapitalize="words"
            style={field}
          />
          <View style={{ flexDirection: 'row', gap: t.space[2], flexWrap: 'wrap' }}>
            <Button label="Save" variant="secondary" onPress={commit} />
            <Button
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
          placeholderTextColor={t.colors.textMuted}
          value={adding}
          onChangeText={setAdding}
          onSubmitEditing={() => {
            onChange(addChip(chips, adding));
            setAdding('');
          }}
          style={[field, { flex: 1 }]}
        />
        <Pressable
          onPress={() => {
            onChange(addChip(chips, adding));
            setAdding('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Add ingredient"
          style={{ width: t.touch.min, height: t.touch.min, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="plus" size={t.icon.lg} color={t.colors.text} />
        </Pressable>
      </View>
      <Button
        testID="chip-run"
        label={`Run the check on ${chips.length} ingredients`}
        disabled={chips.length === 0}
        onPress={() => onRun(chips)}
      />
      <Button label="Retake photo" variant="tertiary" onPress={onRetake} />
    </View>
  );
}
