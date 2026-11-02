import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COPY } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { useKey } from '@/features/key';
import { Button, Caption } from '@/features/check/ui';
import { KeyChip } from './KeyChip';
import { PasteLinkField, type PasteInputRef } from './PasteLinkField';
import { ShareTipCard } from './ShareTipCard';
import { dismissShareTip, shareTipDismissed } from './tipStore';

export default function HomeScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { key, isDemo } = useKey();
  const [tip, setTip] = useState(false);
  const paste = useRef<PasteInputRef>(null);

  useEffect(() => {
    shareTipDismissed().then((d) => setTip(!d));
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      contentContainerStyle={{ paddingTop: insets.top + t.space[6], paddingBottom: insets.bottom + t.space[10], paddingHorizontal: t.spacing.gutter, gap: t.space[6] }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ gap: t.space[3] }}>
        <Text accessibilityRole="header" style={[t.type.display, { color: t.colors.text }]}>
          SkinKey
        </Text>
        <Text style={[t.type.reason, { color: t.colors.text }]}>
          The tag says oily skin. Your scan and the ingredients get a vote.
        </Text>
        <KeyChip keyProfile={key} isDemo={isDemo} onPress={() => router.push(key ? '/key' : '/scan')} />
      </View>

      <View style={{ gap: t.space[3] }}>
        <Text accessibilityRole="header" style={[t.type.headline, { color: t.colors.text }]}>
          Check a product
        </Text>
        <PasteLinkField ref={paste} onSubmit={(q) => router.push({ pathname: '/check', params: { q } })} />
      </View>

      {tip ? (
        <ShareTipCard
          onDismiss={() => {
            setTip(false);
            void dismissShareTip();
          }}
          onPaste={() => paste.current?.focus()}
        />
      ) : null}

      <View style={{ gap: t.space[2] }}>
        <Button
          label="Try a sample share"
          variant="secondary"
          testID="sample-share"
          onPress={() => router.push({ pathname: '/check', params: { sample: '1' } })}
          accessibilityHint="Checks a labelled sample listing. Uses the Demo Key if you haven't scanned."
        />
        <Caption>A labelled sample listing{key ? '' : ', checked against the Demo Key'}. No store app needed.</Caption>
      </View>

      <View style={{ gap: t.space[1] }}>
        <Caption>{COPY.footer}</Caption>
        <Caption>{COPY.notAffiliated}</Caption>
      </View>
    </ScrollView>
  );
}
