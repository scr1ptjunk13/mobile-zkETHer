import React, { useState, useCallback } from 'react';
import { View } from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { globalStyles } from '../../styles/globalStyles';
import ContactInformationScreen from './ContactInformationScreen';
import OTPVerificationScreen from './OTPVerificationScreen';
import DocumentUploadScreen from './DocumentUploadScreen';
import DocumentProcessingScreen from './DocumentProcessingScreen';
import BiometricVerificationScreen from './BiometricVerificationScreen';
import VerificationProcessingScreen from './VerificationProcessingScreen';
import VerificationSuccessScreen from './VerificationSuccessScreen';
import { sandboxApiService } from '../../services/sandboxApi';
import { onchainIdService } from '../../services/onchainIdService';

type KYCStep = 'contact' | 'otp' | 'documents' | 'biometric' | 'processing' | 'verifying' | 'success';

export default function KYCVerificationScreen() {
  const { setCurrentStep, setKYCData } = useOnboarding();
  
  const [step, setStep] = useState<KYCStep>('contact');
  const [kycFormData, setKycFormData] = useState({
    phoneNumber: '',
    email: '',
    aadhaarDocument: null as string | null,
    panDocument: null as string | null,
    biometricData: null as string | null,
    extractedData: null as any,
  });
  
  const handleContactNext = useCallback((contactData: { phoneNumber: string; email: string }) => {
    setKycFormData(prev => ({ ...prev, ...contactData }));
    setStep('otp');
  }, []);

  const handleOTPVerified = useCallback(() => {
    setStep('documents');
  }, []);

  const handleResendOTP = useCallback(() => {
    // Mock OTP resend - in real implementation, this would call Firebase
    console.log('Resending OTP to:', kycFormData.phoneNumber);
  }, [kycFormData.phoneNumber]);

  const handleDocumentsNext = useCallback((documentData: { aadhaarDocument: string | null; panDocument: string | null }) => {
    setKycFormData(prev => ({ ...prev, ...documentData }));
    setStep('biometric'); // Move to biometric BEFORE processing
  }, []);

  const handleBiometricNext = useCallback((biometricData: { selfieData: string }) => {
    setKycFormData(prev => ({ ...prev, biometricData: biometricData.selfieData }));
    setStep('processing'); // Now go to processing after biometric
  }, []);

  const handleProcessingComplete = useCallback(async (extractedData: any) => {
    setKycFormData(prev => ({ ...prev, extractedData }));
    setStep('verifying');
  }, []);

  const handleVerificationComplete = useCallback(() => {
    setStep('success');
  }, []);

  const handleGenerateKeys = useCallback(() => {
    // Save all KYC data
    const finalKycData = {
      phoneNumber: kycFormData.phoneNumber,
      email: kycFormData.email,
      aadhaarDocument: kycFormData.aadhaarDocument,
      panDocument: kycFormData.panDocument,
      biometricData: kycFormData.biometricData,
      extractedData: kycFormData.extractedData,
      isVerified: true,
      verificationDate: new Date().toISOString(),
    };
    
    setKYCData(finalKycData);
    setCurrentStep('keys' as any);
  }, [kycFormData, setKYCData, setCurrentStep]);

  const handleBack = useCallback(() => {
    switch (step) {
      case 'otp':
        setStep('contact');
        break;
      case 'documents':
        setStep('otp');
        break;
      case 'biometric':
        setStep('documents');
        break;
      case 'processing':
        setStep('biometric');
        break;
      default:
        // For other steps, you might want to handle differently
        break;
    }
  }, [step]);





  return (
    <View style={globalStyles.container}>
      {step === 'contact' && (
        <ContactInformationScreen 
          onNext={handleContactNext}
          onBack={handleBack}
        />
      )}
      {step === 'otp' && (
        <OTPVerificationScreen 
          phoneNumber={kycFormData.phoneNumber}
          onVerified={handleOTPVerified}
          onBack={handleBack}
          onResendOTP={handleResendOTP}
        />
      )}
      {step === 'documents' && (
        <DocumentUploadScreen 
          onNext={handleDocumentsNext}
          onBack={handleBack}
        />
      )}
      {step === 'biometric' && (
        <BiometricVerificationScreen 
          onNext={handleBiometricNext}
          onBack={handleBack}
        />
      )}
      {step === 'processing' && (
        <DocumentProcessingScreen 
          onComplete={handleProcessingComplete}
        />
      )}
      {step === 'verifying' && (
        <VerificationProcessingScreen 
          onComplete={handleVerificationComplete}
        />
      )}
      {step === 'success' && (
        <VerificationSuccessScreen 
          onGenerateKeys={handleGenerateKeys}
          onchainId={kycFormData.extractedData?.onchainId}
        />
      )}
    </View>
  );
}

