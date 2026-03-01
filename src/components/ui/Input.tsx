import React, { ReactNode, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Eye, EyeOff } from 'lucide-react-native';

export interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    secureTextEntry?: boolean;
    containerStyle?: StyleProp<ViewStyle>;
}

export function Input({ label, error, leftIcon, rightIcon, secureTextEntry, containerStyle, ...props }: InputProps) {
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={[Typography.label, styles.label, { color: Colors.textSecondary }]}>{label}</Text>}

            <View style={[
                styles.inputContainer,
                { borderColor: error ? Colors.error : isFocused ? Colors.primary : Colors.border },
            ]}>
                {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

                <TextInput
                    style={[Typography.body, styles.input, { color: Colors.text }]}
                    placeholderTextColor={Colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isSecure}
                    {...props}
                />

                {secureTextEntry && (
                    <TouchableOpacity onPress={() => setIsSecure(!isSecure)} style={styles.rightIcon}>
                        {isSecure ? <EyeOff size={20} color={Colors.textMuted} /> : <Eye size={20} color={Colors.textMuted} />}
                    </TouchableOpacity>
                )}

                {!secureTextEntry && rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
            </View>

            {error && <Text style={[Typography.caption, styles.errorText, { color: Colors.error }]}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    label: {
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderRadius: Spacing.borderRadius.md,
        height: 48,
        paddingHorizontal: Spacing.md,
    },
    input: {
        flex: 1,
        height: '100%',
        paddingVertical: 0,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
    rightIcon: {
        marginLeft: Spacing.sm,
    },
    errorText: {
        marginTop: Spacing.xs,
    },
});
