/**
 * Select Date/Time Screen
 * Step 3 of booking flow - choose date and time
 */

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface DayData {
  date: Date;
  dayName: string;
  dayNumber: number;
  monthName: string;
  isToday: boolean;
  available: boolean;
}

const generateDays = (): DayData[] => {
  const days: DayData[] = [];
  const today = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    days.push({
      date,
      dayName: dayNames[date.getDay()],
      dayNumber: date.getDate(),
      monthName: monthNames[date.getMonth()],
      isToday: i === 0,
      available: date.getDay() !== 0, // Closed on Sundays
    });
  }

  return days;
};

const generateTimeSlots = (): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 19;

  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour > 12 ? hour - 12 : hour}:${min === 0 ? '00' : min} ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push({
        time,
        available: Math.random() > 0.3, // Random availability for demo
      });
    }
  }

  return slots;
};

export const SelectDateTimeScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    shopId: string;
    services: string;
    barberId: string;
  }>();

  const [days] = useState(generateDays());
  const [timeSlots] = useState(generateTimeSlots());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    router.push({
      pathname: '/booking/confirm',
      params: {
        shopId: params.shopId,
        services: params.services,
        barberId: params.barberId,
        date: selectedDate.toISOString(),
        time: selectedTime,
      },
    });
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return '';
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const renderDayCard = ({ item }: { item: DayData }) => {
    const isSelected =
      selectedDate?.toDateString() === item.date.toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.dayCard,
          {
            backgroundColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.surface,
            borderColor: isSelected
              ? theme.colors.primary[500]
              : item.isToday
              ? theme.colors.primary[200]
              : theme.colors.neutral[200],
            opacity: item.available ? 1 : 0.5,
          },
        ]}
        onPress={() => item.available && setSelectedDate(item.date)}
        disabled={!item.available}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dayName,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.text.muted,
            },
          ]}
        >
          {item.dayName}
        </Text>
        <Text
          style={[
            styles.dayNumber,
            {
              color: isSelected ? '#FFFFFF' : theme.colors.text.primary,
            },
          ]}
        >
          {item.dayNumber}
        </Text>
        <Text
          style={[
            styles.monthName,
            {
              color: isSelected ? 'rgba(255,255,255,0.8)' : theme.colors.text.muted,
            },
          ]}
        >
          {item.monthName}
        </Text>
        {item.isToday && (
          <View
            style={[
              styles.todayDot,
              {
                backgroundColor: isSelected
                  ? '#FFFFFF'
                  : theme.colors.primary[500],
              },
            ]}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderTimeSlot = ({ item }: { item: TimeSlot }) => {
    const isSelected = selectedTime === item.time;

    return (
      <TouchableOpacity
        style={[
          styles.timeSlot,
          {
            backgroundColor: isSelected
              ? theme.colors.primary[500]
              : item.available
              ? theme.colors.surface
              : theme.colors.neutral[100],
            borderColor: isSelected
              ? theme.colors.primary[500]
              : theme.colors.neutral[200],
          },
        ]}
        onPress={() => item.available && setSelectedTime(item.time)}
        disabled={!item.available}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.timeText,
            {
              color: isSelected
                ? '#FFFFFF'
                : item.available
                ? theme.colors.text.primary
                : theme.colors.text.muted,
            },
          ]}
        >
          {item.time}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Select Date & Time
          </Text>
          <Text style={[styles.stepText, { color: theme.colors.text.muted }]}>
            Step 3 of 4
          </Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[styles.progressBar, { backgroundColor: theme.colors.neutral[200] }]}
        >
          <View
            style={[
              styles.progressFill,
              { backgroundColor: theme.colors.primary[500], width: '75%' },
            ]}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Select Date
          </Text>
          <FlatList
            horizontal
            data={days}
            keyExtractor={(item) => item.date.toISOString()}
            renderItem={renderDayCard}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.daysList}
          />
        </View>

        {/* Time Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.timeSectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Available Times
              </Text>
              <Text style={[styles.selectedDateText, { color: theme.colors.text.secondary }]}>
                {formatSelectedDate()}
              </Text>
            </View>
            <View style={styles.timeSlotsGrid}>
              {timeSlots.map((slot, index) => (
                <View key={index} style={styles.timeSlotWrapper}>
                  {renderTimeSlot({ item: slot })}
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 150 }} />
      </ScrollView>

      {/* Bottom Bar */}
      {selectedDate && selectedTime && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.selectionSummary}>
            <View style={styles.summaryItem}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={theme.colors.text.secondary}
              />
              <Text style={[styles.summaryText, { color: theme.colors.text.primary }]}>
                {formatSelectedDate()}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons
                name="time-outline"
                size={18}
                color={theme.colors.text.secondary}
              />
              <Text style={[styles.summaryText, { color: theme.colors.text.primary }]}>
                {selectedTime}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: theme.colors.primary[500] },
            ]}
            onPress={handleContinue}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerCenter: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 12,
    marginTop: 2,
  },
  progressContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  daysList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayCard: {
    width: 65,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 8,
    position: 'relative',
  },
  dayName: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  monthName: {
    fontSize: 11,
  },
  todayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    bottom: 6,
  },
  timeSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  selectedDateText: {
    fontSize: 13,
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  timeSlotWrapper: {
    width: '25%',
    padding: 4,
  },
  timeSlot: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SelectDateTimeScreen;
