import { Linking, Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import type { LedgerRow } from '../present';
import { TextLink, textStyle } from '../ui';

const openUrl = (url: string) => void Linking.openURL(url).catch(() => undefined);

/** "Where this comes from", laid out like a dispensing label (components.md §10). */
export function ProvenanceLedger({ rows, line, fixedLines }: { rows: LedgerRow[]; line: string | null; fixedLines: string[] }) {
  const t = useTheme();
  const l = t.components.provenanceLedger;
  return (
    <View testID="ledger" style={{ gap: t.space[3] }}>
      {line ? (
        <Text testID="provenance-line" style={[l.caption, { color: l.captionColor }]}>
          {line}
        </Text>
      ) : null}
      {rows.length ? (
        <View style={{ borderTopWidth: 1.5, borderTopColor: l.topRule, borderBottomWidth: 1.5, borderBottomColor: l.topRule }}>
          <Text accessibilityRole="header" style={[l.title, { color: l.titleColor, paddingTop: t.space[3], paddingBottom: t.space[1] }]}>
            Where this comes from
          </Text>
          {rows.map((row, i) => (
            <View
              key={row.key}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: l.keyGap,
                paddingVertical: l.rowPaddingY,
                borderBottomWidth: i < rows.length - 1 ? 1 : 0,
                borderBottomColor: l.rowDivider,
              }}
            >
              <View accessible accessibilityLabel={row.a11y} style={{ flexDirection: 'row', gap: l.keyGap, flex: 1, minWidth: 240 }}>
                <Text style={[textStyle(l.key), { color: l.keyColor, width: l.keyWidth }]}>{row.key}</Text>
                <View style={{ flex: 1, gap: t.space[1] }}>
                  <Text style={[l.value, { color: l.valueColor }]}>{row.value}</Text>
                  {row.sub ? <Text style={[l.caption, { color: l.captionColor }]}>{row.sub}</Text> : null}
                </View>
              </View>
              {row.links.length ? (
                <View style={{ width: '100%', paddingLeft: l.keyWidth + l.keyGap }}>
                  {row.links.map((link) => (
                    <TextLink key={link.url} label={link.label} external onPress={() => openUrl(link.url)} />
                  ))}
                </View>
              ) : null}
            </View>
          ))}
        </View>
      ) : null}
      {fixedLines.map((f) => (
        <Text key={f} style={[l.caption, { color: l.captionColor }]}>
          {f}
        </Text>
      ))}
    </View>
  );
}
