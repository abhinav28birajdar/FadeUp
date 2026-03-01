import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Booking } from '../../types/firestore.types';
import { Badge } from './Badge';
import { Calendar, Clock, Scissors, User } from 'lucide-react-native';
import { formatDate, formatTime } from '../../utils/dateHelpers';
import { Button } from './Button';
import { Card } from './Card';

interface BookingCardProps {
    booking: Booking;
    onPressAction?: () => void;
    actionLabel?: string;
    isProvider?: boolean;
}

export const BookingCard = React.memo(({ booking, onPressAction, actionLabel, isProvider }: BookingCardProps) => {
    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <Text style={[Typography.h4, { color: Colors.text, marginBottom: 2 }]}>
                        {isProvider ? booking.customerName : booking.shopName}
                    </Text>
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                        {booking.serviceName}
                    </Text>
                </View>
                <Badge status={booking.status} />
            </View>

            <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                    <Calendar size={16} color={Colors.textMuted} />
                    <Text style={[Typography.bodySmall, styles.detailText]}>
                        {formatDate(booking.scheduledAt)}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Clock size={16} color={Colors.textMuted} />
                    <Text style={[Typography.bodySmall, styles.detailText]}>
                        {formatTime(booking.scheduledAt)} • {booking.serviceDuration} min
                    </Text>
                </View>
                {!isProvider && (
                    <View style={styles.detailRow}>
                        <Scissors size={16} color={Colors.textMuted} />
                        <Text style={[Typography.bodySmall, styles.detailText]}>
                            Barber: {booking.barberName}
                        </Text>
                    </View>
                )}
            </View>

            {actionLabel && onPressAction && (
                <View style={styles.actionContainer}>
                    <Button
                        label={actionLabel}
                        variant="outline"
                        size="sm"
                        onPress={onPressAction}
                        style={styles.actionButton}
                        labelStyle={Typography.bodySmall}
                    />
                </View>
            )}
        </Card>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    titleContainer: {
        flex: 1,
        marginRight: Spacing.md,
    },
    detailsContainer: {
        backgroundColor: Colors.surfaceElevated,
        padding: Spacing.md,
        borderRadius: Spacing.borderRadius.md,
        gap: Spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailText: {
        color: Colors.text,
        marginLeft: Spacing.sm,
    },
    actionContainer: {
        marginTop: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    actionButton: {
        minWidth: 100,
    }
});
