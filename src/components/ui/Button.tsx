import React from 'react';
import { View, StyleSheet, TouchableOpacity, TouchableOpacityProps, Text, ActivityIndicator, TextStyle, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';

export interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    labelStyle?: TextStyle;
    fullWidth?: boolean;
}

export function Button({ label, variant = 'primary', size = 'md', isLoading, disabled, style, labelStyle, fullWidth, ...props }: ButtonProps) {
    const isOutline = variant === 'outline';

    const getBackgroundColor = () => {
        switch (variant) {
            case 'primary': return Colors.primary;
            case 'secondary': return Colors.surfaceElevated;
            case 'danger': return Colors.error;
            case 'ghost': case 'outline': return Colors.transparent;
        }
    };

    const getTextColor = () => {
        switch (variant) {
            case 'primary': return Colors.black;
            case 'danger': return Colors.white;
            case 'ghost': case 'outline': return Colors.primary;
            case 'secondary': return Colors.text;
        }
    };

    const getHeight = () => {
        switch (size) {
            case 'sm': return 36;
            case 'md': return 48;
            case 'lg': return 56;
        }
    };

    const getPadding = () => {
        switch (size) {
            case 'sm': return Spacing.md;
            case 'md': return Spacing.lg;
            case 'lg': return Spacing.xl;
        }
    };

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            disabled={disabled || isLoading}
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    height: getHeight(),
                    paddingHorizontal: getPadding(),
                    borderColor: isOutline ? Colors.primary : Colors.transparent,
                    borderWidth: isOutline ? 1 : 0,
                    opacity: disabled || isLoading ? 0.6 : 1,
                    width: fullWidth ? '100%' : undefined,
                },
                style,
            ]}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor() || Colors.primary} />
            ) : (
                <Text style={[Typography.button, { color: getTextColor() }, labelStyle]}>
                    {label}
                </Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: Spacing.borderRadius.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
