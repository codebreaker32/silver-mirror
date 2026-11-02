import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Ledger, Txt } from '@/components';
import type { LedgerRow } from '../present';

/**
 * "Where this comes from" as a receipt card (component.provenanceLedger): keys Reading · Product · Rules · Limits in
 * sentence case on the kit Ledger, with the one-line provenance summary above it.
 */
export function ProvenanceLedger({ rows, line }: { rows: LedgerRow[]; line: string | null }) {
  const t = useTheme();
  const l = t.components.provenanceLedger;
  if (!rows.length && !line) return null;
  return (
    <View testID="ledger" style={{ gap: t.space[3] }}>
      {rows.length ? <Ledger rows={rows} /> : null}
      {line ? (
        <Txt testID="provenance-line" variant="caption" style={[l.caption, { color: l.captionColor }]}>
          {line}
        </Txt>
      ) : null}
    </View>
  );
}
