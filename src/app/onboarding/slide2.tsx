import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Clock } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Slide2() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);

    useEffect(() => {
        opacity.value = withTiming(1, { duration: 800 });
        translateY.value = withTiming(0, { duration: 800 });
    }, []);

    const rStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    const handleSkip = async () => {
        await AsyncStorage.setItem('hasSeenOnboarding', 'true');
        router.replace('/(auth)/welcome');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Animated.View style={[styles.content, rStyle]}>
                <View style={styles.iconContainer}>
                    <Clock size={80} color={Colors.primary} />
                </View>
                <Text style={[Typography.h1, styles.title, { color: Colors.text }]}>Real-time Queue</Text>
                <Text style={[Typography.body, styles.description, { color: Colors.textSecondary }]}>
                    No more waiting in the shop. Join the virtual queue, track your position live, and arrive exactly when it's your turn.
                </Text>
            </Animated.View>

            <View style={styles.footer}>
                <View style={styles.dots}>
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dotActive]} />
                    <View style={styles.dot} />
                </View>
                <View style={styles.actions}>
                    <Button label="Skip" variant="ghost" onPress={handleSkip} />
                    <Button label="Next" onPress={() => router.push('/onboarding/slide3')} />
                </View>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    iconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: Spacing.md,
    },
    description: {
        textAlign: 'center',
        paddingHorizontal: Spacing.md,
    },
    footer: {
        padding: Spacing.xl,
    },
    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.xs,
    },
    dotActive: {
        width: 24,
        backgroundColor: Colors.primary,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
