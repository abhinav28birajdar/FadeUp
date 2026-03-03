import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { Button } from '../components/ui/Button';
import { FileQuestion } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NotFoundScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <FileQuestion size={64} color={Colors.textMuted} />
            <Text style={[Typography.h2, styles.title, { color: Colors.text }]}>Page Not Found</Text>
            <Text style={[Typography.body, styles.message, { color: Colors.textSecondary }]}>
                The screen you were looking for doesn't exist or has been moved.
            </Text>
            <Button
                label="Go Home"
                onPress={() => router.replace('/(tabs)/home')}
                style={styles.btn}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    title: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    message: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    btn: {
        minWidth: 200,
    },
});
