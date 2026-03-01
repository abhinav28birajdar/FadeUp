import React, { ReactNode } from 'react';
import { Pressable, ViewStyle, StyleSheet, View } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface CardProps {
    children: ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    padding?: number;
    elevated?: boolean;
}

export const Card = React.memo(({ children, onPress, style, padding = Spacing.md, elevated = false }: CardProps) => {
    const innerStyle = { padding };

    return (
        <Pressable
            onPress={onPress}
            disabled={!onPress}
            style={({ pressed }) => [
                styles.card,
                { backgroundColor: pressed && onPress ? '#242424' : (elevated ? Colors.surfaceElevated : '#1A1A1A') },
                style,
                innerStyle,
            ]}
        >
            {children}
        </Pressable>
    );
});

const styles = StyleSheet.create({
    card: {
        borderColor: '#2E2E2E',
        borderWidth: 1,
        borderRadius: 16,
    }
});
