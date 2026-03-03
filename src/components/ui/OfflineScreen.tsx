import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

/**
 * Full-screen overlay shown over the app when the device has no network
 * connectivity. Disappears automatically when connection is restored.
 */
export function OfflineScreen() {
    const { isConnected } = useNetworkStatus();

    if (isConnected) return null;

    return (
        <View style={styles.overlay}>
            <WifiOff size={56} color={Colors.textSecondary} />
            <Text style={[Typography.h2, styles.title, { color: Colors.text }]}>No Connection</Text>
            <Text style={[Typography.body, styles.subtitle, { color: Colors.textSecondary }]}>
                Please check your internet connection and try again.
            </Text>
            <TouchableOpacity style={styles.retryRow} accessibilityRole="button" accessibilityLabel="Retry connection">
                <RefreshCw size={16} color={Colors.primary} />
                <Text style={[Typography.bodySmall, styles.retryText, { color: Colors.primary }]}>
                    Retrying automatically…
                </Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.background,
        zIndex: 9999,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl * 2,
    },
    title: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    retryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    retryText: {
        fontWeight: '500',
    },
});
