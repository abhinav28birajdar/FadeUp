import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Service } from '../../types/firestore.types';
import { Clock } from 'lucide-react-native';
import { formatCurrency } from '../../utils/formatters';

interface ServiceCardProps {
    service: Service;
    isSelected?: boolean;
    onSelect?: () => void;
}

export const ServiceCard = React.memo(({ service, isSelected = false, onSelect }: ServiceCardProps) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                isSelected && styles.selectedContainer
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            <View style={styles.header}>
                <Text style={[Typography.h4, { color: Colors.text, flex: 1, marginRight: Spacing.sm }]}>
                    {service.name}
                </Text>
                <Text style={[Typography.h3, { color: Colors.primary }]}>
                    {formatCurrency(service.price)}
                </Text>
            </View>

            {service.description ? (
                <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: Spacing.sm }]} numberOfLines={2}>
                    {service.description}
                </Text>
            ) : null}

            <View style={styles.footer}>
                <View style={styles.durationTag}>
                    <Clock size={14} color={Colors.textMuted} />
                    <Text style={[Typography.caption, { color: Colors.textMuted, marginLeft: 4 }]}>
                        {service.durationMinutes} min
                    </Text>
                </View>
                <Text style={[Typography.caption, { color: Colors.textSecondary, textTransform: 'capitalize' }]}>
                    {service.category}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.borderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    selectedContainer: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceElevated,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.xs,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    durationTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Spacing.borderRadius.sm,
    },
});
