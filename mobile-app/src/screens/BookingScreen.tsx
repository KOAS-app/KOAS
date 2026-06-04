import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing, typography } from '../theme';
import type { Slot } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'Booking'>;

const { width } = Dimensions.get('window');
const CALENDAR_PADDING = 40;
const DAY_SIZE = (width - CALENDAR_PADDING * 2) / 7;

export default function BookingScreen({ route, navigation }: Props) {
  const { stadiumId, stadiumName } = route.params;
  const [slots, setSlots] = useState<Slot[]>([]);
  const [stadiumLocations, setStadiumLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchSlots();
  }, [stadiumId]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/stadiums/${stadiumId}`);
      setSlots(res.data.slots || []);

      // Get unique locations from stadium
      const locations = res.data.locations || [];
      setStadiumLocations(locations);

      // Set default location
      if (locations.length > 0 && !selectedLocation) {
        setSelectedLocation(locations[0]);
      }
    } catch (err) {
      Alert.alert('Error', getApiError(err, 'Failed to load slots.'));
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const isSameDay = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return isSameDay(date, new Date());
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const isPastDay = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getSlotsForDate = (date: Date) => {
    const now = new Date();
    return slots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      return isSameDay(slotDate, date) && slot.location === selectedLocation && slotDate >= now;
    });
  };

  const selectedDateSlots = getSlotsForDate(selectedDate);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC'
    });
  };

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotId)) {
        return prev.filter((id) => id !== slotId);
      } else {
        return [...prev, slotId];
      }
    });
  };

  const handleContinue = async () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot to continue.');
      return;
    }

    const selectedSlotsData = slots.filter(s => selectedSlots.includes(s.id));
    if (selectedSlotsData.length === 0) return;

    const totalPrice = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);
    const slotsInfoString = selectedSlotsData
      .map(s => `• ${formatTime(s.startTime)} - ${formatTime(s.endTime)} (📍 ${s.location})`)
      .join('\n');

    Alert.alert(
      'Confirm Booking',
      `Book ${selectedSlotsData.length} slot(s) for ${totalPrice.toLocaleString()} ETB?\n\n${stadiumName}\n${slotsInfoString}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setBooking(true);
            try {
              await api.post('/bookings', { slotIds: selectedSlots });
              Alert.alert('Success', 'Bookings created successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Main') },
              ]);
            } catch (err) {
              Alert.alert('Booking Failed', getApiError(err, 'Please try again.'));
            } finally {
              setBooking(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Date & Time</Text>
          <View style={styles.backButton} />
        </View>

        {/* Location Selector */}
        {stadiumLocations.length > 1 && (
          <View style={styles.locationSelector}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.locationScrollView}>
              {stadiumLocations.map((location) => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.locationChip,
                    selectedLocation === location && styles.locationChipSelected,
                  ]}
                  onPress={() => {
                    setSelectedLocation(location);
                    setSelectedSlots([]); // Reset slot selection when location changes
                  }}
                >
                  <Text style={[
                    styles.locationChipText,
                    selectedLocation === location && styles.locationChipTextSelected,
                  ]}>
                    📍 {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          {/* Month Navigation */}
          <View style={styles.monthHeader}>
            <TouchableOpacity onPress={() => changeMonth('prev')} style={styles.monthButton}>
              <Feather name="chevron-left" size={24} color={colors.secondary} />
            </TouchableOpacity>
            <Text style={styles.monthTitle}>{getMonthName(currentMonth)}</Text>
            <TouchableOpacity onPress={() => changeMonth('next')} style={styles.monthButton}>
              <Feather name="chevron-right" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Week Days */}
          <View style={styles.weekDaysRow}>
            {weekDays.map((day) => (
              <View key={day} style={styles.weekDayCell}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {days.map((day, index) => {
              const isPast = day ? isPastDay(day) : false;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    !day && styles.dayCellEmpty,
                  ]}
                  onPress={() => day && !isPast && setSelectedDate(day)}
                  disabled={!day || isPast}
                >
                  {day && (
                    <View style={[
                      styles.dayContent,
                      isSameDay(day, selectedDate) && styles.dayContentSelected,
                      isToday(day) && !isSameDay(day, selectedDate) && styles.dayContentToday,
                    ]}>
                      <Text style={[
                        styles.dayText,
                        isSameDay(day, selectedDate) && styles.dayTextSelected,
                        isToday(day) && !isSameDay(day, selectedDate) && styles.dayTextToday,
                        isPast && styles.dayTextPast,
                      ]}>
                        {day.getDate()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Available Slots */}
        <View style={styles.slotsContainer}>
          <Text style={styles.slotsTitle}>
            Available Slots - {selectedDate.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          {selectedLocation && (
            <Text style={styles.slotsSubtitle}>
              📍 {selectedLocation}
            </Text>
          )}

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotAvailable]} />
              <Text style={styles.legendText}>Available</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotBooked]} />
              <Text style={styles.legendText}>Booked</Text>
            </View>
          </View>

          {/* Slots Grid */}
          {selectedDateSlots.length === 0 ? (
            <View style={styles.noSlots}>
              <Text style={styles.noSlotsIcon}>📅</Text>
              <Text style={styles.noSlotsText}>No slots available for this date</Text>
            </View>
          ) : (
            <View style={styles.slotsGrid}>
              {selectedDateSlots.map((slot) => {
                const isSelected = selectedSlots.includes(slot.id);
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotButton,
                      slot.isBooked && styles.slotButtonBooked,
                      isSelected && styles.slotButtonSelected,
                    ]}
                    onPress={() => !slot.isBooked && toggleSlotSelection(slot.id)}
                    disabled={slot.isBooked}
                  >
                    <Text style={[
                      styles.slotButtonText,
                      slot.isBooked && styles.slotButtonTextBooked,
                      isSelected && styles.slotButtonTextSelected,
                    ]}>
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </Text>
                    <Text style={[
                      styles.slotLocationText,
                      slot.isBooked && styles.slotLocationTextBooked,
                      isSelected && styles.slotLocationTextSelected,
                    ]}>
                      📍 {slot.location}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (selectedSlots.length === 0 || booking) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={selectedSlots.length === 0 || booking}
        >
          {booking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 36,
    paddingBottom: spacing.xs,
    backgroundColor: '#fff',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  calendarContainer: {
    backgroundColor: '#fff',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  monthButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  weekDayCell: {
    width: DAY_SIZE,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellEmpty: {
    opacity: 0,
  },
  dayContent: {
    width: DAY_SIZE - 8,
    height: DAY_SIZE - 8,
    borderRadius: (DAY_SIZE - 8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContentSelected: {
    backgroundColor: colors.secondary,
  },
  dayContentToday: {
    borderWidth: 2,
    borderColor: colors.secondary,
  },
  dayText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: colors.secondary,
    fontWeight: '700',
  },
  dayTextPast: {
    color: '#ccc',
  },
  slotsContainer: {
    backgroundColor: '#fff',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    paddingBottom: 120,
  },
  slotsTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.xs,
  },
  slotsSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: spacing.lg,
  },
  locationSelector: {
    backgroundColor: '#fff',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  locationSelectorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: spacing.md,
  },
  locationScrollView: {
    marginHorizontal: -spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  locationChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#e5e5e5',
    marginRight: spacing.md,
  },
  locationChipSelected: {
    backgroundColor: '#dcfce7',
    borderColor: colors.secondary,
  },
  locationChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  locationChipTextSelected: {
    color: colors.secondary,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotAvailable: {
    backgroundColor: colors.secondary,
  },
  legendDotBooked: {
    backgroundColor: '#ef4444',
  },
  legendText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  slotButton: {
    width: '47.5%',
    paddingVertical: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: '#dcfce7',
    borderWidth: 2,
    borderColor: '#86efac',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotButtonBooked: {
    backgroundColor: '#fee2e2',
    borderColor: '#fca5a5',
  },
  slotButtonSelected: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  slotButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  slotButtonTextBooked: {
    color: '#991b1b',
  },
  slotButtonTextSelected: {
    color: '#fff',
  },
  slotLocationText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#166534',
    marginTop: 4,
    opacity: 0.8,
  },
  slotLocationTextBooked: {
    color: '#991b1b',
  },
  slotLocationTextSelected: {
    color: '#fff',
  },
  noSlots: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  noSlotsIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.4,
  },
  noSlotsText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  continueButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
});

