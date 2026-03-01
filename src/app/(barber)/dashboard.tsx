import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { formatCurrency, formatWaitTime } from '../../utils/formatters';
import { getGreeting, formatDate } from '../../utils/dateHelpers';
import { useAuthContext } from '../../context/AuthContext';
import { earningsService } from '../../services/earnings.service';
import { bookingService } from '../../services/booking.service';
import { Booking, Earning } from '../../types/firestore.types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ChevronRight } from 'lucide-react-native';

export default function DashboardScreen() {
    const { user } = useAuthContext();
    const router = useRouter();

    const [earningsToday, setEarningsToday] = useState(0);
    const [clientsToday, setClientsToday] = useState(0);
    const [pendingBookings, setPendingBookings] = useState(0);
    const [nextAppointment, setNextAppointment] = useState<Booking | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!user) return;
        const unsubEarnings = earningsService.subscribeToBarberEarnings(user.uid, (data: Earning[]) => {
            const today = new Date().toISOString().split('T')[0];
            const todayEarnings = data.filter(e => e.date.startsWith(today)).reduce((sum, e) => sum + e.amount, 0);
            setEarningsToday(todayEarnings);
        });

        return () => unsubEarnings();
    }, [user]);

    return (
        <View style={styles.container}>
            <ScreenHeader title={getGreeting()} showBack={false} />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { }} tintColor={Colors.primary} />}
            >
                <Text style={[Typography.h2, { color: Colors.text, marginBottom: Spacing.sm }]}>Overview</Text>
                <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: Spacing.xl }]}>
                    {formatDate(new Date().toISOString())}
                </Text>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/earnings')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Earnings Today</Text>
                        <Text style={[Typography.h2, { color: Colors.primary, marginVertical: Spacing.xs }]}>{formatCurrency(earningsToday)}</Text>
                    </Card>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/queue')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Clients Today</Text>
                        <Text style={[Typography.h2, { color: Colors.text, marginVertical: Spacing.xs }]}>{clientsToday}</Text>
                    </Card>
                </View>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Pending Request</Text>
                        <Text style={[Typography.h2, { color: Colors.warning, marginVertical: Spacing.xs }]}>{pendingBookings}</Text>
                    </Card>
                    <Card style={styles.statCard} onPress={() => router.push('/(barber)/calendar')}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Completed</Text>
                        <Text style={[Typography.h2, { color: Colors.success, marginVertical: Spacing.xs }]}>0</Text>
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
                            <Text style={[Typography.h4, { color: Colors.primary }]}>{nextAppointment.servicePrice}</Text>
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
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.md, marginBottom: Spacing.md },
    upcomingCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.xl, backgroundColor: Colors.surface },
    emptyUpcoming: { padding: Spacing.xl, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed' },
});
