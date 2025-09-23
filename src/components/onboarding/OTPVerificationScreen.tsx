import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import Button from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import FirebaseAuthService from '../../services/firebaseAuth';
import { ConfirmationResult } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseConfig } from '../../config/firebase';

interface OTPVerificationScreenProps {
  phoneNumber: string;
  onVerified: () => void;
  onBack: () => void;
  onResendOTP: () => void;
}

export default function OTPVerificationScreen({ 
  phoneNumber, 
  onVerified, 
  onBack, 
  onResendOTP 
}: OTPVerificationScreenProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [showSkipOption, setShowSkipOption] = useState(false);
  const recaptchaVerifier = useRef<any>(null);
  
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Send OTP when component mounts
  useEffect(() => {
    const sendInitialOTP = async () => {
      try {
        const otpConfirmation = await FirebaseAuthService.sendOTP(phoneNumber, recaptchaVerifier.current);
        setConfirmation(otpConfirmation);
      } catch (error) {
        console.error('Firebase OTP Error:', error);
        setShowSkipOption(true);
        Alert.alert(
          'OTP Service Unavailable', 
          'Firebase billing needs to be enabled for SMS. You can skip this step for demo purposes.',
          [
            { text: 'Go Back', onPress: onBack },
            { text: 'Skip for Demo', onPress: () => onVerified() }
          ]
        );
      }
    };

    if (recaptchaVerifier.current) {
      sendInitialOTP();
    }
  }, [phoneNumber, onBack]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newOtp.every(digit => digit !== '') && !isVerifying) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    if (!confirmation) {
      Alert.alert('Error', 'Please wait for OTP to be sent');
      return;
    }

    setIsVerifying(true);
    
    try {
      const userCredential = await FirebaseAuthService.verifyOTP(confirmation, otpCode);
      
      if (userCredential) {
        // OTP verified successfully
        onVerified();
      } else {
        Alert.alert('Verification Failed', 'Please try again');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert('Invalid OTP', 'Please enter the correct OTP code');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (canResend) {
      try {
        const otpConfirmation = await FirebaseAuthService.sendOTP(phoneNumber, recaptchaVerifier.current);
        setConfirmation(otpConfirmation);
        setTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        onResendOTP();
        Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
      } catch (error) {
        Alert.alert('Error', 'Failed to resend OTP. Please try again.');
      }
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return `+91 ${phone.slice(0, 5)} ${phone.slice(5)}`;
  };

  return (
    <View style={globalStyles.container}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
      />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backArrow}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>OTP Verification</Text>
      </View>

      <View style={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard}>
          <CardContent>
            <View style={styles.infoContent}>
              <Text style={styles.infoIcon}>📱</Text>
              <Text style={styles.infoTitle}>Verify Your Phone Number</Text>
              <Text style={styles.infoText}>
                We've sent a 6-digit verification code to{'\n'}
                <Text style={styles.phoneNumber}>{formatPhoneNumber(phoneNumber)}</Text>
              </Text>
            </View>
          </CardContent>
        </Card>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <Text style={styles.otpLabel}>Enter OTP</Text>
          <View style={styles.otpInputContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  isVerifying && styles.otpInputDisabled
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                keyboardType="numeric"
                maxLength={1}
                editable={!isVerifying}
                selectTextOnFocus
              />
            ))}
          </View>
        </View>

        {/* Timer and Resend */}
        <View style={styles.resendContainer}>
          {!canResend ? (
            <Text style={styles.timerText}>
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={isVerifying ? "Verifying..." : "Verify OTP"}
            onPress={() => handleVerifyOTP(otp.join(''))}
            disabled={otp.some(digit => digit === '') || isVerifying}
            style={[
              styles.verifyButton,
              (otp.some(digit => digit === '') || isVerifying) && styles.disabledButton
            ]}
          />
          
          {showSkipOption && (
            <TouchableOpacity 
              style={styles.skipButton}
              onPress={() => onVerified()}
            >
              <Text style={styles.skipButtonText}>Skip for Demo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Help Text */}
        <Text style={styles.helpText}>
          Didn't receive the code? Check your SMS or try resending
        </Text>
      </View>
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
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  backArrow: {
    fontSize: 16,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  infoCard: {
    marginBottom: 30,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoContent: {
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
  phoneNumber: {
    color: colors.accent,
    fontWeight: '600',
  },
  otpContainer: {
    marginBottom: 30,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    backgroundColor: colors.background,
    fontFamily: 'monospace',
  },
  otpInputFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
  otpInputDisabled: {
    opacity: 0.6,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  resendText: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 20,
  },
  verifyButton: {
    backgroundColor: colors.button.primary,
  },
  disabledButton: {
    backgroundColor: colors.text.secondary,
    opacity: 0.6,
  },
  skipButton: {
    marginTop: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.accent,
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 20,
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});
