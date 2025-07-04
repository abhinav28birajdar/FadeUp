// App.tsx
import 'react-native-gesture-handler'; // Required for React Navigation
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TailwindProvider } from 'nativewind'; // Not always needed, depending on NativeWind setup

import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* TailwindProvider might not be necessary if using the Babel plugin setup */}
      {/* <TailwindProvider> */}
        <AppNavigator />
        <StatusBar style="auto" />
      {/* </TailwindProvider> */}
    </SafeAreaProvider>
  );
}