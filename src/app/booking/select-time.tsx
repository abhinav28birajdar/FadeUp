import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useBookingStore } from '../../store/booking.store';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { Calendar } from 'react-native-calendars';

// Mock available times
const AVAILABLE_TIMES = [
    '09:00', '09:30', '10:00', '11:00', '13:00', '14:30', '15:00', '16:00'
];

export default function SelectTimeScreen() {
    const router = useRouter();
    const { selectedDate: date, selectedTime: time, setSelectedDate: setDate, setSelectedTime: setTime } = useBookingStore();

    const [selectedDate, setSelectedDate] = useState<string>(date || new Date().toISOString().split('T')[0]);
    const [selectedTime, setSelectedTime] = useState(time || '');

    const markedDates = {
        [selectedDate]: { selected: true, selectedColor: Colors.primary }
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
                        setSelectedTime(''); // Reset time when date changes
                    }}
                    style={styles.calendar}
                />

                <Text style={[Typography.h3, styles.sectionTitle, { color: Colors.text }]}>Available Times</Text>

                <View style={styles.timesGrid}>
                    {AVAILABLE_TIMES.map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.timeChip, selectedTime === t && styles.timeChipActive]}
                            onPress={() => setSelectedTime(t)}
                        >
                            <Text style={[Typography.body, { color: selectedTime === t ? Colors.black : Colors.text, fontWeight: selectedTime === t ? '600' : 'normal' }]}>
                                {t}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

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
    calendar: { marginBottom: Spacing.xl, borderRadius: Spacing.borderRadius.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
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
    footer: { padding: Spacing.xl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
