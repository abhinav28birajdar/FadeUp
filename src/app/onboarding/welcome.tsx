import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Scissors } from 'lucide-react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <Container style={styles.container}>
            {/* Hero Section */}
            <View style={styles.hero}>
                <View style={styles.logoContainer}>
                    <Scissors size={80} color={Colors.primary} />
                    <View style={styles.circle} />
                </View>
                <ThemedText variant="huge" weight="bold" style={styles.title}>
                    FadeUp
                </ThemedText>
                <ThemedText variant="md" color={Colors.textSecondary} centered>
                    Your premium barber booking experience.{'\n'}Queue less, fade fresh.
                </ThemedText>
            </View>

            {/* Social Proof Placeholder */}
            <View style={styles.socialProof}>
                <ThemedText variant="sm" color={Colors.textTertiary}>
                    Trusted by 10,000+ users & 500+ shops
                </ThemedText>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <Button
                    label="Sign Up"
                    variant="primary"
                    onPress={() => router.push('/onboarding/user-choice')}
                    style={styles.button}
                />
                <Button
                    label="Sign In"
                    variant="outline"
                    onPress={() => router.push('/(auth)/sign-in')}
                    style={styles.button}
                />
                <Button
                    label="Continue as Guest"
                    variant="ghost"
                    onPress={() => router.replace('/(tabs)/home')}
                    style={styles.guestButton}
                />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
    hero: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    logoContainer: {
        width: 120,
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        position: 'relative',
    },
    circle: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 999,
        backgroundColor: Colors.primary,
        opacity: 0.1,
        zIndex: -1,
    },
    title: {
        marginBottom: Spacing.sm,
    },
    socialProof: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    actions: {
        gap: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    button: {
        marginBottom: Spacing.sm,
    },
    guestButton: {
        marginTop: -Spacing.sm,
    },
});
