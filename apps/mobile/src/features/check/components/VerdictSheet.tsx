import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PillButton, Txt } from '@/components';
import type { VerdictView } from '../present';
import { Disclosure } from './Disclosure';
import { ProvenanceLedger } from './ProvenanceLedger';
import { ReasonList } from './ReasonList';
import { VerdictHead } from './VerdictHead';

interface Props {
  view: VerdictView;
  /** Directly under the head: the compact "No reading yet" card (never above the verdict). */
  afterHead?: ReactNode;
  unknown?: ReactNode;
  tryon?: ReactNode;
  matches?: ReactNode;
  glyph?: ReactNode;
  /** The Demo reading is in use: greige badge inside the head. */
  demo?: boolean;
  onHowMade?: () => void;
  /** Ingredient names we know for this product (catalogue INCI order), shown under "Key ingredients". */
  ingredients?: string[];
  /** Tap on the skin-match card: the screen scrolls to the reasons. */
  onHeadPress?: () => void;
  /** Y of the reasons block inside the sheet, for that scroll. */
  onReasonsLayout?: (y: number) => void;
}

const KEY_INGREDIENTS = 8;

/**
 * Reasons before verdicts (DESIGN.md §9.4): head (the only tint) → reasons → try-on (tinted) → next step → where it
 * comes from → how it was made → better matches. MEDICINE stops after the head.
 */
export function VerdictSheet({ view, afterHead, unknown, tryon, matches, glyph, demo = false, onHowMade, ingredients, onHeadPress, onReasonsLayout }: Props) {
  const t = useTheme();
  const medicine = view.label === 'MEDICINE';
  return (
    <View testID={`verdict-${view.tone}`} style={{ gap: t.spacing.section }}>
      <View style={{ gap: t.space[4] }}>
        {onHeadPress && view.showReasons ? (
          <Pressable onPress={onHeadPress} accessibilityRole="button" accessibilityLabel={view.headA11y} accessibilityHint="Scrolls to the reasons." style={({ pressed }) => ({ minHeight: t.touch.min, opacity: pressed ? 0.85 : 1 })}>
            <VerdictHead view={view} demo={demo} />
          </Pressable>
        ) : (
          <VerdictHead view={view} demo={demo} />
        )}
        {afterHead ?? null}
      </View>
      {view.showReasons ? (
        <View style={{ gap: t.space[5] }} onLayout={(e) => onReasonsLayout?.(e.nativeEvent.layout.y)}>
          <ReasonList reasons={view.reasons} emptyNote={view.emptyReasonsNote} />
          {/* Try-on straight under the reasons: for a tinted product, shade is the shopper's next question. */}
          {tryon ?? null}
          {glyph ?? null}
        </View>
      ) : null}
      {view.unknownKind === 'ingredients' && unknown ? unknown : null}
      {!view.showReasons ? (tryon ?? null) : null}
      {!medicine ? (
        <View>
          {ingredients && ingredients.length ? (
            <Disclosure title="Key ingredients" icon="leaf" testID="key-ingredients">
              <Txt variant="body" style={{ color: t.colors.text, fontFamily: 'Geist_400Regular', fontSize: 15, lineHeight: 22 }}>
                {ingredients.slice(0, KEY_INGREDIENTS).join(', ')}
              </Txt>
              {ingredients.length > KEY_INGREDIENTS ? (
                <Txt variant="caption" tone="muted" style={{ marginTop: t.space[1] }}>
                  {`First ${KEY_INGREDIENTS} of ${ingredients.length}, in label order.`}
                </Txt>
              ) : null}
            </Disclosure>
          ) : null}
          <Disclosure title="How this was checked" icon="document" testID="how-checked">
            <View style={{ gap: t.space[3] }}>
              <ProvenanceLedger rows={view.ledger} line={null} />
              {onHowMade ? (
                <PillButton variant="tertiary" label="How this was made" trailingIcon="chevron-right" onPress={onHowMade} testID="how-made-link" />
              ) : null}
            </View>
          </Disclosure>
        </View>
      ) : null}
      {view.showMatches && matches ? matches : null}
      <View style={{ gap: t.space[1] }}>
        {view.fixedLines.map((f) => (
          <Txt key={f} variant="caption" tone="muted">
            {f}
          </Txt>
        ))}
      </View>
    </View>
  );
}
