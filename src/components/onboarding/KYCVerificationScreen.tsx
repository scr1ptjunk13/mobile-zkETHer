import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { globalStyles } from '../../styles/globalStyles';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

type KYCStep = 'form' | 'verifying' | 'success';

export default function KYCVerificationScreen() {
  const { setCurrentStep, setKYCData } = useOnboarding();
  
  const [step, setStep] = useState<KYCStep>('form');
  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    aadhaarNumber: '',
    panNumber: '',
    phoneNumber: '',
  });
  
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const nextStep = useCallback(() => {
    setCurrentStep('keys' as any);
  }, [setCurrentStep]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatAadhaar = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 12)}`;
  };

  const getVerificationStep = () => {
    if (progress < 25) return "Connecting to government database";
    if (progress < 50) return "Validating document authenticity";
    if (progress < 75) return "Validating PAN information...";
    return "Verifying personal details...";
  };

  const isFormValid = React.useMemo(() => {
    return formData.fullName.trim().length >= 2 && 
           formData.aadhaarNumber.replace(/\D/g, '').length === 12 &&
           formData.panNumber.length === 10 &&
           formData.phoneNumber.replace(/\D/g, '').length === 10;
  }, [formData]);

  const handleVerify = useCallback(async () => {
    if (!isFormValid) return;
    
    setStep('verifying');
    setProgress(0);
    
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    // Mock verification process with smoother progress
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          
          setStep('success');
          
          // Use setTimeout to avoid setState during render
          setTimeout(() => {
            const kycData = {
              fullName: formData.fullName,
              aadhaarNumber: formData.aadhaarNumber,
              panNumber: formData.panNumber.toUpperCase(),
              phoneNumber: formData.phoneNumber,
              isVerified: true,
              verificationDate: new Date().toISOString(),
            };
            
            setKYCData(kycData);
            
            // Auto proceed after showing success
            setTimeout(() => {
              nextStep();
            }, 2000);
          }, 0);
          
          return 100;
        }
        return prev + Math.random() * 8 + 2; // Smoother progress increments
      });
    }, 150); // Faster updates for smoother animation
  }, [isFormValid, formData, setKYCData, nextStep]);


  const renderFormStep = () => (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>KYC Verification</Text>
      </View>

      {/* Progress Dots */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressDot, styles.progressDotCompleted]} />
        <View style={[styles.progressDot, styles.progressDotCompleted]} />
        <View style={[styles.progressDot, styles.progressDotActive]} />
        <View style={styles.progressDot} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <CardContent>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>✓</Text>
                <Text style={styles.cardTitle}>Complete KYC Verification</Text>
                <Text style={styles.cardSubtitle}>Required for regulatory compliance in India</Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={styles.input}
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                    placeholder="Enter your full name as per Aadhaar"
                    placeholderTextColor="#888888"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Aadhaar Number <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[
                      styles.input,
                      formData.aadhaarNumber && formData.aadhaarNumber.replace(/\D/g, '').length !== 12 && styles.inputError
                    ]}
                    value={formatAadhaar(formData.aadhaarNumber)}
                    onChangeText={(value) => handleInputChange('aadhaarNumber', value.replace(/\D/g, ''))}
                    placeholder="XXXX XXXX XXXX"
                    placeholderTextColor="#888888"
                    keyboardType="numeric"
                    maxLength={14}
                  />
                  {formData.aadhaarNumber && formData.aadhaarNumber.replace(/\D/g, '').length !== 12 && (
                    <Text style={styles.errorText}>Aadhaar number must be 12 digits</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PAN Number <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[
                      styles.input,
                      formData.panNumber && formData.panNumber.length !== 10 && styles.inputError
                    ]}
                    value={formData.panNumber}
                    onChangeText={(value) => handleInputChange('panNumber', value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    placeholderTextColor="#888888"
                    maxLength={10}
                  />
                  {formData.panNumber && formData.panNumber.length !== 10 && (
                    <Text style={styles.errorText}>PAN number must be 10 characters</Text>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Phone Number <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[
                      styles.input,
                      formData.phoneNumber && formData.phoneNumber.replace(/\D/g, '').length !== 10 && styles.inputError
                    ]}
                    value={formData.phoneNumber}
                    onChangeText={(value) => handleInputChange('phoneNumber', value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    placeholderTextColor="#888888"
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {formData.phoneNumber && formData.phoneNumber.replace(/\D/g, '').length !== 10 && (
                    <Text style={styles.errorText}>Phone number must be 10 digits</Text>
                  )}
                </View>
              </View>

            </CardContent>
          </Card>

          <Button
            title="VERIFY WITH DIGILOCKER"
            onPress={handleVerify}
            disabled={!isFormValid}
            style={styles.verifyButton}
          />

          <Text style={styles.footer}>
            Your information is securely verified through government databases and encrypted for privacy protection.
          </Text>
        </View>
      </ScrollView>
    </View>
  );

  const renderVerifyingStep = () => (
    <View style={globalStyles.container}>
      <View style={styles.verifyingContainer}>
        <View style={styles.verifyingContent}>
          {/* Shield Icon */}
          <View style={styles.shieldContainer}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>
          
          {/* Title and Progress */}
          <Text style={styles.verifyingTitle}>Verifying KYC</Text>
          <Text style={styles.progressText}>
            Progress: <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </Text>
          
          {/* Dot Progress Animation */}
          <View style={styles.dotProgressContainer}>
            {Array.from({ length: 25 }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i < Math.floor(progress / 4) ? styles.progressDotFilled : styles.progressDotEmpty
                ]}
              />
            ))}
          </View>
          
          {/* Progress Card */}
          <Card style={styles.progressCard}>
            <CardContent>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressStepText}>{getVerificationStep()}</Text>
              </View>
            </CardContent>
          </Card>
          
          {/* Verification Steps with Checkmarks */}
          <View style={styles.verificationSteps}>
            <Text style={[styles.stepText, progress >= 25 && styles.stepTextCompleted]}>
              {progress >= 25 ? '✓' : '•'} Connecting to government database
            </Text>
            <Text style={[styles.stepText, progress >= 50 && styles.stepTextCompleted]}>
              {progress >= 50 ? '✓' : '•'} Validating document authenticity
            </Text>
            <Text style={[styles.stepText, progress >= 75 && styles.stepTextCompleted]}>
              {progress >= 75 ? '✓' : '•'} Verifying personal details...
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {step === 'form' && renderFormStep()}
      {step === 'verifying' && renderVerifyingStep()}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    marginRight: 16,
  },
  backArrow: {
    fontSize: 18,
    color: '#ffffff',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    fontFamily: 'monospace',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333333',
    marginHorizontal: 2,
  },
  progressDotCompleted: {
    backgroundColor: '#00ff88',
  },
  progressDotActive: {
    backgroundColor: '#00ff88',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  card: {
    marginBottom: 30,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
  },
  cardHeader: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  cardIcon: {
    fontSize: 16,
    backgroundColor: '#00ff88',
    color: '#000000',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888888',
  },
  form: {
    marginBottom: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 8,
  },
  required: {
    color: '#ff4444',
  },
  input: {
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
  },
  verifyButton: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    paddingVertical: 16,
  },
  footer: {
    fontSize: 12,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  // Verifying step styles
  verifyingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  verifyingContent: {
    alignItems: 'center',
    width: '100%',
  },
  shieldContainer: {
    width: 64,
    height: 64,
    backgroundColor: '#00ff88',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    opacity: 0.2,
  },
  shieldIcon: {
    fontSize: 32,
    color: '#00ff88',
  },
  verifyingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 24,
  },
  progressPercentage: {
    color: '#00ff88',
    fontFamily: 'monospace',
  },
  progressCard: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  progressBarContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00ff88',
    borderRadius: 4,
  },
  progressStepText: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  verificationSteps: {
    alignItems: 'flex-start',
    gap: 4,
  },
  stepText: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 2,
  },
  disabledButton: {
    opacity: 0.5,
  },
  debugText: {
    fontSize: 12,
    color: '#00ff88',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'monospace',
  },
  inputError: {
    borderColor: '#ff4444',
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    color: '#ff4444',
    marginTop: 4,
    marginLeft: 4,
  },
  dotProgressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    flexWrap: 'wrap',
    width: '100%',
  },
  progressDotFilled: {
    backgroundColor: '#00ff88',
  },
  progressDotEmpty: {
    backgroundColor: '#333333',
  },
  stepTextCompleted: {
    color: '#00ff88',
  },
});
