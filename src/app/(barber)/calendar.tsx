import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Calendar as CalendarIcon } from 'lucide-react-native';
import { Calendar } from 'react-native-calendars';
import { useAuthContext } from '../../context/AuthContext';
import { shopService } from '../../services/shop.service';
import { bookingService } from '../../services/booking.service';
import { Booking } from '../../types/firestore.types';

export default function CalendarScreen() {
    const { user } = useAuthContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchDayBookings = async () => {
            if (!user) return;
            setIsLoading(true);
            try {
                const results = await bookingService.getShopBookings(user.uid, selectedDate);
                setBookings(results);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDayBookings();
    }, [user, selectedDate]);

    const markedDates = {
        [selectedDate]: { selected: true, selectedColor: Colors.primary }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Calendar" showBack={false} />

            <View style={styles.calendarContainer}>
                <Calendar
                    theme={{
                        backgroundColor: Colors.surface,
                        calendarBackground: Colors.surface,
                        textSectionTitleColor: Colors.textSecondary,
                        selectedDayBackgroundColor: Colors.primary,
                        selectedDayTextColor: Colors.black,
                        todayTextColor: Colors.primary,
                        dayTextColor: Colors.text,
                        textDisabledColor: Colors.border,
                        dotColor: Colors.primary,
                        monthTextColor: Colors.text,
                        arrowColor: Colors.primary,
                    }}
                    markedDates={markedDates}
                    onDayPress={(day: any) => setSelectedDate(day.dateString)}
                />
            </View>

            <View style={styles.scheduleContainer}>
                <Text style={[Typography.h3, { color: Colors.text, marginBottom: Spacing.md }]}>Appointments</Text>

                {isLoading ? (
                    <ActivityIndicator color={Colors.primary} />
                ) : bookings.length === 0 ? (
                    <EmptyState
                        icon={<CalendarIcon size={32} color={Colors.textMuted} />}
                        title="Free day"
                        description="No appointments scheduled for this date."
                    />
                ) : (
                    bookings.map(book => (
                        <View key={book.id} style={styles.bookItem}>
                            <Text style={[Typography.h4, { color: Colors.text }]}>{book.scheduledAt.split('T')[1].substring(0, 5)} - {book.customerName}</Text>
                            <Text style={{ color: Colors.textSecondary }}>{book.serviceName}</Text>
                        </View>
                    ))
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    calendarContainer: { padding: Spacing.md, backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border },
    scheduleContainer: { flex: 1, padding: Spacing.xl },
    bookItem: { backgroundColor: Colors.surfaceElevated, padding: Spacing.md, borderRadius: Spacing.borderRadius.md, marginBottom: Spacing.sm },
});
