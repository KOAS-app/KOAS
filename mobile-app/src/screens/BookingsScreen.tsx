import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Modal, Image,
  ScrollView, TextInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing, typography } from '../theme';
import { API_BASE_URL } from '../config/api';
import type { Booking } from '../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Bookings'>;
type FilterStatus = 'all' | 'PENDING' | 'CONFIRMED' | 'CANCELLED';

const statusStyle: Record<string, { bg: string; text: string; border: string }> = {
  PENDING:   { bg: 'rgba(234, 179, 8, 0.15)', text: '#CA8A04', border: 'rgba(234, 179, 8, 0.3)' },
  CONFIRMED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)' },
};

const paymentStyle: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING:           { bg: 'rgba(234, 179, 8, 0.15)', text: '#CA8A04', border: 'rgba(234, 179, 8, 0.3)', label: 'Awaiting Payment' },
  RECEIPT_SUBMITTED: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.3)', label: 'Receipt Submitted' },
  PAID:              { bg: 'rgba(34, 197, 94, 0.15)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.3)', label: 'Paid ✓' },
  REJECTED:          { bg: 'rgba(239, 68, 68, 0.15)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Receipt Rejected' },
  DISPUTED:          { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7', border: 'rgba(168, 85, 247, 0.3)', label: 'Disputed' },
};

