import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius } from '../theme';
import type { Booking } from '../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Bookings'>;

const statusStyle: Record<string, { bg: string; text: string }> = {
  PENDING:   { bg: '#FEF9C3', text: '#854D0E' },
  CONFIRMED: { bg: '#DCFCE7', text: '#166534' },
  CANCELLED: { bg: '#FEE2E2', text: '#991B1B' },
};

const paymentStyle: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#FEF9C3', text: '#854D0E' },
  PAID:    { bg: '#DCFCE7', text: '#166534' },
  FAILED:  { bg: '#FEE2E2', text: '#991B1B' },
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (err) {
      Alert.alert('Error', getApiError(err, 'Failed to load bookings.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const onRefresh = () => { setRefreshing(true); fetchBookings(); };

  const handleCancel = (bookingId: string) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel this booking?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        style: 'destructive',
        onPress: async () => {
          setCancelling(bookingId);
          try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            setBookings((prev) =>
              prev.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b))
            );
          } catch (err) {
            Alert.alert('Error', getApiError(err, 'Failed to cancel booking.'));
          } finally {
            setCancelling(null);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No bookings yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.stadiumName}>{item.stadium.name}</Text>
              <View style={[styles.badge, { backgroundColor: statusStyle[item.status].bg }]}>
                <Text style={[styles.badgeText, { color: statusStyle[item.status].text }]}>
                  {item.status}
                </Text>
              </View>
            </View>

            <Text style={styles.slotTime}>
              {new Date(item.slot.startTime).toLocaleString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}{' '}
              – {new Date(item.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>

            <View style={styles.cardFooter}>
              <Text style={styles.price}>{item.slot.price.toLocaleString()} ETB</Text>
              {item.payment && (
                <View style={[styles.badge, { backgroundColor: paymentStyle[item.payment.status].bg }]}>
                  <Text style={[styles.badgeText, { color: paymentStyle[item.payment.status].text }]}>
                    💵 {item.payment.status}
                  </Text>
                </View>
              )}
            </View>

            {item.status === 'PENDING' && (
              <TouchableOpacity
                style={[styles.cancelBtn, cancelling === item.id && styles.cancelBtnDisabled]}
                onPress={() => handleCancel(item.id)}
                disabled={cancelling === item.id}
              >
                <Text style={styles.cancelBtnText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface },
  header: { backgroundColor: colors.sidebar, padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: colors.textInverse },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stadiumName: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  slotTime: { fontSize: 13, color: colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 15, fontWeight: '700', color: colors.primary },
  badge: { borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  cancelBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { color: colors.textInverse, fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.textMuted },
});
