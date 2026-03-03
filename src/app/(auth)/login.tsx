import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth.service';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useToastStore } from '../../components/ui/Toast';
import { getFirebaseErrorMessage } from '../../utils/errorHandler';
import { isValidEmail } from '../../utils/validators';

export default function LoginScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            showToast({ message: 'Please enter both email and password', type: 'warning' });
            return;
        }
        if (!isValidEmail(email)) {
            showToast({ message: 'Please enter a valid email address', type: 'warning' });
            return;
        }

        try {
            setIsLoading(true);
            await authService.login(email.trim(), password);
            // navigation handled by AuthContext observer
        } catch (e: any) {
            showToast({ message: getFirebaseErrorMessage(e?.code ?? ''), type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="" />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <Text style={[Typography.h1, styles.title, { color: Colors.text }]}>Welcome Back</Text>
                    <Text style={[Typography.body, styles.subtitle, { color: Colors.textSecondary }]}>
                        Sign in to continue to FadeUp
                    </Text>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <Button
                        label="Forgot Password?"
                        variant="ghost"
                        style={styles.forgotPassword}
                        onPress={() => router.push('/(auth)/forgot-password')}
                    />

                    <Button
                        label="Sign In"
                        onPress={handleLogin}
                        isLoading={isLoading}
                        style={styles.loginBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.xl,
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        marginBottom: Spacing.xs,
    },
    subtitle: {
        marginBottom: Spacing.xxl,
    },
    form: {
        marginBottom: Spacing.md,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.xl,
    },
    loginBtn: {
        marginTop: Spacing.md,
    },
});
