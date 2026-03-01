import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!email || !isValidEmail(email)) {
            showToast({ message: 'Please enter a valid email address', type: 'warning' });
            return;
        }

        try {
            setIsLoading(true);
            await authService.resetPassword(email.trim());
            showToast({ message: 'Password reset email sent!', type: 'success' });
            router.back();
        } catch (e: any) {
            showToast({ message: getFirebaseErrorMessage(e.code), type: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Reset Password" />

            <View style={styles.content}>
                <Text style={[Typography.body, styles.subtitle, { color: Colors.textSecondary }]}>
                    Enter your email address and we'll send you a link to reset your password.
                </Text>

                <Input
                    label="Email Address"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />

                <Button
                    label="Send Reset Link"
                    onPress={handleReset}
                    isLoading={isLoading}
                    style={styles.submitBtn}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: Spacing.xl,
        flex: 1,
    },
    subtitle: {
        marginBottom: Spacing.xl,
    },
    submitBtn: {
        marginTop: Spacing.xl,
    },
});
