import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { MoveLeft, Mail } from 'lucide-react-native';

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleReset = async () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1500);
    };

    return (
        <Container>
            <View style={styles.header}>
                <Button
                    label=""
                    variant="ghost"
                    leftIcon={<MoveLeft size={24} color={Colors.text} />}
                    onPress={() => router.back()}
                    style={styles.backButton}
                    fullWidth={false}
                />
                <ThemedText variant="xxl" weight="bold">Reset Password</ThemedText>
                <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                    Enter your email to receive a reset link
                </ThemedText>
            </View>

            <View style={styles.content}>
                {!isSent ? (
                    <>
                        <Input
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Mail size={20} color={Colors.textTertiary} />}
                        />
                        <Button
                            label="Send Reset Link"
                            onPress={handleReset}
                            isLoading={isLoading}
                            style={styles.button}
                        />
                    </>
                ) : (
                    <View style={styles.successContainer}>
                        <ThemedText variant="lg" weight="semibold" centered style={{ marginBottom: Spacing.sm }}>
                            Check your email
                        </ThemedText>
                        <ThemedText variant="md" color={Colors.textSecondary} centered>
                            We have sent a password reset link to {email}
                        </ThemedText>
                        <Button
                            label="Back to Sign In"
                            variant="outline"
                            onPress={() => router.replace('/(auth)/sign-in')}
                            style={[styles.button, { marginTop: Spacing.xl }]}
                        />
                    </View>
                )}
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: Spacing.xl,
        marginTop: Spacing.sm,
    },
    backButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 0,
        marginBottom: Spacing.md,
        minHeight: 40,
    },
    subtitle: {
        marginTop: Spacing.xs,
    },
    content: {
        marginTop: Spacing.lg,
    },
    button: {
        marginTop: Spacing.lg,
    },
    successContainer: {
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderRadius: Spacing.lg,
    }
});
