import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Camera, MapPin } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { notificationService } from '../../services/notification.service';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../../context/AuthContext';

export default function PermissionsSetup() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { completeOnboarding } = useAuthContext();

    const handleGetStarted = async () => {
        // Optionally ask for notification permissions during onboarding
        await notificationService.requestPermissions();

        await completeOnboarding();
        router.replace('/(auth)/welcome');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.content}>
                <Text style={[Typography.h1, styles.title, { color: Colors.text }]}>Let's get set up</Text>
                <Text style={[Typography.body, styles.description, { color: Colors.textSecondary }]}>
                    FadeUp needs a few permissions to give you the best experience.
                </Text>

                <View style={styles.permissionItem}>
                    <View style={styles.iconBox}>
                        <Bell size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.permissionText}>
                        <Text style={[Typography.h4, { color: Colors.text }]}>Notifications</Text>
                        <Text style={[Typography.caption, { color: Colors.textMuted }]}>To remind you about bookings and your spot in the queue.</Text>
                    </View>
                </View>

                <View style={styles.permissionItem}>
                    <View style={styles.iconBox}>
                        <Camera size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.permissionText}>
                        <Text style={[Typography.h4, { color: Colors.text }]}>Camera</Text>
                        <Text style={[Typography.caption, { color: Colors.textMuted }]}>To set your profile picture and share style references.</Text>
                    </View>
                </View>

            </View>

            <View style={styles.footer}>
                <Button label="Get Started" onPress={handleGetStarted} fullWidth />
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
        flex: 1,
        padding: Spacing.xl,
        justifyContent: 'center',
    },
    title: {
        marginBottom: Spacing.sm,
    },
    description: {
        marginBottom: Spacing.xxl,
    },
    permissionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: Spacing.borderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    permissionText: {
        flex: 1,
    },
    footer: {
        padding: Spacing.xl,
    },
});
