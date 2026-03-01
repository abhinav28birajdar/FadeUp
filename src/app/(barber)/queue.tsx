import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { QueueEntry, Booking } from '../../types/firestore.types';
import { queueService } from '../../services/queue.service';
import { bookingService } from '../../services/booking.service';
import { earningsService } from '../../services/earnings.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { QueueCard } from '../../components/ui/QueueCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users } from 'lucide-react-native';
import { useToastStore } from '../../components/ui/Toast';

export default function QueueScreen() {
    const { user } = useAuthContext();
    const { showToast } = useToastStore();

    const [queue, setQueue] = useState<QueueEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        // Assuming shop_owner or barber uses barberId as their uid for now (would need proper mapping otherwise)
        const unsub = queueService.subscribeToShopQueue(user.uid, (data) => {
            setQueue(data);
            setIsLoading(false);
        });
        return () => unsub();
    }, [user]);

    const handleStart = async (entry: QueueEntry) => {
        try {
            await queueService.markInProgress(entry.id);
            await bookingService.updateBookingStatus(entry.bookingId, 'in_progress');
            showToast({ message: 'Service started', type: 'info' });
        } catch (e) {
            showToast({ message: 'Failed to start service', type: 'error' });
        }
    };

    const handleComplete = async (entry: QueueEntry) => {
        try {
            await queueService.completeQueueEntry(entry.id);
            await bookingService.updateBookingStatus(entry.bookingId, 'completed');

            const booking = await bookingService.getBookingById(entry.bookingId);

            if (booking) {
                await earningsService.createEarningRecord({
                    shopId: booking.shopId,
                    barberId: booking.barberId,
                    bookingId: booking.id,
                    amount: booking.servicePrice,
                    date: new Date().toISOString(),
                    serviceName: booking.serviceName,
                    customerName: booking.customerName,
                });
            }

            showToast({ message: 'Service completed. Earning recorded.', type: 'success' });
        } catch (e) {
            showToast({ message: 'Failed to complete service', type: 'error' });
        }
    };

    const handleCancel = async (entry: QueueEntry) => {
        try {
            await queueService.removeFromQueue(entry.id);
            await bookingService.updateBookingStatus(entry.bookingId, 'cancelled');
            showToast({ message: 'Removed from queue', type: 'info' });
        } catch (e) {
            showToast({ message: 'Failed to cancel', type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Live Queue" showBack={false} />
            <FlatList
                data={queue}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <QueueCard
                        entry={item}
                        isProvider
                        onStart={() => handleStart(item)}
                        onComplete={() => handleComplete(item)}
                        onCancel={() => handleCancel(item)}
                    />
                )}
                ListEmptyComponent={() => (
                    !isLoading ? (
                        <EmptyState
                            icon={<Users size={48} color={Colors.textMuted} />}
                            title="Queue is empty"
                            description="You have no clients waiting at the moment."
                        />
                    ) : null
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.xl, flexGrow: 1 },
});
