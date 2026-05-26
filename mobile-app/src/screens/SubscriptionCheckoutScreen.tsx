import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Clipboard,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing, typography } from '../theme';
import { API_BASE_URL } from '../config/api';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';
import type { Stadium, SubscriptionPlan, Slot } from '../types';

type Props = StackScreenProps<RootStackParamList, 'SubscriptionCheckout'>;

export default function SubscriptionCheckoutScreen({ route, navigation }: Props) {
  const { planId, planName, price, stadiumId, stadiumName } = route.params;

  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1); // 1: Search & Select, 2: Review Selections, 3: Payment, 4: Upload Receipt
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [receiptImage, setReceiptImage] = useState<{ uri: string; mimeType?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [searchDay, setSearchDay] = useState<string>('');
  const [searchTimeRange, setSearchTimeRange] = useState<string>('');

  const activeAccount = stadium?.bankAccounts?.find(acc => acc.isDefault) || stadium?.bankAccounts?.[0];
  const bankName = activeAccount?.bankName || stadium?.bankName;
  const accountNumber = activeAccount?.accountNumber || stadium?.accountNumber;
  const accountHolderName = activeAccount?.accountHolderName || stadium?.accountHolderName;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stadium details
        const stadiumRes = await api.get(`/stadiums/${stadiumId}`);
        setStadium(stadiumRes.data);

        // Fetch subscription plan details
        const planRes = await api.get(`/subscription-plans/stadium/${stadiumId}`);
        const selectedPlan = planRes.data.find((p: SubscriptionPlan) => p.id === planId);
        setPlan(selectedPlan);

        // Fetch available slots that match the plan's constraints
        if (selectedPlan) {
          const slots = stadiumRes.data.slots || [];
          const filteredSlots = filterSlotsByPlanConstraints(slots, selectedPlan);
          setAvailableSlots(filteredSlots);
        }
      } catch (err) {
        Alert.alert('Error', getApiError(err, 'Failed to fetch subscription details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stadiumId, planId]);

  // Helper function to filter slots based on plan constraints
  const filterSlotsByPlanConstraints = (slots: Slot[], plan: SubscriptionPlan): Slot[] => {
    const dayMap: { [key: string]: number } = {
      'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3,
      'Thursday': 4, 'Friday': 5, 'Saturday': 6
    };

    const openDayIndex = dayMap[plan.openingDay] || 1;
    const closeDayIndex = dayMap[plan.closingDay] || 0;

    // Parse time strings to minutes
    const parseTime = (timeStr: string): number => {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (!match) return 0;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    const planStartMinutes = parseTime(plan.openingTime);
    const planEndMinutes = parseTime(plan.closingTime);

    return slots.filter(slot => {
      const slotDate = new Date(slot.startTime);
      const slotDayIndex = slotDate.getDay();
      
      // Check if slot is in the future
      if (slotDate < new Date()) return false;
      
      // Check if slot is not already booked
      if (slot.isBooked) return false;

      // Check day of week
      let isDayAllowed = false;
      if (openDayIndex <= closeDayIndex) {
        isDayAllowed = slotDayIndex >= openDayIndex && slotDayIndex <= closeDayIndex;
      } else {
        isDayAllowed = slotDayIndex >= openDayIndex || slotDayIndex <= closeDayIndex;
      }
      if (!isDayAllowed) return false;

      // Check time of day
      const slotStartMinutes = slotDate.getHours() * 60 + slotDate.getMinutes();
      const slotEndDate = new Date(slot.endTime);
      let slotEndMinutes = slotEndDate.getHours() * 60 + slotEndDate.getMinutes();
      if (slotEndMinutes === 0 && slotEndDate.getDate() !== slotDate.getDate()) {
        slotEndMinutes = 1440;
      }

      let isTimeAllowed = false;
      if (planStartMinutes <= planEndMinutes) {
        isTimeAllowed = slotStartMinutes >= planStartMinutes && slotEndMinutes <= planEndMinutes;
      } else {
        isTimeAllowed = slotStartMinutes >= planStartMinutes || slotEndMinutes <= planEndMinutes;
      }

      return isTimeAllowed;
    });
  };

  const handleCopy = (text: string, label: string) => {
    try {
      Clipboard.setString(text);
      Alert.alert('Copied', `${label} copied to clipboard!`);
    } catch (err) {
      Alert.alert('Copied', `${label}: ${text}`);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library to upload receipts.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    setReceiptImage({
      uri: result.assets[0].uri,
      mimeType: result.assets[0].mimeType,
    });
  };

  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots(prev => {
      if (prev.includes(slotId)) {
        return prev.filter(id => id !== slotId);
      }
      
      // Check if adding this slot would exceed hoursPerDay limit
      const slot = availableSlots.find(s => s.id === slotId);
      if (!slot || !plan) return prev;

      const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
      const slotsOnSameDay = [...prev, slotId]
        .map(id => availableSlots.find(s => s.id === id))
        .filter(s => s && new Date(s.startTime).toISOString().split('T')[0] === slotDate);

      let totalHours = 0;
      slotsOnSameDay.forEach(s => {
        if (s) {
          const duration = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60 * 60);
          totalHours += duration;
        }
      });

      if (totalHours > (plan.hoursPerDay || 1)) {
        Alert.alert(
          'Daily Limit Exceeded',
          `Your subscription allows ${plan.hoursPerDay || 1} hour(s) per day. You've selected ${totalHours.toFixed(1)} hour(s) for this day.`
        );
        return prev;
      }

      // Check weekly limit - group slots by week and check each week
      const maxDaysPerWeek = plan.weeklyAllowedDays || 1;
      const newSelection = [...prev, slotId];
      
      // Get all selected dates
      const selectedDates = newSelection
        .map(id => {
          const s = availableSlots.find(slot => slot.id === id);
          return s ? new Date(s.startTime) : null;
        })
        .filter(d => d !== null) as Date[];

      // Group dates by week (Monday to Sunday)
      const getWeekKey = (date: Date): string => {
        const d = new Date(date);
        // Get Monday of the week
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is Sunday
        const monday = new Date(d.setDate(diff));
        return monday.toISOString().split('T')[0];
      };

      const weekGroups: { [weekKey: string]: Set<string> } = {};
      selectedDates.forEach(date => {
        const weekKey = getWeekKey(date);
        if (!weekGroups[weekKey]) {
          weekGroups[weekKey] = new Set();
        }
        weekGroups[weekKey].add(date.toISOString().split('T')[0]);
      });

      // Check if any week exceeds the limit
      for (const weekKey in weekGroups) {
        const daysInWeek = weekGroups[weekKey].size;
        if (daysInWeek > maxDaysPerWeek) {
          const weekStart = new Date(weekKey);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          Alert.alert(
            'Weekly Limit Exceeded',
            `Your subscription allows booking on ${maxDaysPerWeek} day(s) per week. You've selected ${daysInWeek} day(s) for the week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
          );
          return prev;
        }
      }

      return [...prev, slotId];
    });
  };

  const handleContinueToReview = () => {
    if (selectedSlots.length === 0) {
      Alert.alert('No Slots Selected', 'Please select at least one time slot to continue.');
      return;
    }
    setCurrentStep(2);
  };

  const handleContinueToPayment = () => {
    setCurrentStep(3);
  };

  const handleSubmit = async () => {
    if (!receiptImage) {
      Alert.alert('Receipt Required', 'Please select and upload a payment receipt screenshot.');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Upload receipt to /api/upload/receipt
      const formData = new FormData();
      formData.append('receipt', {
        uri: receiptImage.uri,
        type: receiptImage.mimeType || 'image/jpeg',
        name: `subscription-receipt-${Date.now()}.jpg`,
      } as any);

      const uploadRes = await api.post('/upload/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { imageUrl } = uploadRes.data;

      // 2. Submit subscription request with selected slots
      await api.post('/player-subscriptions/subscribe', {
        subscriptionPlanId: planId,
        pricePaid: price,
        receiptImageUrl: imageUrl,
        selectedSlotIds: selectedSlots, // Include selected slots
      });

      Alert.alert(
        'Success',
        'Your subscription application has been submitted successfully! The stadium owner will verify and activate your membership.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.popToTop();
            },
          },
        ]
      );
    } catch (err) {
      Alert.alert('Submission Failed', getApiError(err, 'Failed to submit subscription request.'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const groupSlotsByDate = () => {
    const grouped: { [key: string]: Slot[] } = {};
    availableSlots.forEach(slot => {
      const dateKey = new Date(slot.startTime).toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(slot);
    });
    return grouped;
  };

  const filterSlotsBySearch = (slots: Slot[]) => {
    let filtered = slots;

    // Filter by day of week
    if (searchDay) {
      filtered = filtered.filter(slot => {
        const slotDate = new Date(slot.startTime);
        const dayOfWeek = slotDate.toLocaleDateString('en-US', { weekday: 'long' });
        return dayOfWeek === searchDay;
      });
    }

    // Filter by time range
    if (searchTimeRange) {
      filtered = filtered.filter(slot => {
        const slotDate = new Date(slot.startTime);
        const slotHour = slotDate.getHours();
        
        switch (searchTimeRange) {
          case 'morning': // 6 AM - 12 PM
            return slotHour >= 6 && slotHour < 12;
          case 'afternoon': // 12 PM - 6 PM
            return slotHour >= 12 && slotHour < 18;
          case 'evening': // 6 PM - 12 AM
            return slotHour >= 18 && slotHour < 24;
          case 'night': // 12 AM - 6 AM
            return slotHour >= 0 && slotHour < 6;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Step 1: Search & Select Time Slots
  if (currentStep === 1) {
    const filteredSlots = filterSlotsBySearch(availableSlots);
    const groupedSlots = groupSlotsByDate();
    const sortedDates = Object.keys(groupedSlots).sort();

    // Filter dates that have matching slots after search
    const filteredDates = sortedDates.filter(dateKey => {
      const slotsOnDate = groupedSlots[dateKey];
      const matchingSlots = filterSlotsBySearch(slotsOnDate);
      return matchingSlots.length > 0;
    });

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const timeRanges = [
      { value: 'morning', label: 'Morning (6AM-12PM)' },
      { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
      { value: 'evening', label: 'Evening (6PM-12AM)' },
      { value: 'night', label: 'Night (12AM-6AM)' },
    ];

    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Plan Info Header */}
        <View style={styles.planCard}>
          <View style={styles.badgeRow}>
            <View style={styles.membershipBadge}>
              <Feather name="award" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.membershipBadgeText}>STEP 1: SELECT TIME SLOTS</Text>
            </View>
          </View>
          <Text style={styles.planName}>{planName}</Text>
          <Text style={styles.stadiumName}>at {stadiumName}</Text>

          {plan && (
            <View style={styles.constraintsBox}>
              <Text style={styles.constraintText}>📅 {plan.openingDay} - {plan.closingDay}</Text>
              <Text style={styles.constraintText}>🕒 {plan.openingTime} - {plan.closingTime}</Text>
              <Text style={styles.constraintText}>⏱️ {plan.hoursPerDay || 1} hour(s) per day</Text>
              <Text style={styles.constraintText}>📊 {plan.weeklyAllowedDays || 1} day(s) per week</Text>
            </View>
          )}
        </View>

        {/* Search Filters */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>🔍 Find Your Preferred Time</Text>
          <Text style={styles.searchSubtitle}>Select a day and time to see available slots</Text>
          
          {/* Day of Week Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {daysOfWeek.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[styles.filterChip, searchDay === day && styles.filterChipActive]}
                  onPress={() => setSearchDay(day)}
                >
                  <Text style={[styles.filterChipText, searchDay === day && styles.filterChipTextActive]}>
                    {day.substring(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Time Range Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Time of Day</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {timeRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  style={[styles.filterChip, searchTimeRange === range.value && styles.filterChipActive]}
                  onPress={() => setSearchTimeRange(range.value)}
                >
                  <Text style={[styles.filterChipText, searchTimeRange === range.value && styles.filterChipTextActive]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Results Count */}
          {searchDay && searchTimeRange && (
            <View style={styles.resultsCount}>
              <Feather name="filter" size={14} color={colors.primary} />
              <Text style={styles.resultsCountText}>
                {filteredSlots.length} slot(s) found
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchDay('');
                  setSearchTimeRange('');
                }}
                style={styles.clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Results: Slots grouped by date */}
        {!searchDay || !searchTimeRange ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={48} color="#8B9A94" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyStateText}>Select day and time to search</Text>
            <Text style={styles.emptyStateSubtext}>Choose your preferred day of the week and time range above</Text>
          </View>
        ) : filteredDates.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color="#8B9A94" style={{ opacity: 0.5 }} />
            <Text style={styles.emptyStateText}>No slots available</Text>
            <Text style={styles.emptyStateSubtext}>Try a different day or time range</Text>
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            {filteredDates.map(dateKey => {
              const slotsOnDate = groupedSlots[dateKey];
              const matchingSlots = filterSlotsBySearch(slotsOnDate);
              
              if (matchingSlots.length === 0) return null;

              const date = new Date(dateKey);
              const hasSelectedSlots = selectedSlots.some(slotId => {
                const slot = availableSlots.find(s => s.id === slotId);
                return slot && new Date(slot.startTime).toISOString().split('T')[0] === dateKey;
              });

              return (
                <View key={dateKey} style={styles.dateSection}>
                  <View style={[styles.dateSectionHeader, hasSelectedSlots && styles.dateSectionHeaderSelected]}>
                    <View style={styles.dateInfo}>
                      <Text style={[styles.dateDayOfWeek, hasSelectedSlots && styles.dateDayOfWeekSelected]}>
                        {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      </Text>
                      <Text style={[styles.dateFullDate, hasSelectedSlots && styles.dateFullDateSelected]}>
                        {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </Text>
                    </View>
                    {hasSelectedSlots && (
                      <View style={styles.selectedIndicator}>
                        <Feather name="check-circle" size={16} color={colors.primary} />
                      </View>
                    )}
                  </View>

                  <View style={styles.slotsGrid}>
                    {matchingSlots.map(slot => {
                      const isSelected = selectedSlots.includes(slot.id);
                      return (
                        <TouchableOpacity
                          key={slot.id}
                          style={[styles.slotCard, isSelected && styles.slotCardSelected]}
                          onPress={() => toggleSlotSelection(slot.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.slotTime}>
                            <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                              {formatTime(slot.startTime)}
                            </Text>
                            <Text style={styles.slotTimeSeparator}>-</Text>
                            <Text style={[styles.slotTimeText, isSelected && styles.slotTimeTextSelected]}>
                              {formatTime(slot.endTime)}
                            </Text>
                          </View>
                          {slot.location && (
                            <Text style={[styles.slotLocation, isSelected && styles.slotLocationSelected]}>
                              📍 {slot.location}
                            </Text>
                          )}
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Feather name="check" size={12} color="#FFFFFF" />
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Continue Button */}
        {selectedSlots.length > 0 && (
          <View style={styles.selectedCountBanner}>
            <View style={styles.selectedCountLeft}>
              <Feather name="check-circle" size={16} color={colors.primary} />
              <Text style={styles.selectedCountText}>{selectedSlots.length} slot(s) selected</Text>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.continueButton, selectedSlots.length === 0 && styles.continueButtonDisabled]}
          onPress={handleContinueToReview}
          disabled={selectedSlots.length === 0}
        >
          <Text style={styles.continueButtonText}>Review Selections</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step 2: Review Selected Slots
  if (currentStep === 2) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Plan Info Header */}
        <View style={styles.planCard}>
          <View style={styles.badgeRow}>
            <View style={styles.membershipBadge}>
              <Feather name="award" size={12} color={colors.primary} style={{ marginRight: 4 }} />
              <Text style={styles.membershipBadgeText}>STEP 2: REVIEW YOUR SELECTIONS</Text>
            </View>
          </View>
          <Text style={styles.planName}>{planName}</Text>
          <Text style={styles.stadiumName}>at {stadiumName}</Text>
        </View>

        {/* Selected Slots Section */}
        <View style={styles.selectedSlotsSection}>
          <View style={styles.selectedSlotsHeader}>
            <View style={styles.selectedSlotsHeaderLeft}>
              <Feather name="check-circle" size={18} color={colors.primary} />
              <Text style={styles.selectedSlotsTitle}>Your Selected Slots</Text>
            </View>
            <View style={styles.selectedSlotsBadge}>
              <Text style={styles.selectedSlotsBadgeText}>{selectedSlots.length}</Text>
            </View>
          </View>

          <Text style={styles.selectedSlotsSubtext}>
            {(() => {
              const selectedDates = selectedSlots
                .map(id => {
                  const s = availableSlots.find(slot => slot.id === id);
                  return s ? new Date(s.startTime) : null;
                })
                .filter(d => d !== null) as Date[];

              const getWeekKey = (date: Date): string => {
                const d = new Date(date);
                const day = d.getDay();
                const diff = d.getDate() - day + (day === 0 ? -6 : 1);
                const monday = new Date(d.setDate(diff));
                return monday.toISOString().split('T')[0];
              };

              const weekGroups: { [weekKey: string]: Set<string> } = {};
              selectedDates.forEach(date => {
                const weekKey = getWeekKey(date);
                if (!weekGroups[weekKey]) {
                  weekGroups[weekKey] = new Set();
                }
                weekGroups[weekKey].add(date.toISOString().split('T')[0]);
              });

              const weekSummaries = Object.keys(weekGroups).map(weekKey => {
                const daysCount = weekGroups[weekKey].size;
                return `${daysCount} day(s)`;
              });

              return `Across ${Object.keys(weekGroups).length} week(s): ${weekSummaries.join(', ')}`;
            })()}
          </Text>

          {/* List of Selected Slots */}
          <View style={styles.selectedSlotsList}>
            {selectedSlots.map(slotId => {
              const slot = availableSlots.find(s => s.id === slotId);
              if (!slot) return null;

              const slotDate = new Date(slot.startTime);
              const dayOfWeek = slotDate.toLocaleDateString('en-US', { weekday: 'short' });
              const fullDate = slotDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

              return (
                <View key={slotId} style={styles.selectedSlotItem}>
                  <View style={styles.selectedSlotItemLeft}>
                    <View style={styles.selectedSlotDateBadge}>
                      <Text style={styles.selectedSlotDateBadgeDay}>{dayOfWeek}</Text>
                      <Text style={styles.selectedSlotDateBadgeDate}>{fullDate}</Text>
                    </View>
                    <View style={styles.selectedSlotDetails}>
                      <Text style={styles.selectedSlotTime}>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </Text>
                      {slot.location && (
                        <Text style={styles.selectedSlotLocation}>📍 {slot.location}</Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => toggleSlotSelection(slotId)}
                    style={styles.removeSlotButton}
                  >
                    <Feather name="x" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueToPayment}
        >
          <Text style={styles.continueButtonText}>Continue to Payment</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Feather name="plus" size={18} color={colors.primary} />
          <Text style={styles.backButtonText}>Add More Slots</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Step 3 & 4: Payment and Receipt Upload
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Progress Indicator */}
      <View style={styles.progressBar}>
        <View style={[styles.progressStep, styles.progressStepComplete]}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </View>
        <View style={[styles.progressLine, styles.progressLineActive]} />
        <View style={[styles.progressStep, styles.progressStepComplete]}>
          <Feather name="check" size={14} color="#FFFFFF" />
        </View>
        <View style={[styles.progressLine, currentStep >= 3 && styles.progressLineActive]} />
        <View style={[styles.progressStep, currentStep >= 3 && styles.progressStepActive]}>
          <Text style={styles.progressStepText}>3</Text>
        </View>
      </View>

      {/* Plan Card */}
      <View style={styles.planCard}>
        <View style={styles.badgeRow}>
          <View style={styles.membershipBadge}>
            <Feather name="award" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.membershipBadgeText}>MEMBERSHIP TIER</Text>
          </View>
        </View>
        <Text style={styles.planName}>{planName}</Text>
        <Text style={styles.stadiumName}>at {stadiumName}</Text>

        <View style={styles.divider} />

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>Price to Pay</Text>
          <Text style={styles.priceValue}>{price.toLocaleString()} ETB</Text>
        </View>
      </View>

      {/* Step 1: Bank Transfer Details */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>1</Text>
          </View>
          <Text style={styles.sectionTitle}>Transfer Payment</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Please transfer the exact amount via your bank app to the stadium bank account below:
        </Text>

        {bankName ? (
          <View style={styles.bankBox}>
            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabelWrapper}>
                <Feather name="home" size={14} color="#8B9A94" style={{ marginRight: 8 }} />
                <Text style={styles.bankDetailLabel}>Bank Name</Text>
              </View>
              <Text style={styles.bankDetailValue}>{bankName}</Text>
            </View>

            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabelWrapper}>
                <Feather name="credit-card" size={14} color="#8B9A94" style={{ marginRight: 8 }} />
                <Text style={styles.bankDetailLabel}>Account Number</Text>
              </View>
              <View style={styles.valueCopyWrapper}>
                <Text style={styles.bankDetailValueHighlight}>{accountNumber}</Text>
                <TouchableOpacity
                  onPress={() => handleCopy(accountNumber || '', 'Account number')}
                  style={styles.copyBtn}
                >
                  <Feather name="copy" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.bankDetailRow}>
              <View style={styles.bankDetailLabelWrapper}>
                <Feather name="user" size={14} color="#8B9A94" style={{ marginRight: 8 }} />
                <Text style={styles.bankDetailLabel}>Account Holder</Text>
              </View>
              <Text style={styles.bankDetailValue}>{accountHolderName}</Text>
            </View>

            <View style={[styles.bankDetailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.bankDetailLabelWrapper}>
                <Feather name="dollar-sign" size={14} color="#8B9A94" style={{ marginRight: 8 }} />
                <Text style={styles.bankDetailLabel}>Total Amount</Text>
              </View>
              <Text style={styles.amountValue}>{price.toLocaleString()} ETB</Text>
            </View>
          </View>
        ) : (
          <View style={styles.warningBox}>
            <Feather name="alert-triangle" size={20} color="#CA8A04" style={{ marginRight: 8 }} />
            <Text style={styles.warningText}>
              Stadium owner has not provided bank details. Please contact the stadium directly.
            </Text>
          </View>
        )}
      </View>

      {/* Step 2: Upload Receipt */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepNumber}>2</Text>
          </View>
          <Text style={styles.sectionTitle}>Upload Receipt</Text>
        </View>
        <Text style={styles.sectionSubtitle}>
          Take a screenshot or photo of your transaction success screen and upload it here:
        </Text>

        {receiptImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: receiptImage.uri }} style={styles.receiptPreview} resizeMode="cover" />
            <TouchableOpacity style={styles.replaceBtn} onPress={handlePickImage}>
              <Feather name="refresh-cw" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.replaceBtnText}>Replace Receipt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadPlaceholder} onPress={handlePickImage} activeOpacity={0.8}>
            <View style={styles.uploadPlaceholderIcon}>
              <Feather name="image" size={32} color={colors.primary} />
            </View>
            <Text style={styles.uploadPlaceholderText}>Choose Receipt Screenshot</Text>
            <Text style={styles.uploadPlaceholderSubtext}>Supports JPG, PNG (Max 5MB)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!receiptImage || submitting || !bankName) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={!receiptImage || submitting || !bankName}
        activeOpacity={0.9}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Feather name="check-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.submitButtonText}>Submit Application</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setCurrentStep(2)}
        disabled={submitting}
      >
        <Feather name="arrow-left" size={18} color={colors.primary} />
        <Text style={styles.backButtonText}>Go Back to Review</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        By submitting, you declare that you have wired the specified amount. Intentional upload of fake receipts may lead to account suspension.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E0D',
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 60,
    gap: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E0D',
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A2520',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A3530',
  },
  progressStepActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressStepComplete: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressStepText: {
    color: '#8B9A94',
    fontSize: 14,
    fontWeight: '800',
  },
  progressLine: {
    width: 40,
    height: 2,
    backgroundColor: '#1A2520',
    marginHorizontal: spacing.xs,
  },
  progressLineActive: {
    backgroundColor: colors.primary,
  },
  planCard: {
    backgroundColor: '#0F1713',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.25)',
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  membershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  membershipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  stadiumName: {
    fontSize: 14,
    color: '#8B9A94',
    fontWeight: '600',
    marginTop: 2,
  },
  constraintsBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.05)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.15)',
    gap: spacing.xs,
  },
  constraintText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  instructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  instructionText: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    fontWeight: '500',
  },
  selectedSummary: {
    padding: spacing.md,
    backgroundColor: '#0F1713',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  selectedSummaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  selectedSummarySubtext: {
    fontSize: 12,
    color: '#8B9A94',
    marginTop: 2,
  },
  selectedSlotsSection: {
    backgroundColor: '#0F1713',
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    padding: spacing.lg,
    gap: spacing.md,
  },
  selectedSlotsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedSlotsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedSlotsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedSlotsBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  selectedSlotsBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedSlotsSubtext: {
    fontSize: 13,
    color: '#8B9A94',
    fontWeight: '600',
    lineHeight: 18,
  },
  selectedSlotsList: {
    gap: spacing.sm,
  },
  selectedSlotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    padding: spacing.md,
  },
  selectedSlotItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  selectedSlotDateBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignItems: 'center',
    minWidth: 50,
  },
  selectedSlotDateBadgeDay: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  selectedSlotDateBadgeDate: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  selectedSlotDetails: {
    flex: 1,
    gap: 4,
  },
  selectedSlotTime: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  selectedSlotLocation: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B9A94',
  },
  removeSlotButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateGroupHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.sm,
    paddingLeft: spacing.xs,
  },
  searchSection: {
    backgroundColor: '#0F1713',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#1A2520',
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  searchSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B9A94',
    marginBottom: spacing.md,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B9A94',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterScroll: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#1A2520',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: '#2A3530',
  },
  filterChipActive: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B9A94',
  },
  filterChipTextActive: {
    color: colors.primary,
  },
  resultsCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#1A2520',
  },
  resultsCountText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  clearFilters: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderRadius: radius.sm,
  },
  clearFiltersText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  resultsContainer: {
    gap: spacing.lg,
  },
  dateSection: {
    backgroundColor: '#0F1713',
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: '#1A2520',
    overflow: 'hidden',
  },
  dateSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: '#1A2520',
    borderBottomWidth: 1,
    borderBottomColor: '#2A3530',
  },
  dateSectionHeaderSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderBottomColor: 'rgba(34, 197, 94, 0.3)',
  },
  dateInfo: {
    flex: 1,
  },
  dateDayOfWeek: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  dateDayOfWeekSelected: {
    color: colors.primary,
  },
  dateFullDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B9A94',
    marginTop: 2,
  },
  dateFullDateSelected: {
    color: 'rgba(34, 197, 94, 0.8)',
  },
  selectedIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthSelector: {
    marginBottom: spacing.lg,
  },
  monthScrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  monthButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: '#0F1713',
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: '#1A2520',
  },
  monthButtonSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.primary,
  },
  monthButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B9A94',
  },
  monthButtonTextSelected: {
    color: colors.primary,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  dateCard: {
    width: '31%',
    backgroundColor: '#0F1713',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#1A2520',
    overflow: 'hidden',
  },
  dateHeader: {
    padding: spacing.sm,
    backgroundColor: '#1A2520',
    alignItems: 'center',
  },
  dateHeaderSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  dayOfWeek: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B9A94',
    textTransform: 'uppercase',
  },
  dayOfWeekSelected: {
    color: colors.primary,
  },
  dayOfMonth: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  dayOfMonthSelected: {
    color: colors.primary,
  },
  slotsInDate: {
    padding: spacing.xs,
    gap: spacing.xs,
  },
  miniSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xs,
    backgroundColor: '#1A2520',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#2A3530',
  },
  miniSlotCardSelected: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderColor: colors.primary,
  },
  miniSlotTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  miniSlotTimeSelected: {
    color: colors.primary,
  },
  moreSlots: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8B9A94',
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  slotCard: {
    width: '48%',
    padding: spacing.md,
    backgroundColor: '#0F1713',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#1A2520',
    position: 'relative',
  },
  slotCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
  },
  slotTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.xs,
  },
  slotTimeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  slotTimeTextSelected: {
    color: colors.primary,
  },
  slotTimeSeparator: {
    fontSize: 12,
    color: '#8B9A94',
  },
  slotLocation: {
    fontSize: 11,
    color: '#8B9A94',
    fontWeight: '600',
  },
  slotLocationSelected: {
    color: colors.primary,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: spacing.xl * 2,
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#8B9A94',
    textAlign: 'center',
    lineHeight: 18,
  },
  continueButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: spacing.md,
  },
  continueButtonDisabled: {
    backgroundColor: '#1A2520',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.5,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  selectedCountBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  selectedCountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  selectedCountText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.primary,
  },
  backButton: {
    backgroundColor: '#0F1713',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(34, 197, 94, 0.3)',
    marginTop: spacing.sm,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A2520',
    marginVertical: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#8B9A94',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  section: {
    backgroundColor: '#0F1713',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#1A2520',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8B9A94',
    lineHeight: 18,
    fontWeight: '500',
  },
  bankBox: {
    backgroundColor: 'rgba(34, 197, 94, 0.04)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.12)',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2520',
  },
  bankDetailLabelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankDetailLabel: {
    fontSize: 13,
    color: '#8B9A94',
    fontWeight: '600',
  },
  bankDetailValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  valueCopyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bankDetailValueHighlight: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  copyBtn: {
    padding: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
  },
  amountValue: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '900',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#CA8A04',
    fontWeight: '600',
    lineHeight: 16,
  },
  previewContainer: {
    position: 'relative',
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#1A2520',
  },
  receiptPreview: {
    width: '100%',
    height: '100%',
  },
  replaceBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 14, 13, 0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  replaceBtnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadPlaceholder: {
    height: 160,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(34, 197, 94, 0.3)',
    backgroundColor: '#0A0E0D',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  uploadPlaceholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  uploadPlaceholderSubtext: {
    fontSize: 11,
    color: '#8B9A94',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    backgroundColor: '#1A2520',
    borderColor: '#2A3530',
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  disclaimer: {
    fontSize: 11,
    color: '#6B7B75',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: spacing.md,
  },
});
