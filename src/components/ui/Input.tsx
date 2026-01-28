import React, { useState } from 'react';
import { TextInput, TextInputProps, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { Eye, EyeOff } from 'lucide-react-native';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    containerStyle?: ViewStyle;
    isPassword?: boolean;
}

export function Input({
    label,
    error,
    leftIcon,
    rightIcon,
    containerStyle,
    isPassword = false,
    ...props
}: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Toggle password visibility
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <ThemedView style={[styles.container, containerStyle, { backgroundColor: 'transparent' }]}>
            {label && (
                <ThemedText variant="sm" color={Colors.textSecondary} style={styles.label}>
                    {label}
                </ThemedText>
            )}

            <ThemedView
                style={[
                    styles.inputContainer,
                    isFocused && styles.focusedInput,
                    !!error && styles.errorInput,
                ]}
            >
                {leftIcon && <ThemedView style={styles.leftIcon}>{leftIcon}</ThemedView>}

                <TextInput
                    style={styles.input}
                    placeholderTextColor={Colors.textTertiary}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />

                {isPassword ? (
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.rightIcon}>
                        {showPassword ? (
                            <EyeOff size={20} color={Colors.textSecondary} />
                        ) : (
                            <Eye size={20} color={Colors.textSecondary} />
                        )}
                    </TouchableOpacity>
                ) : (
                    rightIcon && <ThemedView style={styles.rightIcon}>{rightIcon}</ThemedView>
                )}
            </ThemedView>

            {error && (
                <ThemedText variant="xs" color={Colors.error} style={styles.errorText}>
                    {error}
                </ThemedText>
            )}
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: 'transparent',
        height: 56,
        paddingHorizontal: Spacing.md,
    },
    focusedInput: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surface,
    },
    errorInput: {
        borderColor: Colors.error,
    },
    input: {
        flex: 1,
        color: Colors.text,
        fontSize: Typography.sizes.md,
        height: '100%',
    },
    leftIcon: {
        marginRight: Spacing.sm,
        backgroundColor: 'transparent',
    },
    rightIcon: {
        marginLeft: Spacing.sm,
        backgroundColor: 'transparent',
    },
    errorText: {
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
});
