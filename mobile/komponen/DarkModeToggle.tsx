import { Pressable, Text } from 'react-native';
import { useTheme } from './ThemeContext';

export default function DarkModeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        padding: 10,
        borderRadius: 8,
        backgroundColor: theme === 'dark' ? '#333' : '#DDD',
      }}
    >
      <Text style={{ color: theme === 'dark' ? '#FFF' : '#000' }}>
        {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
      </Text>
    </Pressable>
  );
}