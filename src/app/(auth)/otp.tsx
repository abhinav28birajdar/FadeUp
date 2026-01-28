import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function OTPScreen() {
    const router = useRouter();
    const [code, setCode] = useState('');

    const handleVerify = () => {
        router.replace('/(tabs)/home');
    };

    return (
        <Container style={styles.container}>
            <View style={styles.content}>
                <ThemedText variant="xxl" weight="bold" style={styles.title}>Enter Code</ThemedText>
                <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                    We sent a verification code to your phone.
                </ThemedText>

                <Input
                    placeholder="000000"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    containerStyle={styles.input}
                    style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24 }}
                />

                <Button label="Verify" onPress={handleVerify} />
                <Button label="Resend Code" variant="ghost" style={{ marginTop: Spacing.md }} />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: Spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    input: {
        marginBottom: Spacing.xl,
    }
});
