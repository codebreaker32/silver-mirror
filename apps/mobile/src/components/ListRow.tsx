import { Children, Fragment, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon, type IconName, type LegacyIconName } from './Icon';
import { Txt } from './Text';

export interface ListRowProps {
  title: string;
  supporting?: string;
  leadingIcon?: IconName | LegacyIconName;
  /** chevron (opens a screen), external (leaves the app), none, or any node (a Tag, a status). */
  trailing?: 'chevron' | 'external' | 'none' | ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

/** Settings-style row (component.listRow): ≥56dp, leading 24dp icon, title + supporting, trailing chevron. */
export function ListRow({ title, supporting, leadingIcon, trailing = 'chevron', onPress, disabled = false, accessibilityLabel, accessibilityHint, testID }: ListRowProps) {
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
      {leadingIcon ? <Icon name={leadingIcon} size={r.leadingIcon} color={disabled ? r.fgDisabled : r.titleColor} /> : null}
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
  const box = { minHeight: r.minHeight, paddingHorizontal: r.paddingX, paddingVertical: r.paddingY, gap: r.gap, flexDirection: 'row' as const, alignItems: 'center' as const };
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
      style={({ pressed }) => [box, { minHeight: r.minHeight, backgroundColor: pressed ? r.bgPressed : 'transparent' }]}
    >
      {body}
    </Pressable>
  );
}

/** Grouped inset card of rows with inset hairlines between them (listRow.groupBg / groupRadius), optional sans group head. */
export function ListGroup({ title, children, testID }: { title?: string; children: ReactNode; testID?: string }) {
  const t = useTheme();
  const r = t.components.listRow;
  const rows = Children.toArray(children);
  return (
    <View testID={testID} style={{ gap: t.space[2] }}>
      {title ? (
        <Txt accessibilityRole="header" variant="section">
          {title}
        </Txt>
      ) : null}
      <View
        style={{
          backgroundColor: r.groupBg,
          borderRadius: r.groupRadius,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: t.colors.border,
          borderTopColor: t.dark ? t.colors.sheenEdge : t.colors.border,
        }}
      >
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={{ height: 1, marginLeft: r.dividerInset, marginRight: r.paddingX, backgroundColor: r.divider }} importantForAccessibility="no" /> : null}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}
