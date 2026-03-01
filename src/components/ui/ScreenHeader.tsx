import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
    title: string;
    showBack?: boolean;
    rightAction?: ReactNode;
    onBack?: () => void;
    transparent?: boolean;
}

export function ScreenHeader({ title, showBack = true, rightAction, onBack, transparent = false }: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            router.back();
        }
    };

    return (
        <View style={[
            styles.container,
            { paddingTop: insets.top + Spacing.sm },
            !transparent && styles.solidBackground
        ]}>
            <View style={styles.leftContainer}>
                {showBack && (
                    <TouchableOpacity onPress={handleBack} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <ArrowLeft size={24} color={Colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[Typography.h3, styles.title, { color: Colors.text }]} numberOfLines={1}>
                {title}
            </Text>

            <View style={styles.rightContainer}>
                {rightAction}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
        zIndex: 50,
    },
    solidBackground: {
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    leftContainer: {
        flex: 1,
        alignItems: 'flex-start',
    },
    title: {
        flex: 2,
        textAlign: 'center',
    },
    rightContainer: {
        flex: 1,
        alignItems: 'flex-end',
    },
    iconButton: {
        padding: Spacing.xs,
    },
});
