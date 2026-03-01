import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { BookingStatus } from '../../types/firestore.types';

interface BadgeProps {
    status: BookingStatus;
}

export function Badge({ status }: BadgeProps) {
    const getStyles = () => {
        switch (status) {
            case 'pending': return { bg: Colors.warning + '20', text: Colors.warning };
            case 'confirmed': return { bg: Colors.info + '20', text: Colors.info };
            case 'in_progress': return { bg: Colors.primary + '20', text: Colors.primary };
            case 'completed': return { bg: Colors.success + '20', text: Colors.success };
            case 'cancelled': case 'no_show': return { bg: Colors.error + '20', text: Colors.error };
            default: return { bg: Colors.surfaceElevated, text: Colors.textSecondary };
        }
    };

    const fmt = (s: string) => s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    const { bg, text } = getStyles();

    return (
        <View style={[styles.container, { backgroundColor: bg }]}>
            <Text style={[Typography.caption, { color: text, fontWeight: '600' }]}>
                {fmt(status)}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Spacing.borderRadius.sm,
        alignSelf: 'flex-start',
    },
});
