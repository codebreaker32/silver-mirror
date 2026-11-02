import type { ReactNode } from 'react';
import { Text, View, type TextProps, type TextStyle } from 'react-native';
import type { TypeStyleName } from '@skinkey/design';
import { useTheme } from '@/theme/ThemeProvider';
import { Icon } from './Icon';

export type TextTone = 'default' | 'muted' | 'subtle';

/** Component tokens type textTransform / fontVariant as plain strings; RN wants its unions. */
export const textStyle = (s: object) => s as TextStyle;

function useToneColor(tone: TextTone) {
  const t = useTheme();
  return tone === 'muted' ? t.colors.textMuted : tone === 'subtle' ? t.colors.textSubtle : t.colors.text;
}

interface TxtProps extends TextProps {
  /** A `typography` style name. 2.4: display and title are Noto Serif Display (screen titles, product names); the rest is Geist. */
  variant?: TypeStyleName;
  tone?: TextTone;
  children?: ReactNode;
}

/** Text in one typography token, sp scaling capped by `textProps` (maxFontSizeMultiplier 2.0). */
export function Txt({ variant = 'body', tone = 'default', style, children, ...rest }: TxtProps) {
  const t = useTheme();
  const color = useToneColor(tone);
  return (
    <Text {...t.textProps[variant]} {...rest} style={[t.typography[variant], { color }, style]}>
      {children}
    </Text>
  );
}

/** Screen / section heading with the header role. display = Home greeting and empty states; title = screen titles. */
export function Heading({ children, level = 'title', style, ...rest }: { children: ReactNode; level?: 'display' | 'title' | 'headline' | 'section' } & TextProps) {
  return (
    <Txt accessibilityRole="header" variant={level} {...rest} style={style}>
      {children}
    </Txt>
  );
}

export function Body({ children, muted = false, small = false, strong = false, ...rest }: { children: ReactNode; muted?: boolean; small?: boolean; strong?: boolean } & TextProps) {
  return (
    <Txt variant={small ? 'bodySm' : strong ? 'bodyStrong' : 'body'} tone={muted ? 'muted' : 'default'} {...rest}>
      {children}
    </Txt>
  );
}

export function Caption({ children, ...rest }: { children: ReactNode } & TextProps) {
  return (
    <Txt variant="caption" tone="muted" {...rest}>
      {children}
    </Txt>
  );
}

/** Sentence-case small label (ledger keys, meta). Never a tracked-caps eyebrow above a heading. */
export function Overline({ children, ...rest }: { children: ReactNode } & TextProps) {
  return (
    <Txt variant="overline" tone="muted" {...rest}>
      {children}
    </Txt>
  );
}

/** Muted supporting line with a leading info icon. */
export function Note({ children }: { children: ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: t.space[2], alignItems: 'flex-start' }}>
      <View style={{ paddingTop: 2 }}>
        <Icon name="info" size={t.icon.sm} color={t.colors.textMuted} />
      </View>
      <Txt variant="bodySm" tone="muted" style={{ flex: 1 }}>
        {children}
      </Txt>
    </View>
  );
}

/** Vertical stack with a token gap (default space.3). */
export function Section({ children, gap }: { children: ReactNode; gap?: number }) {
  const t = useTheme();
  return <View style={{ gap: gap ?? t.space[3] }}>{children}</View>;
}
