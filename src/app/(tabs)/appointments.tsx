import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Booking } from '../../types/firestore.types';
import { bookingService } from '../../services/booking.service';
import { useAuthContext } from '../../context/AuthContext';
import { BookingCard } from '../../components/ui/BookingCard';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar } from 'lucide-react-native';

type Tab = 'upcoming' | 'past' | 'cancelled';

export default function AppointmentsScreen() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<Tab>('upcoming');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadBookings = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const data = await bookingService.getCustomerBookings(user.uid);
            setBookings(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadBookings();
    }, [loadBookings]);

    const filteredBookings = bookings.filter(b => {
        if (activeTab === 'upcoming') return ['pending', 'confirmed', 'in_progress'].includes(b.status);
        if (activeTab === 'past') return b.status === 'completed';
        if (activeTab === 'cancelled') return ['cancelled', 'no_show'].includes(b.status);
        return false;
    });

    const handleAction = (booking: Booking) => {
        // Determine action based on status
        if (['pending', 'confirmed'].includes(booking.status)) {
            // Cancel logic
            bookingService.cancelBooking(booking.id).then(loadBookings);
        } else if (booking.status === 'completed') {
            // Review logic
        }
    };

    const getActionLabel = (status: string) => {
        if (['pending', 'confirmed'].includes(status)) return 'Cancel';
        if (status === 'completed') return 'Rate';
        return undefined;
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="My Bookings" showBack={false} />

            <View style={styles.tabBar}>
                {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && styles.activeTab]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            Typography.label,
                            { color: activeTab === tab ? Colors.primary : Colors.textSecondary, textTransform: 'capitalize' }
                        ]}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={filteredBookings}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <BookingCard
                        booking={item}
                        actionLabel={getActionLabel(item.status)}
                        onPressAction={() => handleAction(item)}
                    />
                )}
                ListEmptyComponent={() => (
                    !isLoading ? (
                        <EmptyState
                            icon={<Calendar size={48} color={Colors.textMuted} />}
                            title={`No ${activeTab} bookings`}
                            description="You don't have any appointments in this category."
                        />
                    ) : null
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    tabBar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: Spacing.xl,
    },
    tab: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    list: {
        padding: Spacing.xl,
        flexGrow: 1,
    },
});
