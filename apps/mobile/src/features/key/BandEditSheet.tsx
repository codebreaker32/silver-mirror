import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { Band, Concern, KeyProfile } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, Button, Sheet, haptic } from '../scan/ui';
import { BANDS, CONCERNS, CONCERN_LABEL, SELF_REPORTED_TAG } from './model';

interface Props {
  visible: boolean;
  keyProfile: KeyProfile;
  onClose: () => void;
  onSave: (concern: Concern, level: Band) => Promise<void>;
}

export function BandEditSheet({ visible, keyProfile, onClose, onSave }: Props) {
  const theme = useTheme();
  const [busy, setBusy] = useState<Concern | null>(null);

  const choose = async (concern: Concern, level: Band) => {
    if (keyProfile.bands[concern].level === level) return;
    setBusy(concern);
    try {
      haptic('toggleOn');
      await onSave(concern, level);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Sheet visible={visible} title="Feels wrong? Edit" onClose={onClose} actions={<Button label="Done" variant="secondary" onPress={onClose} />}>
      <Body muted small>
        Pick the band that feels right. Edited bands are tagged "{SELF_REPORTED_TAG}" everywhere they appear.
      </Body>
      {CONCERNS.map((concern) => {
        const reading = keyProfile.bands[concern];
        return (
          <View key={concern} style={{ gap: theme.space[2] }}>
            <Text style={[theme.type.label, { color: theme.colors.text }]}>
              {CONCERN_LABEL[concern]}
              {reading.selfReported && reading.measuredLevel ? `  ·  measured: ${reading.measuredLevel}` : ''}
            </Text>
            <View accessibilityRole="radiogroup" style={{ flexDirection: 'row', gap: theme.space[2] }}>
              {BANDS.map((level) => {
                const selected = reading.level === level;
                return (
                  <Pressable
                    key={level}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected, busy: busy === concern }}
                    accessibilityLabel={`${CONCERN_LABEL[concern]}: ${level}`}
                    onPress={() => void choose(concern, level)}
                    style={({ pressed }) => ({
                      flex: 1,
                      minHeight: theme.touch.min,
                      borderRadius: theme.radius.md,
                      borderWidth: selected ? 2 : 1.5,
                      borderColor: selected ? theme.colors.text : theme.colors.borderStrong,
                      backgroundColor: pressed ? theme.colors.state.pressed : selected ? theme.components.bandChip.bg : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    })}
                  >
                    <Text style={[selected ? theme.type.label : theme.type.bodySm, { color: theme.colors.text }]}>{level}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </Sheet>
  );
}
