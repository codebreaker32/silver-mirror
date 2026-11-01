import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { VerdictView } from '../present';
import { TextLink } from '../ui';
import { ProvenanceLedger } from './ProvenanceLedger';
import { ReasonList } from './ReasonList';
import { VerdictHead } from './VerdictHead';

interface Props {
  view: VerdictView;
  unknown?: ReactNode;
  tryon?: ReactNode;
  matches?: ReactNode;
  glyph?: ReactNode;
  onHowMade?: () => void;
}

/** Reason first: head (tint only here) → reasons → where it comes from → how it was made → matches. */
export function VerdictSheet({ view, unknown, tryon, matches, glyph, onHowMade }: Props) {
  const t = useTheme();
  const gap = t.space[7];
  return (
    <View testID={`verdict-${view.tone}`} style={{ gap }}>
      <VerdictHead view={view} />
      {view.label === 'UNKNOWN' && unknown ? unknown : null}
      {view.showReasons ? <ReasonList reasons={view.reasons} emptyNote={view.emptyReasonsNote} /> : null}
      {view.showReasons && glyph ? glyph : null}
      {tryon ?? null}
      <View style={{ gap: t.space[2] }}>
        <ProvenanceLedger rows={view.ledger} line={view.provenanceLine} fixedLines={view.fixedLines} />
        {onHowMade && view.label !== 'MEDICINE' ? <TextLink label="How this was made" onPress={onHowMade} testID="how-made-link" /> : null}
      </View>
      {view.showMatches && matches ? matches : null}
    </View>
  );
}
