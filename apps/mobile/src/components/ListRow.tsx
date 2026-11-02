import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { SilverMark } from '@/brand/SilverMark';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName, type LegacyIconName } from './Icon';
import { Txt } from './Text';

/** Leading soft square tile (showcase routine rows): a line icon, the chrome-S mark, or a product glyph. */
export interface ListRowThumb {
  icon?: IconName | LegacyIconName;
  mark?: true;
  glyph?: 'bottle' | 'tube' | 'jar';
}

export interface ListRowProps {
  title: string;
  supporting?: string;
  leadingIcon?: IconName | LegacyIconName;
  /** 56dp soft square tile instead of the leading icon; the row grows to 72dp. */
  thumb?: ListRowThumb;
  /** chevron (opens a screen), external (leaves the app), none, or any node (a Tag, a status). */
  trailing?: 'chevron' | 'external' | 'none' | ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/** The 56dp thumb tile on its own (also used by SKU candidate rows). Decorative. */
export function ThumbTile({ thumb, size }: { thumb: ListRowThumb; size?: number }) {
  const t = useTheme();
  const r = t.components.listRow;
  const px = size ?? r.thumbSize;
  return (
    <View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: px, height: px, borderRadius: r.thumbRadius, backgroundColor: r.thumbBg, alignItems: 'center', justifyContent: 'center' }}
    >
      {thumb.mark ? (
        <SilverMark size={Math.round(px * 0.5)} tile={false} />
      ) : (
        <Icon name={thumb.icon ?? thumb.glyph ?? 'bottle'} size={t.icon.lg} color={thumb.glyph && !thumb.icon ? t.colors.textMuted : r.thumbIcon} />
      )}
    </View>
  );
}

/**
 * Row (component.listRow): ≥56dp, leading 24dp icon, title + supporting, trailing chevron. With `thumb`: a 56dp soft
 * square tile, title in bodyStrong 16/22 and supporting in bodySm muted, row ≥72dp (showcase 02_home list).
 */
export function ListRow({ title, supporting, leadingIcon, thumb, trailing = 'chevron', onPress, disabled = false, accessibilityLabel, accessibilityHint, testID }: ListRowProps) {
  const t = useTheme();
  const r = t.components.listRow;
  const fg = disabled ? r.fgDisabled : r.titleColor;
  const end =
    trailing === 'chevron' ? (
      <Icon name="chevron-right" size={r.trailingIcon} color={r.trailingColor} />
    ) : trailing === 'external' ? (
      <Icon name="arrow-up-right" size={r.trailingIcon} color={r.trailingColor} />
    ) : trailing === 'none' ? null : (
      trailing
    );
  const body = (
    <>
      {thumb ? <ThumbTile thumb={thumb} /> : leadingIcon ? <Icon name={leadingIcon} size={r.leadingIcon} color={disabled ? r.fgDisabled : r.titleColor} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Txt variant="bodyStrong" style={[r.title, { color: fg }]}>
          {title}
        </Txt>
        {supporting ? (
          <Txt variant="bodySm" style={[r.supporting, { color: disabled ? r.fgDisabled : r.supportingColor }]}>
            {supporting}
          </Txt>
        ) : null}
      </View>
      {end}
    </>
  );
  const minHeight = thumb ? r.minHeightThumb : r.minHeight;
  const box = { minHeight, paddingHorizontal: r.paddingX, paddingVertical: r.paddingY, gap: r.gap, flexDirection: 'row' as const, alignItems: 'center' as const };
  const label = accessibilityLabel ?? [title, supporting].filter(Boolean).join('. ') + (trailing === 'external' ? ', opens in browser' : '');
  if (!onPress) {
    return (
      <View testID={testID} accessible accessibilityLabel={label} style={box}>
        {body}
      </View>
    );
  }
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole={trailing === 'external' ? 'link' : 'button'}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      android_ripple={{ color: t.colors.state.ripple }}
      style={({ pressed }) => [box, { minHeight, backgroundColor: pressed ? r.bgPressed : 'transparent' }]}
    >
      {body}
    </Pressable>
  );
}

/**
 * Grouped card of rows with inset hairlines between them (listRow.groupBg / groupRadius, raised: hairline + violet
 * shadow in light, sheen edge in dark), optional sans group head. `thumbs` insets the dividers to the text column
 * (gutter + 56 + 16), as in the showcase list.
 */
export function ListGroup({
  title,
  children,
  testID,
  thumbs = false,
  inset: insetOverride,
  accessibilityLabel,
}: {
  title?: string;
  children: ReactNode;
  testID?: string;
  thumbs?: boolean;
  /** Divider left inset for rows with a custom leading tile (Settings: gutter + 44 + gap). Overrides `thumbs`. */
  inset?: number;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  const r = t.components.listRow;
  const rows = Children.toArray(children);
  const inset = insetOverride ?? (thumbs ? r.paddingX + r.thumbSize + r.gap : r.dividerInset);
  return (
    <View testID={testID} style={{ gap: t.space[2] }}>
      {title ? (
        <Txt accessibilityRole="header" variant="section">
          {title}
        </Txt>
      ) : null}
      <View
        accessibilityLabel={accessibilityLabel}
        style={{
          ...(t.dark ? null : t.elevation['1'].style),
          backgroundColor: t.dark ? r.groupBg : t.colors.glass,
          borderRadius: r.groupRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.dark ? t.colors.border : t.colors.glassEdge,
          borderTopColor: t.dark ? t.colors.sheenEdge : t.colors.glassEdge,
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={{ height: 1, marginLeft: inset, marginRight: r.paddingX, backgroundColor: r.divider }} importantForAccessibility="no" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
