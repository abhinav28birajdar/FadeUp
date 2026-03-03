import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useBookingStore } from '../../store/booking.store';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Calendar } from 'react-native-calendars';
import { bookingService } from '../../services/booking.service';

/** Default working-hour slots: 09:00–18:00 every 30 min, skipping 13:00–14:00 (lunch) */
const WORK_SLOTS: string[] = (() => {
    const slots: string[] = [];
    for (let h = 9; h < 18; h++) {
        if (h === 13) continue; // lunch break
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
})();

export default function SelectTimeScreen() {
    const router = useRouter();
    const {
        selectedDate: storedDate,
        selectedTime: storedTime,
        selectedBarber,
        selectedShop,
        setSelectedDate: setDate,
        setSelectedTime: setTime,
    } = useBookingStore();

    const [selectedDate, setSelectedDate] = useState<string>(
        storedDate || new Date().toISOString().split('T')[0]
    );
    const [selectedTime, setSelectedTime] = useState(storedTime || '');
    const [bookedTimes, setBookedTimes] = useState<Set<string>>(new Set());
    const [loadingSlots, setLoadingSlots] = useState(false);

    const shopId = selectedShop?.id ?? '';
    const barberId = selectedBarber?.id ?? '';

    const loadBookedTimes = useCallback(async (date: string) => {
        if (!shopId) return;
        setLoadingSlots(true);
        try {
            const bookings = await bookingService.getShopBookings(shopId, date);
            const occupied = new Set<string>(
                bookings
                    .filter(b => (!barberId || b.barberId === barberId) && b.status !== 'cancelled')
                    .map(b => {
                        const d = new Date(b.scheduledAt);
                        return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    })
            );
            setBookedTimes(occupied);
        } catch {
            setBookedTimes(new Set());
        } finally {
            setLoadingSlots(false);
        }
    }, [shopId, barberId]);

    useEffect(() => {
        loadBookedTimes(selectedDate);
    }, [selectedDate, loadBookedTimes]);

    const markedDates = {
        [selectedDate]: { selected: true, selectedColor: Colors.primary },
    };

    const handleNext = () => {
        setDate(selectedDate);
        setTime(selectedTime);
        router.push('/booking/confirm');
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Select Time" />

            <ScrollView contentContainerStyle={styles.content}>
                <Calendar
                    theme={{
                        backgroundColor: Colors.background,
                        calendarBackground: Colors.background,
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
                    minDate={new Date().toISOString().split('T')[0]}
                    markedDates={markedDates}
                    onDayPress={(day: any) => {
                        setSelectedDate(day.dateString);
                        setSelectedTime('');
                    }}
                    style={styles.calendar}
                />

                <Text style={[Typography.h3, styles.sectionTitle, { color: Colors.text }]}>
                    Available Times
                </Text>

                {loadingSlots ? (
                    <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
                ) : (
                    <View style={styles.timesGrid}>
                        {WORK_SLOTS.map((t) => {
                            const booked = bookedTimes.has(t);
                            const active = selectedTime === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    style={[
                                        styles.timeChip,
                                        active && styles.timeChipActive,
                                        booked && styles.timeChipBooked,
                                    ]}
                                    onPress={() => !booked && setSelectedTime(t)}
                                    disabled={booked}
                                >
                                    <Text
                                        style={[
                                            Typography.body,
                                            {
                                                color: booked
                                                    ? Colors.textSecondary
                                                    : active
                                                    ? Colors.black
                                                    : Colors.text,
                                                fontWeight: active ? '600' : 'normal',
                                            },
                                        ]}
                                    >
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <Button
                    label="Next step"
                    onPress={handleNext}
                    disabled={!selectedTime}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    calendar: {
        marginBottom: Spacing.xl,
        borderRadius: Spacing.borderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    sectionTitle: { marginBottom: Spacing.md },
    timesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
    timeChip: {
        width: '30%',
        paddingVertical: Spacing.md,
        backgroundColor: Colors.surfaceElevated,
        borderRadius: Spacing.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    timeChipBooked: {
        opacity: 0.4,
    },
    footer: {
        padding: Spacing.xl,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
});

