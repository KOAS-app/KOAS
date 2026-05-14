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
              <View style={[styles.badge, { 
                backgroundColor: statusStyle[item.status].bg,
                borderColor: item.status === 'CONFIRMED' ? '#BBF7D0' : item.status === 'PENDING' ? '#FDE68A' : '#FECACA'
              }]}>
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
                <View style={[styles.badge, { 
                  backgroundColor: paymentStyle[item.payment.status].bg,
                  borderColor: item.payment.status === 'PAID' ? '#BBF7D0' : item.payment.status === 'PENDING' ? '#FDE68A' : '#FECACA'
                }]}>
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
  container: { flex: 1, backgroundColor: colors.dark.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark.bg },
  header: { backgroundColor: colors.dark.surface, padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 10,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  stadiumName: { fontSize: 16, fontWeight: '800', color: colors.text.primary, flex: 1, letterSpacing: -0.3 },
  slotTime: { fontSize: 13, color: colors.text.muted, fontWeight: '600' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price: { fontSize: 16, fontWeight: '900', color: colors.primary, letterSpacing: -0.3 },
  badge: { borderRadius: radius.md, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  cancelBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnDisabled: { opacity: 0.5 },
  cancelBtnText: { color: colors.text.inverse, fontSize: 14, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.5 },
  emptyText: { fontSize: 16, color: colors.text.muted, fontWeight: '600' },
});
