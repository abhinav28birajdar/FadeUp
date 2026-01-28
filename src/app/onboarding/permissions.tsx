import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Bell, MapPin, Camera } from 'lucide-react-native';

export default function PermissionsScreen() {
    const router = useRouter();

    const handleContinue = () => {
        // In a real app, request permissions here
        router.replace('/(auth)/user-choice'); // Go to auth choice after onboarding
    };

    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Enable Permissions</ThemedText>
                <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                    To provide the best experience, FadeUp needs access to a few things.
                </ThemedText>
            </View>

            <View style={styles.permissionsList}>
                <View style={styles.permissionItem}>
                    <View style={styles.iconContainer}>
                        <Bell size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText variant="lg" weight="bold">Notifications</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>
                            Get updates on your queue status and booking reminders.
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.permissionItem}>
                    <View style={styles.iconContainer}>
                        <MapPin size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText variant="lg" weight="bold">Location</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>
                            Find barber shops near you and see live distances.
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.permissionItem}>
                    <View style={styles.iconContainer}>
                        <Camera size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText variant="lg" weight="bold">Camera & Photos</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>
                            Upload profile pictures and shop gallery images.
                        </ThemedText>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <Button label="Enable All & Continue" onPress={handleContinue} />
                <Button label="Maybe Later" variant="ghost" onPress={handleContinue} />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
    },
    header: {
        marginTop: Spacing.xl,
    },
    subtitle: {
        marginTop: 8,
    },
    permissionsList: {
        flex: 1,
        justifyContent: 'center',
        gap: Spacing.xl,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    textContainer: {
        flex: 1,
    },
    footer: {
        paddingVertical: Spacing.xl,
        gap: Spacing.sm,
    },
});
