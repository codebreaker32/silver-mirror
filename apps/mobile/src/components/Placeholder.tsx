import { Text, View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

export function Placeholder({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.bg }}>
      <Text style={[theme.type.title, { color: theme.colors.text }]}>{title}</Text>
    </View>
  );
}
