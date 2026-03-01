import React, { ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from './Button';

interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {icon}
            </View>
            <Text style={[Typography.h3, styles.title, { color: Colors.text }]}>{title}</Text>
            <Text style={[Typography.body, styles.description, { color: Colors.textSecondary }]}>
                {description}
            </Text>
            {actionLabel && onAction && (
                <Button
                    label={actionLabel}
                    onPress={onAction}
                    style={styles.actionButton}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    iconContainer: {
        marginBottom: Spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surfaceElevated,
    },
    title: {
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    description: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
    actionButton: {
        minWidth: 160,
    },
});
