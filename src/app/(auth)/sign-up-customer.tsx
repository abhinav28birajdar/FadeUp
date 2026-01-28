import React, { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { Mail, Lock, MoveLeft, User, Phone } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function SignUpCustomerScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignUp = async () => {
        if (!email || !password || password !== confirmPassword) return;
        setIsLoading(true);
        try {
            await signUp('customer', { fullName: name, email, phone, password });
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
                        <ThemedText variant="xxl" weight="bold">Create Account</ThemedText>
                        <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                            Join FadeUp as a customer
                        </ThemedText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={name}
                            onChangeText={setName}
                            leftIcon={<User size={20} color={Colors.textTertiary} />}
                        />

                        <Input
                            label="Email Address"
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon={<Mail size={20} color={Colors.textTertiary} />}
                        />

                        <Input
                            label="Phone Number"
                            placeholder="+1 234 567 8900"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            leftIcon={<Phone size={20} color={Colors.textTertiary} />}
                        />

                        <Input
                            label="Password"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            isPassword
                            leftIcon={<Lock size={20} color={Colors.textTertiary} />}
                        />

                        <Input
                            label="Confirm Password"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            isPassword
                            leftIcon={<Lock size={20} color={Colors.textTertiary} />}
                        />

                        <ThemedText variant="xs" color={Colors.textTertiary} style={styles.terms}>
                            By signing up, you agree to our Terms of Service and Privacy Policy.
                        </ThemedText>

                        <Button
                            label="Create Account"
                            onPress={handleSignUp}
                            isLoading={isLoading}
                            style={styles.signUpButton}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <ThemedText variant="sm" color={Colors.textSecondary} centered>
                            Already have an account?{' '}
                            <ThemedText
                                variant="sm"
                                color={Colors.primary}
                                weight="semibold"
                                onPress={() => router.push('/(auth)/sign-in')}
                            >
                                Sign In
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
        marginBottom: Spacing.lg,
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
        marginBottom: Spacing.lg,
    },
    terms: {
        marginTop: Spacing.sm,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    signUpButton: {
        marginBottom: Spacing.lg,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: Spacing.lg,
    }
});
