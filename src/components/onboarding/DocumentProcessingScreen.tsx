import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { colors } from '../../styles/colors';
import { Card, CardContent } from '../ui/Card';

interface DocumentProcessingScreenProps {
  onComplete: (extractedData: any) => void;
}

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed';
}

export default function DocumentProcessingScreen({ onComplete }: DocumentProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [extractedData] = useState({
    name: 'Rajesh Kumar Singh',
    dob: '15/01/1990',
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    address: '123 MG Road, Bangalore, Karnataka 560001',
  });

  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: '1', label: 'Aadhaar OCR complete', status: 'pending' },
    { id: '2', label: 'PAN OCR complete', status: 'pending' },
    { id: '3', label: 'DigiLocker verification...', status: 'pending' },
    { id: '4', label: 'Income Tax API check...', status: 'pending' },
  ]);

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start loading animation
    Animated.loop(
      Animated.timing(loadingAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Start processing simulation
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 5 + 2;
        
        // Update steps based on progress
        if (newProgress >= 25 && steps[0].status === 'pending') {
          setSteps(prevSteps => 
            prevSteps.map((step, index) => 
              index === 0 ? { ...step, status: 'completed' } : step
            )
          );
          setCurrentStep(1);
        }
        
        if (newProgress >= 50 && steps[1].status === 'pending') {
          setSteps(prevSteps => 
            prevSteps.map((step, index) => 
              index === 1 ? { ...step, status: 'completed' } : step
            )
          );
          setCurrentStep(2);
        }
        
        if (newProgress >= 75 && steps[2].status === 'pending') {
          setSteps(prevSteps => 
            prevSteps.map((step, index) => 
              index === 2 ? { ...step, status: 'completed' } : step
            )
          );
          setCurrentStep(3);
        }
        
        if (newProgress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          
          setSteps(prevSteps => 
            prevSteps.map(step => ({ ...step, status: 'completed' }))
          );
          
          // Complete processing after a short delay
          setTimeout(() => {
            onComplete(extractedData);
          }, 1500);
          
          return 100;
        }
        
        return newProgress;
      });
    }, 200);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [onComplete, extractedData, steps]);

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return '✓';
      case 'processing':
        return '⏳';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return colors.accent;
      case 'processing':
        return '#fbbf24';
      default:
        return colors.text.secondary;
    }
  };

  const rotateInterpolate = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={globalStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>KYC Verification</Text>
      </View>

      {/* Processing Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Processing Documents</Text>
      </View>

      <View style={styles.content}>
        {/* Loading Animation */}
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingIcon,
              { transform: [{ rotate: rotateInterpolate }] }
            ]}
          >
            <Text style={styles.loadingText}>⚙️</Text>
          </Animated.View>
          <Text style={styles.loadingLabel}>Extracting information...</Text>
        </View>

        {/* Processing Steps */}
        <Card style={styles.stepsCard}>
          <CardContent>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.stepItem}>
                <Text style={[styles.stepIcon, { color: getStatusColor(step.status) }]}>
                  {getStatusIcon(step.status)}
                </Text>
                <Text style={[
                  styles.stepText,
                  step.status === 'completed' && styles.stepTextCompleted
                ]}>
                  {step.label}
                </Text>
              </View>
            ))}
          </CardContent>
        </Card>

        {/* Extracted Information */}
        <Card style={styles.extractedCard}>
          <CardContent>
            <Text style={styles.extractedTitle}>Extracted Information</Text>
            
            <View style={styles.extractedInfo}>
              <Text style={styles.extractedItem}>Name: {extractedData.name}</Text>
              <Text style={styles.extractedItem}>DOB: {extractedData.dob}</Text>
              <Text style={styles.extractedItem}>Aadhaar: {extractedData.aadhaar}</Text>
              <Text style={styles.extractedItem}>PAN: {extractedData.pan}</Text>
              <Text style={styles.extractedItem}>Address: {extractedData.address}</Text>
            </View>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusIcon}>🔄</Text>
          <Text style={styles.statusText}>Verifying with government APIs...</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  titleContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loadingIcon: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 32,
  },
  loadingLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  stepsCard: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepIcon: {
    fontSize: 14,
    marginRight: 12,
    width: 16,
  },
  stepText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    flex: 1,
  },
  stepTextCompleted: {
    color: colors.accent,
  },
  extractedCard: {
    marginBottom: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  extractedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  extractedInfo: {
    gap: 8,
  },
  extractedItem: {
    fontSize: 14,
    color: colors.text.primary,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
});
