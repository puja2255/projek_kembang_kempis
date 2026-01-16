import { Pressable, Text } from 'react-native';
import { useTheme } from './ThemeContext';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        padding: 6,
        borderRadius: 20,
        backgroundColor: isDark ? '#333' : '#EEE',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: 18 }}>
        {isDark ? '🌙' : '☀️'}
      </Text>
    </Pressable>
  );
}