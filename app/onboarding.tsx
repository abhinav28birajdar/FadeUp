import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import PagerView from 'react-native-pager-view';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Onboarding data for different user types
const onboardingData = {
  customer: [
    {
      id: 1,
      title: 'Find Your Perfect Barber',
      subtitle: 'Discover skilled barbers near you',
      description: 'Browse through verified barber shops within 10km radius. View ratings, services, and book your appointment instantly.',
      image: require('../../assets/images/onboarding-customer-1.png'),
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: 2,
      title: 'Real-time Queue Updates',
      subtitle: 'Never wait in uncertainty',
      description: 'Join virtual queues and get real-time updates on your position. Know exactly when it\'s your turn.',
      image: require('../../assets/images/onboarding-customer-2.png'),
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: 3,
      title: 'Book & Relax',
      subtitle: 'Seamless booking experience',
      description: 'Choose your services, pick your preferred time, and let us handle the rest. Rate and review after your service.',
      image: require('../../assets/images/onboarding-customer-3.png'),
      gradient: ['#4facfe', '#00f2fe'],
    },
  ],
  barber: [
    {
      id: 1,
      title: 'Grow Your Business',
      subtitle: 'Reach more customers',
      description: 'List your services, showcase your skills, and attract customers within 10km radius of your shop.',
      image: require('../../assets/images/onboarding-barber-1.png'),
      gradient: ['#fa709a', '#fee140'],
    },
    {
      id: 2,
      title: 'Manage Your Queue',
      subtitle: 'Efficient customer management',
      description: 'Track your queue in real-time, update customer status, and optimize your service flow for maximum efficiency.',
      image: require('../../assets/images/onboarding-barber-2.png'),
      gradient: ['#a8edea', '#fed6e3'],
    },
    {
      id: 3,
      title: 'Build Your Reputation',
      subtitle: 'Earn trust through reviews',
      description: 'Deliver excellent service, receive positive reviews, and build a strong reputation that attracts more customers.',
      image: require('../../assets/images/onboarding-barber-3.png'),
      gradient: ['#ff9a9e', '#fecfef'],
    },
  ],
};

