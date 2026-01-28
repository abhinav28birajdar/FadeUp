import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, TouchableOpacityProps, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps extends TouchableOpacityProps {
    label: string;
    variant?: ButtonVariant;
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    labelStyle?: StyleProp<TextStyle>;
}

export function Button({
    label,
    variant = 'primary',
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    style,
    labelStyle,
    disabled,
    ...props
}: ButtonProps) {
    const getBackgroundColor = () => {
        if (disabled) return Colors.surfaceLight;
        switch (variant) {
            case 'primary': return Colors.primary;
            case 'secondary': return Colors.surfaceLight;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            case 'danger': return Colors.error;
            default: return Colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return Colors.textTertiary;
        switch (variant) {
            case 'primary': return Colors.black;
            case 'secondary': return Colors.text;
            case 'outline': return Colors.primary;
            case 'ghost': return Colors.textSecondary;
            case 'danger': return Colors.white;
            default: return Colors.black;
        }
    };

    const getBorder = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 1,
                borderColor: disabled ? Colors.surfaceLight : Colors.primary,
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    width: fullWidth ? '100%' : 'auto',
                    opacity: disabled || isLoading ? 0.7 : 1,
                },
                getBorder(),
                style,
            ]}
            disabled={disabled || isLoading}
            activeOpacity={0.8}
            {...props}
        >
            {isLoading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {leftIcon && <ThemedView style={{ marginRight: 8, backgroundColor: 'transparent' }}>{leftIcon}</ThemedView>}
                    <ThemedText
                        variant="md"
                        weight="bold"
                        style={[
                            { color: getTextColor() },
                            labelStyle
                        ]}
                    >
                        {label}
                    </ThemedText>
                    {rightIcon && <ThemedView style={{ marginLeft: 8, backgroundColor: 'transparent' }}>{rightIcon}</ThemedView>}
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        minHeight: 52,
    },
});
