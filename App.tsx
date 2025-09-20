import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { colors } from './src/styles/colors';
import { globalStyles } from './src/styles/globalStyles';
import { StyleSheet, View } from 'react-native';
// import { WalletConnectModal } from '@walletconnect/modal-react-native';
import OnboardingFlow from './src/components/OnboardingFlow';
// import { projectId, providerMetadata } from './src/config/walletConnect';

export default function App() {
  return (
    <OnboardingProvider>
      <SafeAreaView style={globalStyles.safeArea}>
        <StatusBar style="light" backgroundColor={colors.background} />
        <View style={styles.container}>
          <OnboardingFlow />
          {/* <WalletConnectModal 
            projectId={projectId} 
            providerMetadata={providerMetadata} 
          /> */}
        </View>
      </SafeAreaView>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
