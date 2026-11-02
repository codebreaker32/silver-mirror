import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { PillButton, Txt } from '@/components';
import type { VerdictView } from '../present';
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
}

/**
 * Reasons before verdicts (DESIGN.md §9.4): head (the only tint) → reasons → try-on (tinted) → next step → where it
 * comes from → how it was made → better matches. MEDICINE stops after the head.
 */
export function VerdictSheet({ view, afterHead, unknown, tryon, matches, glyph, demo = false, onHowMade }: Props) {
  const t = useTheme();
  const medicine = view.label === 'MEDICINE';
  return (
    <View testID={`verdict-${view.tone}`} style={{ gap: t.spacing.section }}>
      <View style={{ gap: t.space[4] }}>
        <VerdictHead view={view} demo={demo} />
        {afterHead ?? null}
      </View>
      {view.showReasons ? (
        <View style={{ gap: t.space[5] }}>
          <ReasonList reasons={view.reasons} emptyNote={view.emptyReasonsNote} />
          {/* Try-on straight under the reasons: for a tinted product, shade is the shopper's next question. */}
          {tryon ?? null}
          {glyph ?? null}
        </View>
      ) : null}
      {view.unknownKind === 'ingredients' && unknown ? unknown : null}
      {!view.showReasons ? (tryon ?? null) : null}
      {!medicine ? (
        <View style={{ gap: t.space[3] }}>
          <ProvenanceLedger rows={view.ledger} line={null} />
          {onHowMade ? (
            <PillButton variant="tertiary" label="How this was made" trailingIcon="chevron-right" onPress={onHowMade} testID="how-made-link" />
          ) : null}
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
