import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Dimensions,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { barberRegistrationService, RegistrationStep } from '../../src/services/barberRegistrationService';
import { useAuthStore } from '../../src/store/authStore';

const { width } = Dimensions.get('window');

export default function BarberRegistration() {
  const [steps, setSteps] = useState<RegistrationStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    initializeRegistration();
  }, []);

  const initializeRegistration = async () => {
    try {
      setLoading(true);
      const registrationSteps = barberRegistrationService.getRegistrationSteps();
      setSteps(registrationSteps);
      
      // Load any saved progress
      if (user?.id) {
        // Check for saved progress and update step completion status
        // This would load from the database in a real implementation
      }
    } catch (error) {
      console.error('Error initializing registration:', error);
      Alert.alert('Error', 'Failed to load registration steps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStepPress = (index: number) => {
    const step = steps[index];
    
    // Check if this step can be accessed
    if (index > 0) {
      const previousStep = steps[index - 1];
      if (previousStep.isRequired && !previousStep.isCompleted) {
        Alert.alert(
          'Complete Previous Step',
          `Please complete "${previousStep.title}" before proceeding.`
        );
        return;
      }
    }

    setCurrentStepIndex(index);
    navigateToStep(step);
  };

  const navigateToStep = (step: RegistrationStep) => {
    switch (step.id) {
      case 'personal_info':
        Alert.alert('Coming Soon', 'Personal info step will be implemented next');
        break;
      case 'shop_details':
        Alert.alert('Coming Soon', 'Shop details step will be implemented next');
        break;
      case 'location':
        Alert.alert('Coming Soon', 'Location step will be implemented next');
        break;
      case 'business_info':
        Alert.alert('Coming Soon', 'Business info step will be implemented next');
        break;
      case 'services':
        Alert.alert('Coming Soon', 'Services step will be implemented next');
        break;
      case 'hours':
        Alert.alert('Coming Soon', 'Hours step will be implemented next');
        break;
      case 'media':
        Alert.alert('Coming Soon', 'Media step will be implemented next');
        break;
      case 'review':
        Alert.alert('Coming Soon', 'Review step will be implemented next');
        break;
      default:
        console.warn('Unknown step:', step.id);
    }
  };

  const getProgressPercentage = () => {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return (completedSteps / steps.length) * 100;
  };

  const renderProgressBar = () => (
    <MotiView
      from={{ opacity: 0, translateY: -20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 600 }}
      style={styles.progressContainer}
    >
      <BlurView intensity={20} style={styles.progressBlur}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Registration Progress</Text>
          <Text style={styles.progressPercentage}>
            {Math.round(getProgressPercentage())}%
          </Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <MotiView
              from={{ width: 0 }}
              animate={{ width: `${getProgressPercentage()}%` }}
              transition={{ duration: 800, delay: 200 }}
              style={styles.progressBarFill}
            />
          </View>
        </View>
        
        <Text style={styles.progressSubtitle}>
          {steps.filter(step => step.isCompleted).length} of {steps.length} steps completed
        </Text>
      </BlurView>
    </MotiView>
  );

  const renderStepItem = (step: RegistrationStep, index: number) => {
    const isAccessible = index === 0 || !steps[index - 1]?.isRequired || steps[index - 1]?.isCompleted;
    const isCurrent = index === currentStepIndex;
    
    return (
      <MotiView
        key={step.id}
        from={{ opacity: 0, translateX: -50 }}
        animate={{ opacity: 1, translateX: 0 }}
        transition={{ duration: 500, delay: index * 100 }}
        style={styles.stepContainer}
      >
        <TouchableOpacity
          style={[
            styles.stepCard,
            step.isCompleted && styles.stepCardCompleted,
            isCurrent && styles.stepCardCurrent,
            !isAccessible && styles.stepCardDisabled,
          ]}
          onPress={() => isAccessible && handleStepPress(index)}
          disabled={!isAccessible}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              step.isCompleted
                ? ['#10B981', '#059669']
                : isCurrent
                ? ['#4facfe', '#00f2fe']
                : isAccessible
                ? ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                : ['rgba(100, 100, 100, 0.1)', 'rgba(100, 100, 100, 0.05)']
            }
            style={styles.stepGradient}
          >
            <View style={styles.stepContent}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                  <View style={[
                    styles.stepIcon,
                    step.isCompleted && styles.stepIconCompleted,
                    isCurrent && styles.stepIconCurrent,
                    !isAccessible && styles.stepIconDisabled,
                  ]}>
                    {step.isCompleted ? (
                      <Ionicons name="checkmark" size={20} color="white" />
                    ) : (
                      <Text style={[
                        styles.stepNumber,
                        isCurrent && styles.stepNumberCurrent,
                        !isAccessible && styles.stepNumberDisabled,
                      ]}>
                        {index + 1}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.stepInfo}>
                  <Text style={[
                    styles.stepTitle,
                    !isAccessible && styles.stepTitleDisabled,
                  ]}>
                    {step.title}
                  </Text>
                  <Text style={[
                    styles.stepDescription,
                    !isAccessible && styles.stepDescriptionDisabled,
                  ]}>
                    {step.description}
                  </Text>
                </View>
                
                <View style={styles.stepAction}>
                  {step.isRequired && (
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  )}
                  
                  <Ionicons
                    name={step.isCompleted ? "checkmark-circle" : "chevron-forward"}
                    size={24}
                    color={
                      step.isCompleted
                        ? "#10B981"
                        : !isAccessible
                        ? "#666"
                        : "#4facfe"
                    }
                  />
                </View>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </MotiView>
    );
  };

  const renderWelcomeHeader = () => (
    <MotiView
      from={{ opacity: 0, translateY: -30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 600 }}
      style={styles.welcomeContainer}
    >
      <BlurView intensity={20} style={styles.welcomeBlur}>
        <Text style={styles.welcomeTitle}>Welcome to FadeUp!</Text>
        <Text style={styles.welcomeSubtitle}>
          Let's get your barbershop registered and ready to serve customers.
        </Text>
        <Text style={styles.welcomeDescription}>
          Complete the registration steps below to start accepting bookings and managing your queue.
        </Text>
      </BlurView>
    </MotiView>
  );

  const renderActionButtons = () => (
    <MotiView
      from={{ opacity: 0, translateY: 50 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ duration: 600, delay: 300 }}
      style={styles.actionContainer}
    >
      <TouchableOpacity
        style={styles.helpButton}
        onPress={() => Alert.alert(
          'Need Help?',
          'Contact our support team at support@fadeup.com or call +1 (555) 123-4567'
        )}
      >
        <Ionicons name="help-circle-outline" size={20} color="#4facfe" />
        <Text style={styles.helpButtonText}>Need Help?</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          const firstIncompleteStep = steps.find(step => !step.isCompleted);
          if (firstIncompleteStep) {
            const index = steps.indexOf(firstIncompleteStep);
            handleStepPress(index);
          }
        }}
      >
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={styles.startGradient}
        >
          <Text style={styles.startButtonText}>Continue Registration</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading registration...</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {renderWelcomeHeader()}
          {renderProgressBar()}
          
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => renderStepItem(step, index))}
          </View>
          
          {renderActionButtons()}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
  welcomeContainer: {
    margin: 20,
    marginBottom: 15,
    borderRadius: 20,
    overflow: 'hidden',
  },
  welcomeBlur: {
    padding: 24,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 24,
  },
  welcomeDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    margin: 20,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
  },
  progressBlur: {
    padding: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressPercentage: {
    color: '#4facfe',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4facfe',
    borderRadius: 4,
  },
  progressSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  stepsContainer: {
    paddingHorizontal: 20,
  },
  stepContainer: {
    marginBottom: 16,
  },
  stepCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  stepCardCompleted: {
    borderColor: '#10B981',
  },
  stepCardCurrent: {
    borderColor: '#4facfe',
    borderWidth: 2,
  },
  stepCardDisabled: {
    opacity: 0.5,
  },
  stepGradient: {
    flex: 1,
  },
  stepContent: {
    padding: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    marginRight: 16,
  },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepIconCompleted: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepIconCurrent: {
    backgroundColor: '#4facfe',
    borderColor: '#4facfe',
  },
  stepIconDisabled: {
    backgroundColor: 'rgba(100, 100, 100, 0.2)',
    borderColor: 'rgba(100, 100, 100, 0.3)',
  },
  stepNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  stepNumberCurrent: {
    color: 'white',
  },
  stepNumberDisabled: {
    color: '#666',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stepTitleDisabled: {
    color: '#999',
  },
  stepDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  stepDescriptionDisabled: {
    color: '#666',
  },
  stepAction: {
    alignItems: 'flex-end',
  },
  requiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  requiredText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  helpButtonText: {
    color: '#4facfe',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  startButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

