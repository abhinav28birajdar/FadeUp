import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSequence,
    withDelay,
    runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react-native';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
    message: string;
    type: ToastType;
}

interface ToastStore {
    toast: ToastOptions | null;
    showToast: (options: ToastOptions) => void;
    hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
    toast: null,
    showToast: (options) => set({ toast: options }),
    hideToast: () => set({ toast: null }),
}));

export function Toast() {
    const { toast, hideToast } = useToastStore();
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(-100);
    const insets = useSafeAreaInsets();

    useEffect(() => {
        if (toast) {
            opacity.value = withTiming(1, { duration: 300 });
            translateY.value = withSequence(
                withTiming(insets.top + Spacing.md, { duration: 300 }),
                withDelay(
                    3000,
                    withTiming(-100, { duration: 300 }, () => {
                        runOnJS(hideToast)();
                    })
                )
            );
        }
    // opacity and translateY are Reanimated shared values — stable refs, no dep needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast, hideToast, insets.top]);

    const rStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    if (!toast) return null;

    const getIcon = () => {
        switch (toast.type) {
            case 'success': return <CheckCircle size={20} color={Colors.white} />;
            case 'error': return <AlertCircle size={20} color={Colors.white} />;
            case 'warning': return <AlertTriangle size={20} color={Colors.white} />;
            case 'info': return <Info size={20} color={Colors.white} />;
        }
    };

    const getBgColor = () => {
        switch (toast.type) {
            case 'success': return Colors.success;
            case 'error': return Colors.error;
            case 'warning': return Colors.warning;
            case 'info': return Colors.info;
        }
    };

    return (
        <Animated.View style={[styles.container, { backgroundColor: getBgColor() }, rStyle, { zIndex: 999 }]}>
            <View style={styles.iconContainer}>{getIcon()}</View>
            <Text style={[Typography.bodySmall, { color: Colors.white, fontWeight: '600', flex: 1 }]}>
                {toast.message}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: Spacing.md,
        right: Spacing.md,
        padding: Spacing.md,
        borderRadius: Spacing.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    iconContainer: {
        marginRight: Spacing.sm,
    },
});
