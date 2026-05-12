import { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius } from '../theme';
import type { Stadium, Slot } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'StadiumDetail'>;

export default function StadiumDetailScreen({ route, navigation }: Props) {
  const { stadiumId, stadiumName } = route.params;
  const [stadium, setStadium] = useState<Stadium & { slots: Slot[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/stadiums/${stadiumId}`);
        setStadium(res.data);
      } catch (err) {
        Alert.alert('Error', getApiError(err, 'Failed to load stadium.'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [stadiumId, navigation]);

  const handleBook = async (slotId: string, price: number) => {
    Alert.alert(
      'Confirm Booking',
      `Book this slot for ${price.toLocaleString()} ETB?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: async () => {
            setBooking(true);
            try {
              await api.post('/bookings', { slotId });
              Alert.alert('Success', 'Booking created! Check your history.', [
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!stadium) return null;

  const availableSlots = stadium.slots.filter((s) => !s.isBooked);
  const grouped = availableSlots.reduce<Record<string, Slot[]>>((acc, slot) => {
    const day = new Date(slot.startTime).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(slot);
    return acc;
  }, {});

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{stadium.name}</Text>
        <Text style={styles.location}>📍 {stadium.location}</Text>
        {stadium.description ? <Text style={styles.desc}>{stadium.description}</Text> : null}
        <Text style={styles.owner}>Owner: {stadium.owner.name}</Text>
      </View>

      {/* Slots */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Slots</Text>
        {availableSlots.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🕐</Text>
            <Text style={styles.emptyText}>No available slots</Text>
          </View>
        ) : (
          Object.entries(grouped).map(([day, slots]) => (
            <View key={day} style={styles.dayGroup}>
              <Text style={styles.dayLabel}>
                {new Date(slots[0].startTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </Text>
              {slots.map((slot) => (
                <View key={slot.id} style={styles.slotCard}>
                  <View style={styles.slotInfo}>
                    <Text style={styles.slotTime}>
                      {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text style={styles.slotPrice}>{slot.price.toLocaleString()} ETB</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.bookBtn, booking && styles.bookBtnDisabled]}
                    onPress={() => handleBook(slot.id, slot.price)}
                    disabled={booking}
                  >
                    <Text style={styles.bookBtnText}>Book</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  header: { backgroundColor: colors.card, padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { fontSize: 22, fontWeight: '700', color: colors.textPrimary },
  location: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  desc: { fontSize: 14, color: colors.textMuted, marginTop: 8 },
  owner: { fontSize: 12, color: colors.textMuted, marginTop: 8 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 12 },
  dayGroup: { marginBottom: 20 },
  dayLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginBottom: 8 },
  slotCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotInfo: { flex: 1 },
  slotTime: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
  slotPrice: { fontSize: 13, fontWeight: '700', color: colors.primary, marginTop: 2 },
  bookBtn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 8 },
  bookBtnDisabled: { opacity: 0.5 },
  bookBtnText: { color: colors.textInverse, fontSize: 14, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted },
});
