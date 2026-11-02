import { Linking, View, useWindowDimensions } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { TextLink } from './TextLink';
import { Txt, textStyle } from './Text';

export interface LedgerLinkItem {
  label: string;
  url: string;
}

export interface LedgerItem {
  /** Sentence case: "Reading", "Product", "Rules", "Limits". */
  key: string;
  value: string;
  sub?: string | null;
  links?: readonly LedgerLinkItem[];
  /** One TalkBack node for key + value + sub; defaults to "Key: value. sub". */
  a11y?: string;
}

interface LedgerProps {
  rows: readonly LedgerItem[];
  /** Card heading; null hides it. */
  title?: string | null;
  /** Override for opening row links (defaults to Linking.openURL). */
  onOpenLink?: (url: string) => void;
  testID?: string;
}

const openUrl = (url: string) => void Linking.openURL(url).catch(() => undefined);

/**
 * Receipt card (component.provenanceLedger): rounded raised card, hairline dividers, a wide key column
 * (keyWidth 96, grows to the longest key and never breaks a key mid-word), values in bodySm.
 * Below 360dp or at 1.5× font scale the key stacks above its value. Links are sibling nodes after the row text.
 */
export function Ledger({ rows, title = 'Where this comes from', onOpenLink = openUrl, testID }: LedgerProps) {
  const t = useTheme();
  const l = t.components.provenanceLedger;
  const { width, fontScale } = useWindowDimensions();
  const stack = width < l.stackBelowWidth || fontScale >= l.stackAtFontScale;
  if (!rows.length) return null;
  return (
    <View
      testID={testID}
      style={{
        backgroundColor: l.bg,
        borderRadius: l.radius,
        paddingHorizontal: l.paddingX,
        borderWidth: 1,
        borderColor: l.topRule,
        borderTopColor: t.dark ? t.colors.sheenEdge : l.topRule,
      }}
    >
      {title ? (
        <Txt accessibilityRole="header" variant="headline" style={[l.title, { color: l.titleColor, paddingTop: t.space[4], paddingBottom: t.space[1] }]}>
          {title}
        </Txt>
      ) : null}
      {rows.map((row, i) => (
        <View
          key={`${row.key}-${i}`}
          style={{ paddingVertical: l.rowPaddingY, borderTopWidth: i > 0 || title ? 1 : 0, borderTopColor: l.rowDivider, gap: t.space[1] }}
        >
          <View
            accessible
            accessibilityLabel={row.a11y ?? `${row.key}: ${row.value}.${row.sub ? ` ${row.sub}` : ''}`}
            style={{ flexDirection: stack ? 'column' : 'row', gap: stack ? t.space[1] : l.keyGap }}
          >
            <Txt variant="overline" style={[textStyle(l.key), { color: l.keyColor, minWidth: stack ? undefined : l.keyWidth, flexShrink: 0 }]}>
              {row.key}
            </Txt>
            <View style={{ flex: stack ? undefined : 1, gap: t.space[1] }}>
              <Txt variant="bodySm" style={[l.value, { color: l.valueColor }]}>
                {row.value}
              </Txt>
              {row.sub ? (
                <Txt variant="caption" style={[l.caption, { color: l.captionColor }]}>
                  {row.sub}
                </Txt>
              ) : null}
            </View>
          </View>
          {row.links?.length ? (
            <View style={{ paddingLeft: stack ? 0 : l.keyWidth + l.keyGap }}>
              {row.links.map((link) => (
                <TextLink key={link.url} label={link.label} external onPress={() => onOpenLink(link.url)} />
              ))}
            </View>
          ) : null}
        </View>
      ))}
    </View>
  );
}
