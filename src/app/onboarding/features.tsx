import React, { useState } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Calendar, Clock, MapPin, scissors } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const FEATURES = [
    {
        title: 'Find the Best Barbers',
        description: 'Discover top-rated barber shops near you with real reviews and photos.',
        icon: MapPin,
    },
    {
        title: 'Real-time Queue',
        description: 'Join the queue virtually and arrive just when your chair is ready.',
        icon: Clock,
    },
    {
        title: 'Easy Booking',
        description: 'Book appointments in seconds and manage your grooming schedule.',
        icon: Calendar,
    },
];

export default function FeaturesScreen() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < FEATURES.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            router.push('/onboarding/permissions');
        }
    };

    return (
        <Container style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    {React.createElement(FEATURES[currentStep].icon, {
                        size: 64,
                        color: Colors.primary,
                    })}
                </View>

                <ThemedText variant="xxl" weight="bold" centered style={styles.title}>
                    {FEATURES[currentStep].title}
                </ThemedText>

                <ThemedText variant="md" color={Colors.textSecondary} centered style={styles.description}>
                    {FEATURES[currentStep].description}
                </ThemedText>

                <View style={styles.dots}>
                    {FEATURES.map((_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === currentStep && styles.activeDot,
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.footer}>
                <Button label={currentStep === FEATURES.length - 1 ? "Get Started" : "Next"} onPress={handleNext} />
                <Button label="Skip" variant="ghost" onPress={() => router.push('/onboarding/permissions')} />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    title: {
        marginBottom: Spacing.md,
    },
    description: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    dots: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.surfaceLight,
    },
    activeDot: {
        backgroundColor: Colors.primary,
        width: 24,
    },
    footer: {
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
});
