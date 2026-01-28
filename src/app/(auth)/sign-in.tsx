import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Mail, Lock, MoveLeft, ScanFace } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignInScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('abhinavbirajdar28@gmail.com');
    const [password, setPassword] = useState('12345678');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) return;
        setIsLoading(true);
        try {
            await signIn(email, password);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Button
                            label=""
                            variant="ghost"
                            leftIcon={<MoveLeft size={24} color={Colors.text} />}
                            onPress={() => router.back()}
                            style={styles.backButton}
                            fullWidth={false}
                        />
                        <ThemedText variant="xxl" weight="bold">Welcome Back</ThemedText>
                        <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                            Sign in to continue to FadeUp
                        </ThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Email Address"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Mail size={20} color={Colors.textTertiary} />}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            isPassword
                            leftIcon={<Lock size={20} color={Colors.textTertiary} />}
                        />

                        <View style={styles.forgotPassword}>
                            <ThemedText
                                variant="sm"
                                color={Colors.primary}
                                weight="medium"
                                onPress={() => router.push('/(auth)/forgot-password')}
                            >
                                Forgot Password?
                            </ThemedText>
                        </View>

                        <Button
                            label="Sign In"
                            onPress={handleSignIn}
                            isLoading={isLoading}
                            style={styles.signInButton}
                        />

                        <View style={styles.divider}>
                            <View style={styles.line} />
                            <ThemedText variant="sm" color={Colors.textTertiary} style={styles.orText}>
                                Or continue with
                            </ThemedText>
                            <View style={styles.line} />
                        </View>

                        <View style={styles.socialRow}>
                            <Button
                                label="Google"
                                variant="secondary"
                                style={styles.socialButton}
                            />
                            <Button
                                label="Apple"
                                variant="secondary"
                                style={styles.socialButton}
                            />
                        </View>

                        {/* Biometric Placeholder */}
                        <View style={styles.biometric}>
                            <ScanFace size={32} color={Colors.primary} />
                            <ThemedText variant="sm" color={Colors.textSecondary} style={{ marginTop: 8 }}>Tap to use Face ID</ThemedText>
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText variant="sm" color={Colors.textSecondary} centered>
                            Don't have an account?{' '}
                            <ThemedText
                                variant="sm"
                                color={Colors.primary}
                                weight="semibold"
                                onPress={() => router.push('/(auth)/user-choice')}
                            >
                                Sign Up
                            </ThemedText>
                        </ThemedText>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        flexGrow: 1,
        paddingBottom: Spacing.xl,
    },
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
    form: {
        marginBottom: Spacing.xl,
    },
    forgotPassword: {
        alignItems: 'flex-end',
        marginBottom: Spacing.lg,
    },
    signInButton: {
        marginBottom: Spacing.xl,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    orText: {
        marginHorizontal: Spacing.md,
    },
    socialRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    socialButton: {
        flex: 1,
    },
    biometric: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    footer: {
        marginTop: 'auto',
    }
});
