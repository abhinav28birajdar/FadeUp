import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Barber } from '../../types/firestore.types';
import { Avatar } from './Avatar';
import { StarRating } from './StarRating';
import { formatRating } from '../../utils/formatters';
import { Scissors } from 'lucide-react-native';

interface BarberCardProps {
    barber: Barber;
    isSelected?: boolean;
    onSelect?: () => void;
    layout?: 'horizontal' | 'vertical';
}

export const BarberCard = React.memo(({ barber, isSelected = false, onSelect, layout = 'horizontal' }: BarberCardProps) => {
    const isVertical = layout === 'vertical';

    return (
        <TouchableOpacity
            style={[
                styles.container,
                isVertical ? styles.verticalContainer : styles.horizontalContainer,
                isSelected && styles.selectedContainer
            ]}
            onPress={onSelect}
            activeOpacity={0.7}
        >
            <View style={styles.avatarWrapper}>
                <Avatar url={barber.photoURL} name={barber.name} size="md" />
                <View style={[styles.availabilityDot, { backgroundColor: barber.isAvailable ? Colors.success : Colors.error }]} />
            </View>

            <View style={[styles.info, isVertical && styles.verticalInfo]}>
                <Text style={[Typography.h4, { color: Colors.text, textAlign: isVertical ? 'center' : 'left' }]} numberOfLines={1}>
                    {barber.name}
                </Text>

                <View style={[styles.ratingContainer, isVertical && { justifyContent: 'center' }]}>
                    <StarRating rating={1} size={14} />
                    <Text style={[Typography.caption, { color: Colors.textSecondary, marginLeft: 4 }]}>
                        {formatRating(barber.rating)} ({barber.reviewCount})
                    </Text>
                </View>

                {barber.specialties && barber.specialties.length > 0 && (
                    <View style={[styles.specialties, isVertical && { justifyContent: 'center' }]}>
                        <Scissors size={12} color={Colors.textMuted} style={{ marginRight: 4 }} />
                        <Text style={[Typography.caption, { color: Colors.textMuted }]} numberOfLines={1}>
                            {barber.specialties.join(', ')}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.borderRadius.md,
        padding: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    horizontalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    verticalContainer: {
        alignItems: 'center',
        width: 140,
        marginRight: Spacing.md,
    },
    selectedContainer: {
        borderColor: Colors.primary,
        backgroundColor: Colors.surfaceElevated,
    },
    avatarWrapper: {
        position: 'relative',
    },
    availabilityDot: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 2,
        borderColor: Colors.surface,
    },
    info: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    verticalInfo: {
        marginLeft: 0,
        marginTop: Spacing.sm,
        width: '100%',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    specialties: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
});