interface OnboardingScreenProps {
  userType?: 'customer' | 'barber';
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ userType }) => {
  const [currentUserType, setCurrentUserType] = useState<'customer' | 'barber'>(userType || 'customer');
  const [currentPage, setCurrentPage] = useState(0);
  const [showRoleSelection, setShowRoleSelection] = useState(!userType);
  
  const pagerRef = useRef<PagerView>(null);
  const fadeAnim = useSharedValue(1);
  const scaleAnim = useSharedValue(1);

  const data = onboardingData[currentUserType];

  const handleRoleSelect = (role: 'customer' | 'barber') => {
    setCurrentUserType(role);
    setShowRoleSelection(false);
    fadeAnim.value = withTiming(1, { duration: 500 });
  };

  const handleNext = () => {
    if (currentPage < data.length - 1) {
      pagerRef.current?.setPage(currentPage + 1);
    } else {
      // Navigate to authentication
      router.replace(`/(auth)/login?userType=${currentUserType}`);
    }
  };

  const handleSkip = () => {
    router.replace(`/(auth)/login?userType=${currentUserType}`);
  };

  const handlePageSelected = (e: any) => {
    setCurrentPage(e.nativeEvent.position);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
      transform: [{ scale: scaleAnim.value }],
    };
  });

  if (showRoleSelection) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.gradient}
        >
          <View style={styles.roleSelectionContainer}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/images/icon.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>FadeUp</Text>
              <Text style={styles.tagline}>Your Perfect Cut Awaits</Text>
            </View>

            <View style={styles.roleContainer}>
              <Text style={styles.roleTitle}>Choose Your Experience</Text>
              <Text style={styles.roleSubtitle}>
                Select how you'd like to use FadeUp
              </Text>

              <TouchableOpacity
                style={[styles.roleButton, styles.customerButton]}
                onPress={() => handleRoleSelect('customer')}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} style={styles.roleButtonBlur}>
                  <View style={styles.roleButtonContent}>
                    <Ionicons name="person" size={40} color="#4facfe" />
                    <View style={styles.roleButtonText}>
                      <Text style={styles.roleButtonTitle}>I'm a Customer</Text>
                      <Text style={styles.roleButtonDescription}>
                        Find and book barber services
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#4facfe" />
                  </View>
                </BlurView>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.roleButton, styles.barberButton]}
                onPress={() => handleRoleSelect('barber')}
                activeOpacity={0.8}
              >
                <BlurView intensity={20} style={styles.roleButtonBlur}>
                  <View style={styles.roleButtonContent}>
                    <Ionicons name="cut" size={40} color="#fa709a" />
                    <View style={styles.roleButtonText}>
                      <Text style={styles.roleButtonTitle}>I'm a Barber</Text>
                      <Text style={styles.roleButtonDescription}>
                        Manage my shop and customers
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fa709a" />
                  </View>
                </BlurView>
              </TouchableOpacity>
            </View>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                Premium barbering experience for everyone
              </Text>
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <PagerView
          ref={pagerRef}
          style={styles.pagerView}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          {data.map((item, index) => (
            <View key={item.id} style={styles.slide}>
              <LinearGradient
                colors={item.gradient}
                style={styles.gradient}
              >
                <View style={styles.slideContent}>
                  {/* Header with skip button */}
                  <View style={styles.header}>
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={() => setShowRoleSelection(true)}
                    >
                      <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleSkip}>
                      <Text style={styles.skipButton}>Skip</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Content */}
                  <View style={styles.contentContainer}>
                    <View style={styles.imageContainer}>
                      <Image
                        source={item.image}
                        style={styles.onboardingImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.textContainer}>
                      <Text style={styles.title}>{item.title}</Text>
                      <Text style={styles.subtitle}>{item.subtitle}</Text>
                      <Text style={styles.description}>{item.description}</Text>
                    </View>
                  </View>

                  {/* Footer */}
                  <View style={styles.footer}>
                    {/* Page indicators */}
                    <View style={styles.pageIndicators}>
                      {data.map((_, i) => (
                        <View
                          key={i}
                          style={[
                            styles.pageIndicator,
                            i === currentPage && styles.activePageIndicator,
                          ]}
                        />
                      ))}
                    </View>

                    {/* Next button */}
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={handleNext}
                      activeOpacity={0.8}
                    >
                      <BlurView intensity={30} style={styles.nextButtonBlur}>
                        <Text style={styles.nextButtonText}>
                          {currentPage === data.length - 1 ? 'Get Started' : 'Next'}
                        </Text>
                        <Ionicons
                          name={currentPage === data.length - 1 ? 'rocket' : 'chevron-forward'}
                          size={20}
                          color="white"
                        />
                      </BlurView>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </PagerView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradient: {
    flex: 1,
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
  },
  slideContent: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  skipButton: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  onboardingImage: {
    width: width * 0.8,
    height: height * 0.4,
  },
  textContainer: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  pageIndicators: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4,
  },
  activePageIndicator: {
    backgroundColor: 'white',
    width: 24,
  },
  nextButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  nextButtonBlur: {
    paddingHorizontal: 40,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  // Role Selection Styles
  roleSelectionContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  roleContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  roleSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 40,
  },
  roleButton: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  customerButton: {
    borderWidth: 1,
    borderColor: 'rgba(79, 172, 254, 0.3)',
  },
  barberButton: {
    borderWidth: 1,
    borderColor: 'rgba(250, 112, 154, 0.3)',
  },
  roleButtonBlur: {
    padding: 20,
  },
  roleButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleButtonText: {
    flex: 1,
    marginLeft: 20,
  },
  roleButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  roleButtonDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  footerContainer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default OnboardingScreen;