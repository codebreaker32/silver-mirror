import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ResolveCandidate } from '@skinkey/contracts';
import { useTheme } from '@/theme/ThemeProvider';
import { Body, ButtonPair, Icon, PillButton, Sheet, Txt } from '@/components';
import { categoryGlyph, displayTitle, markMismatches } from '../display';
import { productLine } from '../flow';

interface SkuConfirmSheetProps {
  visible: boolean;
  mode: 'single' | 'choose';
  candidates: ResolveCandidate[];
  /** The title read from the shared listing; tokens that disagree with it (SPF 30 vs 50, "Body") are set in bold. */
  sharedTitle?: string | null;
  onConfirm: (c: ResolveCandidate) => void;
  onNotThis: () => void;
  onClose: () => void;
}

const nameOf = (c: ResolveCandidate) => displayTitle(productLine({ brand: c.product.brand, name: c.product.name }));

/** Sunken category-glyph tile (no product photo, no "01 / 02" numerals). */
function GlyphTile({ c }: { c: ResolveCandidate }) {
  const t = useTheme();
  const m = t.components.productMatchCard;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: m.thumbSize, height: m.thumbSize, borderRadius: m.thumbRadius, backgroundColor: m.thumbBg, alignItems: 'center', justifyContent: 'center' }}
    >
      <Icon name={categoryGlyph(c.product.category)} size={t.icon.lg} color={t.colors.textMuted} />
    </View>
  );
}

/** Name with mismatched tokens in the strong weight on the accent-subtle wash, then the muted size line. */
function CandidateText({ c, sharedTitle }: { c: ResolveCandidate; sharedTitle?: string | null }) {
  const t = useTheme();
  const name = nameOf(c);
  const parts = markMismatches(name, sharedTitle);
  const size = c.product.size ? markMismatches(c.product.size, sharedTitle) : null;
  const span = (p: { text: string; mismatch: boolean }, i: number) =>
    p.mismatch ? (
      <Text key={i} style={[t.typography.bodyStrong, { color: t.colors.onAccentSubtle, backgroundColor: t.colors.accentSubtle }]}>
        {p.text}
      </Text>
    ) : (
      p.text
    );
  return (
    <View style={{ flex: 1, gap: t.space[1] }}>
      <Txt variant={parts.length > 1 ? 'body' : 'bodyStrong'}>{parts.length > 1 ? parts.map(span) : name}</Txt>
      {size ? (
        <Txt variant="bodySm" tone="muted">
          {size.length > 1 ? size.map(span) : c.product.size}
        </Txt>
      ) : null}
    </View>
  );
}

const differences = (c: ResolveCandidate, sharedTitle?: string | null) =>
  [...markMismatches(nameOf(c), sharedTitle), ...(c.product.size ? markMismatches(c.product.size, sharedTitle) : [])].filter((p) => p.mismatch).map((p) => p.text);

/** No verdict appears before the user confirms the SKU (spec §2B.2, DESIGN.md §9.3). */
export function SkuConfirmSheet({ visible, mode, candidates, sharedTitle, onConfirm, onNotThis, onClose }: SkuConfirmSheetProps) {
  const t = useTheme();
  const [picked, setPicked] = useState<string | null>(null);
  const top = candidates[0];
  const card = {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.border,
    padding: t.space[4],
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: t.space[3],
  };

  if (mode === 'single' && top) {
    const line = productLine(top.product);
    return (
      <Sheet
        visible={visible}
        title="Is this the product?"
        supporting="We check nothing until you confirm."
        onClose={onClose}
        testID="sku-confirm"
        actions={
          <ButtonPair>
            <PillButton label="Yes" onPress={() => onConfirm(top)} accessibilityLabel={`Yes, this is ${line}`} testID="sku-yes" />
            <PillButton label="Not this" variant="secondary" onPress={onNotThis} testID="sku-not-this" />
          </ButtonPair>
        }
      >
        <View style={card} accessible accessibilityLabel={`We think this is ${line}.`}>
          <GlyphTile c={top} />
          <CandidateText c={top} sharedTitle={sharedTitle} />
        </View>
        {!top.product.verified ? <Body small muted>Its ingredient list isn't checked by hand yet.</Body> : null}
      </Sheet>
    );
  }

  return (
    <Sheet
      visible={visible}
      title="Which product is this?"
      supporting="Pick the one you're looking at. We check nothing until you pick."
      onClose={onClose}
      testID="sku-choose"
      actions={<PillButton label="None of these: check by name only" variant="secondary" onPress={onNotThis} testID="sku-none" />}
    >
      <View accessibilityRole="radiogroup" style={{ gap: t.space[3] }}>
        {candidates.map((c, i) => {
          const line = productLine(c.product);
          const on = picked === c.catalogId;
          const diff = differences(c, sharedTitle);
          return (
            <Pressable
              key={c.catalogId}
              testID={`sku-option-${i}`}
              onPress={() => {
                setPicked(c.catalogId);
                onConfirm(c);
              }}
              accessibilityRole="radio"
              accessibilityState={{ checked: on, selected: on }}
              accessibilityLabel={`${line}${diff.length ? `. Differs from the listing: ${diff.join(', ')}` : ''}`}
              android_ripple={{ color: t.colors.state.ripple }}
              style={({ pressed }) => ({
                ...card,
                minHeight: t.components.listRow.minHeight,
                borderWidth: on ? 2 : 1,
                padding: on ? t.space[4] - 1 : t.space[4],
                borderColor: on ? t.colors.accent : t.colors.border,
                backgroundColor: pressed ? t.colors.state.pressed : t.colors.surface,
                transform: [{ scale: pressed ? 0.99 : 1 }],
              })}
            >
              <GlyphTile c={c} />
              <CandidateText c={c} sharedTitle={sharedTitle} />
              <Icon name={on ? 'check-circle' : 'circle'} size={t.icon.lg} color={on ? t.colors.text : t.colors.borderStrong} strokeWidth={on ? 2 : t.icon.stroke} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
