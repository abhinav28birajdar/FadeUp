import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Calendar } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from '../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Slide3() {
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

    const handleNext = () => {
        router.push('/onboarding/permissions');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Animated.View style={[styles.content, rStyle]}>
                <View style={styles.iconContainer}>
                    <Calendar size={80} color={Colors.primary} />
                </View>
                <Text style={[Typography.h1, styles.title, { color: Colors.text }]}>Book in Seconds</Text>
                <Text style={[Typography.body, styles.description, { color: Colors.textSecondary }]}>
                    Schedule appointments ahead of time with zero hassle. FadeUp puts the power of time management in your hands.
                </Text>
            </Animated.View>

            <View style={styles.footer}>
                <View style={styles.dots}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={[styles.dot, styles.dotActive]} />
                </View>
                <View style={styles.actions}>
                    <Button label="Continue" onPress={handleNext} style={{ flex: 1 }} />
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
        justifyContent: 'center',
        alignItems: 'center',
    },
});
