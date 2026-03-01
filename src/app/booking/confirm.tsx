import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useBookingStore } from '../../store/booking.store';
import { bookingService } from '../../services/booking.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useToastStore } from '../../components/ui/Toast';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateHelpers';

export default function ConfirmScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const { showToast } = useToastStore();
    const {
        selectedShop: shop,
        selectedService: service,
        selectedBarber: barber,
        selectedDate: date,
        selectedTime: time,
        notes,
        resetBooking
    } = useBookingStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
        if (!user || !shop || !service || !barber || !date || !time) return;

        try {
            setIsSubmitting(true);

            const scheduledAt = `${date}T${time}:00.000Z`;

            await bookingService.createBooking({
                customerId: user.uid,
                customerName: user.displayName || 'Customer',
                customerPhone: user.phone || '',
                shopId: shop.id,
                shopName: shop.name,
                barberId: barber.id,
                barberName: barber.name,
                serviceId: service.id,
                serviceName: service.name,
                servicePrice: service.price,
                serviceDuration: service.durationMinutes,
                scheduledAt,
                status: 'pending',
                notes: notes || '',
                queuePosition: null
            });

            showToast({ message: 'Booking confirmed!', type: 'success' });
            resetBooking();
            router.replace('/(tabs)/appointments');

        } catch (e) {
            showToast({ message: 'Failed to confirm booking', type: 'error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Confirm Booking" />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[Typography.h3, { color: Colors.text, marginBottom: Spacing.xl }]}>Review your booking details</Text>

                <Card style={styles.detailsCard}>
                    <View style={styles.detailRow}>
                        <Text style={[Typography.body, { color: Colors.textSecondary }]}>Shop</Text>
                        <Text style={[Typography.h4, { color: Colors.text }]}>{shop?.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[Typography.body, { color: Colors.textSecondary }]}>Service</Text>
                        <Text style={[Typography.h4, { color: Colors.text }]}>{service?.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[Typography.body, { color: Colors.textSecondary }]}>Barber</Text>
                        <Text style={[Typography.h4, { color: Colors.text }]}>{barber?.name}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[Typography.body, { color: Colors.textSecondary }]}>Date</Text>
                        <Text style={[Typography.h4, { color: Colors.text }]}>{date ? formatDate(new Date(date).toISOString()) : ''}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <Text style={[Typography.body, { color: Colors.textSecondary }]}>Time</Text>
                        <Text style={[Typography.h4, { color: Colors.text }]}>{time}</Text>
                    </View>
                </Card>

                <Card style={styles.summaryCard} elevated>
                    <View style={styles.totalRow}>
                        <Text style={[Typography.h3, { color: Colors.text }]}>Total to pay</Text>
                        <Text style={[Typography.h2, { color: Colors.primary }]}>{formatCurrency(service?.price || 0)}</Text>
                    </View>
                    <Text style={[Typography.caption, { color: Colors.textMuted, marginTop: Spacing.sm }]}>Payment will be collected at the shop.</Text>
                </Card>

            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label="Confirm Booking"
                    onPress={handleConfirm}
                    isLoading={isSubmitting}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    detailsCard: { padding: Spacing.xl, marginBottom: Spacing.xl },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
    summaryCard: { padding: Spacing.xl, backgroundColor: Colors.surfaceElevated },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    footer: { padding: Spacing.xl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
