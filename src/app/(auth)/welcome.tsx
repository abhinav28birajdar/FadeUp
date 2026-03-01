import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Scissors } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + Spacing.xl }]}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <Scissors size={64} color={Colors.primary} />
                    <Text style={[Typography.h1, styles.appName, { color: Colors.primary }]}>Fade<Text style={{ color: Colors.white }}>Up</Text></Text>
                </View>
                <Text style={[Typography.body, styles.tagline, { color: Colors.textSecondary }]}>
                    Your next great haircut is just a tap away.
                </Text>
            </View>

            <View style={styles.actions}>
                <Button
                    label="Sign In"
                    onPress={() => router.push('/(auth)/login')}
                    style={styles.button}
                />
                <Button
                    label="Create Account"
                    variant="outline"
                    onPress={() => router.push('/(auth)/register')}
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingHorizontal: Spacing.xl,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    appName: {
        marginTop: Spacing.md,
        fontSize: 48,
        letterSpacing: -1,
    },
    tagline: {
        textAlign: 'center',
    },
    actions: {
        width: '100%',
    },
    button: {
        marginBottom: Spacing.md,
    },
});
