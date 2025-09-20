// AppKit Wagmi configuration for zkETHer
import '@walletconnect/react-native-compat';
import { defaultWagmiConfig, createAppKit } from '@reown/appkit-wagmi-react-native';
import { mainnet, polygon, arbitrum, base, optimism } from '@wagmi/core/chains';
import { QueryClient } from '@tanstack/react-query';

// Project ID from https://cloud.walletconnect.com
export const projectId = '10a7a0c3bff08e7c28df40c7c67eb0fa';

export const metadata = {
  name: 'zkETHer',
  description: 'Privacy-focused Ethereum wallet mobile app',
  url: 'https://zkether.com',
  icons: ['https://zkether.com/icon.png'],
  redirect: {
    native: 'zkether://',
    universal: 'https://zkether.com',
  },
};

export const chains = [mainnet, polygon, arbitrum, base, optimism] as const;

export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
});

export const queryClient = new QueryClient();

// Initialize AppKit
export const initializeAppKit = () => {
  createAppKit({
    projectId,
    metadata,
    wagmiConfig,
    defaultChain: mainnet,
    enableAnalytics: true,
  });
};
