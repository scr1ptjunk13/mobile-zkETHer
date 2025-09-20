import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { colors } from './src/styles/colors';
import { globalStyles } from './src/styles/globalStyles';
import OnboardingFlow from './src/components/OnboardingFlow';

export default function App() {
  return (
    <OnboardingProvider>
      <SafeAreaView style={globalStyles.safeArea}>
        <StatusBar style="light" backgroundColor={colors.background} />
        <OnboardingFlow />
      </SafeAreaView>
    </OnboardingProvider>
  );
}
