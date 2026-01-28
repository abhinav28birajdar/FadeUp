import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { Colors } from '../../constants/colors';

interface BadgeProps {
    label: string | number;
    size?: 'sm' | 'md';
    color?: string;
    textColor?: string;
    style?: ViewStyle;
}

export function Badge({ label, size = 'sm', color = Colors.primary, textColor = Colors.black, style }: BadgeProps) {
    const isSmall = size === 'sm';

    return (
        <View style={[
            styles.container,
            { backgroundColor: color, paddingHorizontal: isSmall ? 6 : 8, paddingVertical: isSmall ? 2 : 4 },
            style
        ]}>
            <ThemedText
                style={{
                    fontSize: isSmall ? 10 : 12,
                    color: textColor,
                    fontWeight: 'bold'
                }}
            >
                {label}
            </ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 999,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
