import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: ethers.providers.Web3Provider | null;
  walletType: 'metamask' | 'walletconnect' | null;
  chainId: string | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

interface WalletContextType extends WalletState {
  connectWallet: (type: 'metamask' | 'walletconnect') => Promise<void>;
  disconnectWallet: () => Promise<void>;
  getBalance: () => Promise<void>;
  switchNetwork: (chainId: string) => Promise<void>;
  clearError: () => void;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  provider: null,
  walletType: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,
};

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>(initialState);

  // Load saved wallet connection on app start
  useEffect(() => {
    loadSavedConnection();
  }, []);

  const loadSavedConnection = async () => {
    try {
      const savedWallet = await AsyncStorage.getItem('wallet_connection');
      if (savedWallet) {
        const { walletType, address } = JSON.parse(savedWallet);
        // Attempt to reconnect
        await connectWallet(walletType);
      }
    } catch (error) {
      console.log('No saved wallet connection');
    }
  };

  const saveConnection = async (walletType: string, address: string) => {
    try {
      await AsyncStorage.setItem('wallet_connection', JSON.stringify({
        walletType,
        address,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save wallet connection:', error);
    }
  };

  const clearSavedConnection = async () => {
    try {
      await AsyncStorage.removeItem('wallet_connection');
    } catch (error) {
      console.error('Failed to clear saved connection:', error);
    }
  };

  const connectWallet = async (type: 'metamask' | 'walletconnect') => {
    setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      switch (type) {
        case 'metamask':
          await connectMetaMask();
          break;
        case 'walletconnect':
          await connectWalletConnect();
          break;
      }
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Connection failed'
      }));
    }
  };

  const connectMetaMask = async () => {
    try {
      // Import MetaMask SDK dynamically
      const { MetaMaskSDK } = await import('@metamask/sdk');
      
      const sdk = new MetaMaskSDK({
        dappMetadata: {
          name: 'zkETHer',
          url: 'https://zkether.app',
        },
        infuraAPIKey: process.env.EXPO_PUBLIC_INFURA_KEY || '',
      });

      const accounts = await sdk.connect();
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask');
      }

      const sdkProvider = sdk.getProvider();
      if (!sdkProvider) {
        throw new Error('No provider available from MetaMask SDK');
      }

      const provider = new ethers.providers.Web3Provider(sdkProvider as any);
      const network = await provider.getNetwork();
      const balance = await provider.getBalance(accounts[0]);

      setWalletState({
        isConnected: true,
        address: accounts[0],
        provider,
        walletType: 'metamask',
        chainId: network.chainId.toString(),
        balance: ethers.utils.formatEther(balance),
        isConnecting: false,
        error: null,
      });

      await saveConnection('metamask', accounts[0]);
    } catch (error: any) {
      throw new Error(`MetaMask connection failed: ${error.message}`);
    }
  };

  const connectWalletConnect = async () => {
    try {
      // Simplified WalletConnect implementation for now
      // This is a placeholder - full WalletConnect integration requires more setup
      
      // Simulate connection for demo purposes
      setTimeout(() => {
        const mockAddress = '0x742d35Cc6634C0532925a3b8D4C9db96590C4C5b';
        const mockProvider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/demo');
        
        setWalletState({
          isConnected: true,
          address: mockAddress,
          provider: mockProvider as any,
          walletType: 'walletconnect',
          chainId: '1',
          balance: '2.5',
          isConnecting: false,
          error: null,
        });
        
        saveConnection('walletconnect', mockAddress);
      }, 2000);

    } catch (error: any) {
      throw new Error(`WalletConnect connection failed: ${error.message}`);
    }
  };

  const disconnectWallet = async () => {
    try {
      // Disconnect based on wallet type
      if (walletState.walletType === 'metamask') {
        // MetaMask disconnect logic
      } else if (walletState.walletType === 'walletconnect') {
        // WalletConnect disconnect logic
      }

      setWalletState(initialState);
      await clearSavedConnection();
    } catch (error) {
      console.error('Disconnect failed:', error);
    }
  };

  const getBalance = async () => {
    if (!walletState.provider || !walletState.address) return;

    try {
      const balance = await walletState.provider.getBalance(walletState.address);
      setWalletState(prev => ({
        ...prev,
        balance: ethers.utils.formatEther(balance)
      }));
    } catch (error) {
      console.error('Failed to get balance:', error);
    }
  };

  const switchNetwork = async (chainId: string) => {
    if (!walletState.provider) return;

    try {
      await walletState.provider.send('wallet_switchEthereumChain', [
        { chainId: `0x${parseInt(chainId).toString(16)}` }
      ]);
      
      setWalletState(prev => ({ ...prev, chainId }));
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        error: `Network switch failed: ${error.message}`
      }));
    }
  };

  const clearError = () => {
    setWalletState(prev => ({ ...prev, error: null }));
  };

  const contextValue: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    getBalance,
    switchNetwork,
    clearError,
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
