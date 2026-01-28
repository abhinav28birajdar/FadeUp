import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ThemedView } from '../../components/ui/ThemedView';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { MoveLeft, ArrowRight, User, Store, MapPin, Clock, Check } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

const STEPS = [
    { id: 1, title: 'Personal', icon: User },
    { id: 2, title: 'Shop', icon: Store },
    { id: 3, title: 'Location', icon: MapPin },
    { id: 4, title: 'Hours', icon: Clock },
];

export default function SignUpBarberScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form State (Simplified for UI Demo)
    // Step 1
    const [personalInfo, setPersonalInfo] = useState({ name: '', email: '', phone: '', password: '' });
    // Step 2
    const [shopInfo, setShopInfo] = useState({ name: '', category: '', description: '' });
    // Step 3
    const [locationInfo, setLocationInfo] = useState({ address: '', city: '', zip: '' });
    // Step 4
    const [hoursInfo, setHoursInfo] = useState({ open: '09:00', close: '18:00' });


    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            router.back();
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            await signUp('barber', { fullName: personalInfo.name, email: personalInfo.email, ...shopInfo });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.stepTitle}>Personal Information</ThemedText>
                        <Input label="Full Name" value={personalInfo.name} onChangeText={(t: string) => setPersonalInfo({ ...personalInfo, name: t })} leftIcon={<User size={20} color={Colors.textTertiary} />} />
                        <Input label="Email" value={personalInfo.email} onChangeText={(t: string) => setPersonalInfo({ ...personalInfo, email: t })} keyboardType="email-address" leftIcon={<User size={20} color={Colors.textTertiary} />} />
                        <Input label="Phone" value={personalInfo.phone} onChangeText={(t: string) => setPersonalInfo({ ...personalInfo, phone: t })} keyboardType="phone-pad" leftIcon={<User size={20} color={Colors.textTertiary} />} />
                        <Input label="Password" value={personalInfo.password} onChangeText={(t: string) => setPersonalInfo({ ...personalInfo, password: t })} isPassword leftIcon={<User size={20} color={Colors.textTertiary} />} />
                    </View>
                );
            case 2:
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.stepTitle}>Shop Details</ThemedText>
                        <Input label="Shop Name" value={shopInfo.name} onChangeText={(t: string) => setShopInfo({ ...shopInfo, name: t })} leftIcon={<Store size={20} color={Colors.textTertiary} />} />
                        <Input label="Category (e.g. Barber, Salon)" value={shopInfo.category} onChangeText={(t: string) => setShopInfo({ ...shopInfo, category: t })} leftIcon={<Store size={20} color={Colors.textTertiary} />} />
                        <Input label="Description" value={shopInfo.description} onChangeText={(t: string) => setShopInfo({ ...shopInfo, description: t })} multiline style={{ height: 100 }} />
                    </View>
                );
            case 3:
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.stepTitle}>Location</ThemedText>
                        <Input label="Address" value={locationInfo.address} onChangeText={(t: string) => setLocationInfo({ ...locationInfo, address: t })} leftIcon={<MapPin size={20} color={Colors.textTertiary} />} />
                        <Input label="City" value={locationInfo.city} onChangeText={(t: string) => setLocationInfo({ ...locationInfo, city: t })} leftIcon={<MapPin size={20} color={Colors.textTertiary} />} />
                        <Input label="Postal Code" value={locationInfo.zip} onChangeText={(t: string) => setLocationInfo({ ...locationInfo, zip: t })} leftIcon={<MapPin size={20} color={Colors.textTertiary} />} />
                        <ThemedView style={styles.mapPlaceholder}>
                            <ThemedText variant="sm" color={Colors.textSecondary}>Map View Placeholder</ThemedText>
                        </ThemedView>
                    </View>
                );
            case 4:
                return (
                    <View style={styles.stepContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.stepTitle}>Operating Hours</ThemedText>
                        <Input label="Opening Time" value={hoursInfo.open} onChangeText={(t: string) => setHoursInfo({ ...hoursInfo, open: t })} leftIcon={<Clock size={20} color={Colors.textTertiary} />} />
                        <Input label="Closing Time" value={hoursInfo.close} onChangeText={(t: string) => setHoursInfo({ ...hoursInfo, close: t })} leftIcon={<Clock size={20} color={Colors.textTertiary} />} />

                        <ThemedText variant="sm" color={Colors.textSecondary} style={{ marginTop: Spacing.md }}>
                            Note: You can configure breaks and holidays later in settings.
                        </ThemedText>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <Container>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Button
                        label=""
                        variant="ghost"
                        leftIcon={<MoveLeft size={24} color={Colors.text} />}
                        onPress={handleBack}
                        style={styles.backButton}
                        fullWidth={false}
                    />
                    <View style={styles.headerTitle}>
                        <ThemedText variant="xl" weight="bold">Register Shop</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>Step {currentStep} of {STEPS.length}</ThemedText>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    {STEPS.map((step, index) => {
                        const isActive = step.id === currentStep;
                        const isCompleted = step.id < currentStep;
                        return (
                            <View key={step.id} style={styles.progressStepWrapper}>
                                <View style={[
                                    styles.progressIcon,
                                    isActive && styles.progressIconActive,
                                    isCompleted && styles.progressIconCompleted
                                ]}>
                                    {isCompleted ? (
                                        <Check size={16} color={Colors.black} />
                                    ) : (
                                        <step.icon size={16} color={isActive ? Colors.black : Colors.textSecondary} />
                                    )}
                                </View>
                                {index < STEPS.length - 1 && (
                                    <View style={[
                                        styles.progressLine,
                                        isCompleted && { backgroundColor: Colors.primary }
                                    ]} />
                                )}
                            </View>
                        )
                    })}
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {renderStepContent()}
                </ScrollView>

                <View style={styles.footer}>
                    <Button
                        label={currentStep === 4 ? "Complete Registration" : "Next Step"}
                        onPress={handleNext}
                        isLoading={isLoading}
                        rightIcon={currentStep < 4 ? <ArrowRight size={20} color={Colors.black} /> : null}
                    />
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.sm,
    },
    headerTitle: {
        marginLeft: Spacing.sm,
    },
    backButton: {
        paddingHorizontal: 0,
        minHeight: 40,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    progressStepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    progressIcon: {
        width: 32,
        height: 32,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        zIndex: 1,
    },
    progressIconActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    progressIconCompleted: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: Colors.border,
        marginHorizontal: 4,
    },
    content: {
        flexGrow: 1,
    },
    stepContainer: {
        gap: Spacing.sm,
    },
    stepTitle: {
        marginBottom: Spacing.md,
    },
    footer: {
        paddingVertical: Spacing.lg,
    },
    mapPlaceholder: {
        height: 150,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    }

});
