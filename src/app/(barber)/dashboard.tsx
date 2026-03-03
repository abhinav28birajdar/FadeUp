import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { formatCurrency } from '../../utils/formatters';
import { getGreeting, formatDate } from '../../utils/dateHelpers';
import { useAuthContext } from '../../context/AuthContext';
import { earningsService } from '../../services/earnings.service';
import { bookingService } from '../../services/booking.service';
import { Booking, Earning } from '../../types/firestore.types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { shopService } from '../../services/shop.service';
import { Store, MapPin, ChevronRight } from 'lucide-react-native';
import { Shop } from '../../types/firestore.types';

export default function DashboardScreen() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [earningsToday, setEarningsToday] = useState(0);
    const [earningsWeekly, setEarningsWeekly] = useState(0);
    const [clientsToday, setClientsToday] = useState(0);
    const [completedToday, setCompletedToday] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [nextAppointment, setNextAppointment] = useState<Booking | null>(null);
    const [shop, setShop] = useState<Shop | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const loadBookingStats = useCallback(async () => {
        if (!user) return;
        try {
            const today = new Date().toISOString().split('T')[0];
            const bookings = await bookingService.getShopBookings(user.uid, today);
            const pending = bookings.filter((b) => b.status === 'pending').length;
            const clients = bookings.filter((b) => ['confirmed', 'in_progress', 'completed'].includes(b.status)).length;
            const completed = bookings.filter((b) => b.status === 'completed').length;
            setPendingBookings(pending);
            setClientsToday(clients);
            setCompletedToday(completed);

            const upcoming = bookings
                .filter((b) => ['pending', 'confirmed'].includes(b.status))
                .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
            setNextAppointment(upcoming[0] ?? null);
        } catch { /* silently fail */ }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        const unsubEarnings = earningsService.subscribeToBarberEarnings(user.uid, (data: Earning[]) => {
            const today = new Date().toISOString().split('T')[0];
            const now = new Date();
            const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
            startOfWeek.setHours(0, 0, 0, 0);

            let todayTotal = 0;
            let weeklyTotal = 0;

            data.forEach(e => {
                if (e.date.startsWith(today)) todayTotal += e.amount;
                if (new Date(e.date) >= startOfWeek) weeklyTotal += e.amount;
            });

            setEarningsToday(todayTotal);
            setEarningsWeekly(weeklyTotal);
        });

        const loadShop = async () => {
            const data = await shopService.getShopById(user.uid);
            setShop(data);
        };

        loadBookingStats();
        loadShop();

        return () => unsubEarnings();
    }, [user, loadBookingStats]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadBookingStats();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title={getGreeting()} showBack={false} />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                {shop && (
                    <Card style={styles.shopCard} onPress={() => router.push('/(barber)/shop-details')}>
                        <View style={styles.shopIcon}>
                            <Store size={24} color={Colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={Typography.h2}>{shop.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                <MapPin size={14} color={Colors.textMuted} />
                                <Text style={[Typography.bodySmall, { color: Colors.textMuted, marginLeft: 4 }]}>{shop.city}</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={Colors.border} />
                    </Card>
                )}

                <Text style={[Typography.h3, { color: Colors.text, marginBottom: Spacing.sm }]}>Overview</Text>
                <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: Spacing.xl }]}>
                    {formatDate(new Date().toISOString())}
                </Text>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/earnings')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Today</Text>
                        <Text style={[Typography.h3, { color: Colors.primary, marginVertical: Spacing.xs }]}>{formatCurrency(earningsToday)}</Text>
                    </Card>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/earnings')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>This Week</Text>
                        <Text style={[Typography.h3, { color: Colors.success, marginVertical: Spacing.xs }]}>{formatCurrency(earningsWeekly)}</Text>
                    </Card>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/queue')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Clients</Text>
                        <Text style={[Typography.h3, { color: Colors.text, marginVertical: Spacing.xs }]}>{clientsToday}</Text>
                    </Card>
                </View>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Pending Requests</Text>
                        <Text style={[Typography.h2, { color: Colors.warning, marginVertical: Spacing.xs }]}>{pendingBookings}</Text>
                    </Card>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/calendar')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Completed</Text>
                        <Text style={[Typography.h2, { color: Colors.success, marginVertical: Spacing.xs }]}>{completedToday}</Text>
                    </Card>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[Typography.h3, { color: Colors.text }]}>Next Appointment</Text>
                    <Button label="Calendar" variant="ghost" size="sm" onPress={() => router.push('/(barber)/calendar')} />
                </View>

                {nextAppointment ? (
                    <Card style={styles.upcomingCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={[Typography.h4, { color: Colors.text }]}>{nextAppointment.customerName}</Text>
                            <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>{nextAppointment.serviceName}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={[Typography.h4, { color: Colors.primary }]}>{formatCurrency(nextAppointment.servicePrice)}</Text>
                            <Text style={[Typography.caption, { color: Colors.textMuted }]}>{nextAppointment.scheduledAt.split('T')[1].substring(0, 5)}</Text>
                        </View>
                    </Card>
                ) : (
                    <Card style={styles.emptyUpcoming}>
                        <Text style={[Typography.body, { color: Colors.textMuted }]}>No upcoming appointments</Text>
                    </Card>
                )}

                <Button
                    label="Manage Queue"
                    onPress={() => router.push('/(barber)/queue')}
                    style={{ marginTop: Spacing.xl }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    statsGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
    statCard: { flex: 1, padding: Spacing.md, backgroundColor: Colors.surfaceElevated },
    shopCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        marginBottom: Spacing.xl,
        borderRadius: 16,
        gap: Spacing.md
    },
    shopIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(200, 169, 110, 0.1)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.md },
    upcomingCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface },
    emptyUpcoming: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
});
