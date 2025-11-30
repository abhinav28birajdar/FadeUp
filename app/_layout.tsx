import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { AppNavigator } from '../src/screens/AppNavigator';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AppNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
