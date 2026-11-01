import type { ReactNode } from 'react';
import { Text, View, type TextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Overline({ children, ...rest }: { children: ReactNode } & TextProps) {
  const t = useTheme();
  return (
    <Text {...rest} style={[t.type.overline, { color: t.colors.textMuted }, rest.style]}>
      {children}
    </Text>
  );
}

export function Body({ children, muted = false, ...rest }: { children: ReactNode; muted?: boolean } & TextProps) {
  const t = useTheme();
  return (
    <Text {...rest} style={[t.type.body, { color: muted ? t.colors.textMuted : t.colors.text }, rest.style]}>
      {children}
    </Text>
  );
}

export function Caption({ children, ...rest }: { children: ReactNode } & TextProps) {
  const t = useTheme();
  return (
    <Text {...rest} style={[t.type.caption, { color: t.colors.textMuted }, rest.style]}>
      {children}
    </Text>
  );
}

export function Section({ children, gap }: { children: ReactNode; gap?: number }) {
  const t = useTheme();
  return <View style={{ gap: gap ?? t.space[3] }}>{children}</View>;
}

/** Component tokens type textTransform / fontVariant as plain strings; RN wants its unions. */
export const textStyle = (s: object) => s as TextStyle;