export default function BookingsScreen() {
  const [bookings, setBookings]     = useState<Booking[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Receipt modal state
  const [receiptModal, setReceiptModal]   = useState<Booking | null>(null);
  const [uploading, setUploading]         = useState(false);
  const [rejectModal, setRejectModal]     = useState<Booking | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputing, setDisputing]         = useState(false);

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
        text: 'Yes', style: 'destructive',
        onPress: async () => {
          setCancelling(bookingId);
          try {
            await api.patch(`/bookings/${bookingId}/cancel`);
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b));
          } catch (err) {
            Alert.alert('Error', getApiError(err, 'Failed to cancel booking.'));
          } finally {
            setCancelling(null);
          }
        },
      },
    ]);
  };

  // ─── Upload receipt ──────────────────────────────────────────────────────────
  const handleUploadReceipt = async (booking: Booking) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setUploading(true);

    try {
      // Upload the image file
      const formData = new FormData();
      formData.append('receipt', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: `receipt-${Date.now()}.jpg`,
      } as any);

      const uploadRes = await api.post('/upload/receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { imageUrl } = uploadRes.data;

      // Submit receipt URL to payment
      await api.patch(`/payments/${booking.payment!.id}/submit-receipt`, { receiptImageUrl: imageUrl });

      Alert.alert('Receipt Submitted', 'Your payment receipt has been sent to the owner for review.');
      fetchBookings();
    } catch (err) {
      Alert.alert('Upload Failed', getApiError(err, 'Failed to upload receipt.'));
    } finally {
      setUploading(false);
    }
  };

  // ─── Dispute rejection ───────────────────────────────────────────────────────
  const handleDispute = async (booking: Booking) => {
    if (!disputeReason.trim()) {
      Alert.alert('Reason Required', 'Please explain why you are disputing this rejection.');
      return;
    }
    setDisputing(true);
    try {
      await api.patch(`/payments/${booking.payment!.id}/dispute`, { reason: disputeReason });
      Alert.alert('Dispute Submitted', 'Your dispute has been sent to the admin for review.');
      setRejectModal(null);
      setDisputeReason('');
      fetchBookings();
    } catch (err) {
      Alert.alert('Error', getApiError(err, 'Failed to submit dispute.'));
    } finally {
      setDisputing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filterStatus);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>View and manage your upcoming bookings</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterTabs}
      >
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'all' && styles.filterTabTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'PENDING' && styles.filterTabActive]}
          onPress={() => setFilterStatus('PENDING')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'PENDING' && styles.filterTabTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'CONFIRMED' && styles.filterTabActive]}
          onPress={() => setFilterStatus('CONFIRMED')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'CONFIRMED' && styles.filterTabTextActive]}>
            Confirmed
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'CANCELLED' && styles.filterTabActive]}
          onPress={() => setFilterStatus('CANCELLED')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'CANCELLED' && styles.filterTabTextActive]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptyText}>
              {filterStatus === 'all' ? 'You haven\'t made any bookings yet' : `No ${filterStatus.toLowerCase()} bookings`}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const pStyle = item.payment ? paymentStyle[item.payment.status] : null;
          const sStyle = statusStyle[item.status];
          const canUploadReceipt = item.payment &&
            (item.payment.status === 'PENDING' || item.payment.status === 'REJECTED') &&
            item.status === 'CONFIRMED';
          const isRejected = item.payment?.status === 'REJECTED';

          return (
            <View style={styles.card}>
              {/* Left border indicator */}
              <View style={[styles.cardBorder, { backgroundColor: sStyle.text }]} />

              {/* Card icon */}
              <View style={styles.cardIcon}>
                <Text style={styles.cardIconText}>📅</Text>
              </View>

              <View style={styles.cardContent}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <Text style={styles.stadiumName}>{item.stadium.name}</Text>
                  <View style={[styles.badge, { backgroundColor: sStyle.bg, borderColor: sStyle.border }]}>
                    <Text style={[styles.badgeText, { color: sStyle.text }]}>{item.status}</Text>
                  </View>
                </View>

                {/* Date */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📅</Text>
                  <Text style={styles.infoText}>
                    {new Date(item.slot.startTime).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </Text>
                </View>

                {/* Time */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>🕐</Text>
                  <Text style={styles.infoText}>
                    {new Date(item.slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {new Date(item.slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                {/* Location */}
                <View style={styles.infoRow}>
                  <Text style={styles.infoIcon}>📍</Text>
                  <Text style={styles.infoText}>{item.slot.location}</Text>
                </View>

                {/* Price + payment status */}
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{item.slot.price.toLocaleString()} ETB</Text>
                  {pStyle && (
                    <View style={[styles.paymentBadge, { backgroundColor: pStyle.bg, borderColor: pStyle.border }]}>
                      <Text style={[styles.paymentBadgeText, { color: pStyle.text }]}>{pStyle.label}</Text>
                    </View>
                  )}
                </View>

                {/* Bank account info (shown when payment is PENDING) */}
                {item.payment?.status === 'PENDING' && item.status === 'CONFIRMED' && (
                  item.stadium.bankName ? (
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankInfoTitle}>💳 Transfer Payment To:</Text>
                      <Text style={styles.bankInfoRow}>
                        <Text style={styles.bankInfoLabel}>Bank: </Text>
                        <Text style={styles.bankInfoValue}>{item.stadium.bankName}</Text>
                      </Text>
                      <Text style={styles.bankInfoRow}>
                        <Text style={styles.bankInfoLabel}>Account: </Text>
                        <Text style={styles.bankInfoValue}>{item.stadium.accountNumber}</Text>
                      </Text>
                      <Text style={styles.bankInfoRow}>
                        <Text style={styles.bankInfoLabel}>Name: </Text>
                        <Text style={styles.bankInfoValue}>{item.stadium.accountHolderName}</Text>
                      </Text>
                      <Text style={styles.bankInfoRow}>
                        <Text style={styles.bankInfoLabel}>Amount: </Text>
                        <Text style={[styles.bankInfoValue, { color: colors.primary, fontWeight: '800' }]}>
                          {item.slot.price.toLocaleString()} ETB
                        </Text>
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.bankInfoMissing}>
                      <Text style={styles.bankInfoMissingText}>
                        ⚠️ Owner hasn't added bank details yet. Contact them directly.
                      </Text>
                    </View>
                  )
                )}

                {/* Rejection reason */}
                {isRejected && item.payment?.ownerRejectionReason && (
                  <View style={styles.rejectionBox}>
                    <Text style={styles.rejectionTitle}>❌ Receipt Rejected</Text>
                    <Text style={styles.rejectionReason}>{item.payment.ownerRejectionReason}</Text>
                  </View>
                )}

                {/* Action buttons */}
                <View style={styles.actions}>
                  {item.status === 'PENDING' && (
                    <TouchableOpacity
                      style={[styles.cancelBtn, cancelling === item.id && styles.btnDisabled]}
                      onPress={() => handleCancel(item.id)}
                      disabled={cancelling === item.id}
                    >
                      <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </TouchableOpacity>
                  )}

                  {canUploadReceipt && (
                    <TouchableOpacity
                      style={[styles.uploadBtn, uploading && styles.btnDisabled]}
                      onPress={() => handleUploadReceipt(item)}
                      disabled={uploading}
                    >
                      {uploading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.uploadBtnText}>
                          {isRejected ? '📎 Re-upload Receipt' : '📎 Upload Receipt'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}

                  {isRejected && item.payment?.status !== 'DISPUTED' && (
                    <TouchableOpacity
                      style={styles.disputeBtn}
                      onPress={() => setRejectModal(item)}
                    >
                      <Text style={styles.disputeBtnText}>Dispute Rejection</Text>
                    </TouchableOpacity>
                  )}

                  {item.payment?.status === 'RECEIPT_SUBMITTED' && (
                    <TouchableOpacity
                      style={styles.viewReceiptBtn}
                      onPress={() => setReceiptModal(item)}
                    >
                      <Text style={styles.viewReceiptBtnText}>👁 View Submitted Receipt</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      {/* Receipt Viewer Modal */}
      <Modal visible={!!receiptModal} transparent animationType="fade" onRequestClose={() => setReceiptModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submitted Receipt</Text>
              <TouchableOpacity onPress={() => setReceiptModal(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            {receiptModal?.payment?.receiptImageUrl && (
              <Image
                source={{ uri: `${API_BASE_URL}${receiptModal.payment.receiptImageUrl}` }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            )}
            <Text style={styles.receiptNote}>
              Waiting for owner to confirm this receipt.
            </Text>
          </View>
        </View>
      </Modal>

      {/* Dispute Modal */}
      <Modal visible={!!rejectModal} transparent animationType="slide" onRequestClose={() => setRejectModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dispute Rejection</Text>
              <TouchableOpacity onPress={() => setRejectModal(null)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.disputeInfo}>
              Explain why you believe your receipt was incorrectly rejected. An admin will review your case.
            </Text>
            <TextInput
              style={styles.disputeInput}
              placeholder="e.g. I transferred the correct amount on May 15..."
              placeholderTextColor={colors.text.muted}
              value={disputeReason}
              onChangeText={setDisputeReason}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.uploadBtn, disputing && styles.btnDisabled]}
              onPress={() => rejectModal && handleDispute(rejectModal)}
              disabled={disputing}
            >
              {disputing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.uploadBtnText}>Submit Dispute</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0A0E0D' },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E0D' },
  header:     { backgroundColor: '#0A0E0D', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:{ fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: '#8B9A94', fontWeight: '500' },
  
  filterTabs: { paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#1A2520',
  },
  filterTabActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B9A94',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
  },

  list: { padding: 20, paddingBottom: 100, gap: 16 },

  card: {
    backgroundColor: '#0F1713',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1A2520',
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardBorder: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardIcon: {
    width: 56,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 20,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    gap: 10,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  stadiumName: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', flex: 1, letterSpacing: -0.3 },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#8B9A94',
    fontWeight: '500',
  },

  cardFooter:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price:       { fontSize: 20, fontWeight: '900', color: '#22C55E', letterSpacing: -0.5 },
  badge:       { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  badgeText:   { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  paymentBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  paymentBadgeText: { fontSize: 11, fontWeight: '600' },

  // Bank info
  bankInfo: {
    backgroundColor: 'rgba(34, 197, 94, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
    gap: 4,
    marginTop: 4,
  },
  bankInfoTitle: { fontSize: 13, fontWeight: '700', color: '#22C55E', marginBottom: 4 },
  bankInfoRow:   { fontSize: 13, color: '#D1D5DB' },
  bankInfoLabel: { fontWeight: '600', color: '#8B9A94' },
  bankInfoValue: { fontWeight: '600', color: '#FFFFFF' },
  bankInfoMissing: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    marginTop: 4,
  },
  bankInfoMissingText: { fontSize: 12, color: '#CA8A04', fontWeight: '600' },

  // Rejection
  rejectionBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 4,
    marginTop: 4,
  },
  rejectionTitle:  { fontSize: 13, fontWeight: '700', color: '#EF4444' },
  rejectionReason: { fontSize: 13, color: '#FCA5A5' },

  // Actions
  actions:    { flexDirection: 'column', gap: 8, marginTop: 8 },
  cancelBtn:  { backgroundColor: '#EF4444', borderRadius: 12, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  uploadBtn:  { backgroundColor: '#22C55E', borderRadius: 12, padding: 12, alignItems: 'center' },
  uploadBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  disputeBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#A855F7',
  },
  disputeBtnText: { color: '#A855F7', fontSize: 14, fontWeight: '700' },
  viewReceiptBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1A2520',
  },
  viewReceiptBtnText: { color: '#8B9A94', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },

  // Empty
  empty:     { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 64, marginBottom: 16, opacity: 0.3 },
  emptyTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '800', marginBottom: 8 },
  emptyText: { fontSize: 14, color: '#8B9A94', fontWeight: '500', textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#0F1713',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1A2520',
    gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle:  { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  modalClose:  { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1A2520', justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: '#8B9A94', fontWeight: '700' },
  receiptImage: { width: '100%', height: 300, borderRadius: 12 },
  receiptNote:  { fontSize: 13, color: '#8B9A94', textAlign: 'center', fontWeight: '500' },

  // Dispute
  disputeInfo:  { fontSize: 14, color: '#D1D5DB', lineHeight: 20 },
  disputeInput: {
    backgroundColor: '#1A2520',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#2A3530',
    minHeight: 100,
    textAlignVertical: 'top',
  },
});
