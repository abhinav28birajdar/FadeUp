import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Container } from '../../../components/ui/Container';
import { ThemedText } from '../../../components/ui/ThemedText';
import { ThemedView } from '../../../components/ui/ThemedView';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import { Calendar as CalendarIcon, Clock, User, ChevronRight, Filter } from 'lucide-react-native';

const DAYS = [
    { day: 'Mon', date: '27' },
    { day: 'Tue', date: '28', active: true },
    { day: 'Wed', date: '29' },
    { day: 'Thu', date: '30' },
    { day: 'Fri', date: '31' },
];

const MOCK_BOOKINGS = [
    { id: '1', time: '09:00 AM', customer: 'John Smith', service: 'Classic Haircut', duration: '30m', status: 'Confirmed' },
    { id: '2', time: '10:30 AM', customer: 'David Beckham', service: 'Styling & Wash', duration: '45m', status: 'Confirmed' },
    { id: '3', time: '11:15 AM', customer: 'Robert De Niro', service: 'Beard Trim', duration: '20m', status: 'Pending' },
    { id: '4', time: '01:00 PM', customer: 'Lionel Messi', service: 'Fade Cut', duration: '30m', status: 'Confirmed' },
    { id: '5', time: '02:30 PM', customer: 'Cristiano R.', service: 'Full Service', duration: '60m', status: 'Confirmed' },
];

export default function BarberBookingsScreen() {
    const [selectedDate, setSelectedDate] = useState('28');

    const renderBooking = ({ item }: { item: typeof MOCK_BOOKINGS[0] }) => (
        <TouchableOpacity style={styles.bookingCard}>
            <View style={styles.timeSection}>
                <ThemedText variant="sm" weight="bold">{item.time.split(' ')[0]}</ThemedText>
                <ThemedText variant="xs" color={Colors.textSecondary}>{item.time.split(' ')[1]}</ThemedText>
            </View>
            <View style={styles.contentSection}>
                <View style={styles.bookingHeader}>
                    <ThemedText variant="md" weight="bold">{item.customer}</ThemedText>
                    <View style={[styles.statusBadge, item.status === 'Pending' && styles.pendingBadge]}>
                        <ThemedText variant="xs" weight="medium" color={item.status === 'Pending' ? Colors.warning : Colors.primary}>
                            {item.status}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.bookingDetails}>
                    <View style={styles.detailRow}>
                        <Clock size={12} color={Colors.textTertiary} />
                        <ThemedText variant="xs" color={Colors.textSecondary} style={{ marginLeft: 4 }}>
                            {item.service} • {item.duration}
                        </ThemedText>
                    </View>
                </View>
            </View>
            <ChevronRight size={18} color={Colors.textTertiary} />
        </TouchableOpacity>
    );

    return (
        <Container>
            <View style={styles.header}>
                <View>
                    <ThemedText variant="xxl" weight="bold">Appointments</ThemedText>
                    <ThemedText variant="sm" color={Colors.textSecondary}>Manage your schedule</ThemedText>
                </View>
                <TouchableOpacity style={styles.filterBtn}>
                    <Filter size={20} color={Colors.text} />
                </TouchableOpacity>
            </View>

            {/* Date Selector */}
            <View style={styles.dateSelector}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
                    {DAYS.map((day, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.dateItem, selectedDate === day.date && styles.dateItemActive]}
                            onPress={() => setSelectedDate(day.date)}
                        >
                            <ThemedText variant="xs" color={selectedDate === day.date ? Colors.black : Colors.textSecondary}>
                                {day.day}
                            </ThemedText>
                            <ThemedText variant="md" weight="bold" color={selectedDate === day.date ? Colors.black : Colors.text}>
                                {day.date}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                    <TouchableOpacity style={styles.calendarBtn}>
                        <CalendarIcon size={20} color={Colors.primary} />
                    </TouchableOpacity>
                </ScrollView>
            </View>

            <FlatList
                data={MOCK_BOOKINGS}
                renderItem={renderBooking}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <ThemedText variant="sm" weight="semibold" color={Colors.textTertiary}>
                            TODAY'S SCHEDULE
                        </ThemedText>
                    </View>
                }
            />

            <TouchableOpacity style={styles.fab}>
                <ThemedText variant="huge" color={Colors.black} style={{ lineHeight: 40 }}>+</ThemedText>
            </TouchableOpacity>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterBtn: {
        padding: 10,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    dateSelector: {
        backgroundColor: Colors.surface,
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.md,
    },
    dateScroll: {
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
    },
    dateItem: {
        width: 50,
        height: 64,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    dateItemActive: {
        backgroundColor: Colors.primary,
    },
    calendarBtn: {
        width: 50,
        height: 64,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        marginLeft: Spacing.sm,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },
    listHeader: {
        marginBottom: Spacing.md,
    },
    bookingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeSection: {
        alignItems: 'center',
        width: 60,
        borderRightWidth: 1,
        borderRightColor: Colors.border,
        marginRight: Spacing.md,
    },
    contentSection: {
        flex: 1,
    },
    bookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    statusBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: 'rgba(238, 186, 43, 0.1)',
    },
    pendingBadge: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    bookingDetails: {
        marginTop: 2,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
});
