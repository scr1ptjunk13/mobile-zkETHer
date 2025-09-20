export interface KYCData {
  fullName: string;
  aadhaarNumber: string;
  panNumber: string;
  phoneNumber: string;
  isVerified: boolean;
  verificationDate: string;
}

export type OnboardingStep = 'welcome' | 'wallet' | 'kyc' | 'keys' | 'complete';

export interface OnboardingContextType {
  currentStep: OnboardingStep;
  walletAddress: string;
  walletBalance: number;
  walletType: string;
  isKYCCompleted: boolean;
  kycData: KYCData | null;
  setCurrentStep: (step: OnboardingStep) => Promise<void>;
  nextStep: () => Promise<void>;
  setWalletConnection: (address: string, balance: number, type: string) => Promise<void>;
  setKYCData: (data: KYCData) => Promise<void>;
  completeKYC: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}
