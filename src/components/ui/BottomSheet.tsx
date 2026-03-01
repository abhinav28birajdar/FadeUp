import React, { ReactNode, useEffect } from 'react';
import { StyleSheet, View, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    isVisible: boolean;
    onClose: () => void;
    children: ReactNode;
    height?: number;
}

export function BottomSheet({ isVisible, onClose, children, height = SCREEN_HEIGHT * 0.5 }: BottomSheetProps) {
    const translateY = useSharedValue(SCREEN_HEIGHT);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isVisible) {
            translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
            opacity.value = withTiming(1, { duration: 300 });
        } else {
            translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 200 });
            opacity.value = withTiming(0, { duration: 300 });
        }
    }, [isVisible]);

    const panGesture = Gesture.Pan()
        .onChange((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.velocityY > 500 || event.translationY > height / 3) {
                translateY.value = withSpring(SCREEN_HEIGHT, { damping: 20, stiffness: 200 }, () => {
                    runOnJS(onClose)();
                });
            } else {
                translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
            }
        });

    const rSheetStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const rBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
            pointerEvents: isVisible ? 'auto' : 'none',
        };
    });

    if (!isVisible && translateY.value === SCREEN_HEIGHT) return null;

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents={isVisible ? 'auto' : 'none'}>
            <Animated.View style={[styles.backdrop, rBackdropStyle]}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>
            </Animated.View>

            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.sheet, { height }, rSheetStyle]}>
                    <View style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>
                    {children}
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.overlay,
    },
    sheet: {
        backgroundColor: Colors.surfaceElevated,
        borderTopLeftRadius: Spacing.borderRadius.xl,
        borderTopRightRadius: Spacing.borderRadius.xl,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    handleContainer: {
        padding: Spacing.md,
        alignItems: 'center',
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: Colors.border,
        borderRadius: 2,
    },
});
