import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  RefreshControl, TouchableOpacity, Alert, Modal, Image,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
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
  PENDING:   { bg: colors.warningBg, text: colors.warning, border: 'rgba(245, 158, 11, 0.25)' },
  CONFIRMED: { bg: colors.successBg, text: colors.secondary, border: 'rgba(46, 111, 64, 0.3)' },
  CANCELLED: { bg: colors.dangerBg, text: colors.danger, border: 'rgba(239, 68, 68, 0.3)' },
};

const paymentStyle: Record<string, { bg: string; text: string; border: string; label: string }> = {
  PENDING:           { bg: colors.warningBg, text: colors.warning, border: 'rgba(245, 158, 11, 0.25)', label: 'Awaiting Payment' },
  RECEIPT_SUBMITTED: { bg: colors.infoBg, text: colors.info, border: 'rgba(59, 130, 246, 0.35)', label: 'Receipt Submitted' },
  PAID:              { bg: colors.successBg, text: colors.success, border: colors.successBg, label: 'Paid ✓' },
  REJECTED:          { bg: colors.dangerBg, text: colors.danger, border: 'rgba(239, 68, 68, 0.3)', label: 'Receipt Rejected' },

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
  const [previewReceipt, setPreviewReceipt] = useState<{ uri: string; mimeType?: string; booking: Booking } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null); // For viewing booking pass

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

  // ─── Pick and Preview receipt ────────────────────────────────────────────────
  const pickReceiptImage = async (booking: Booking) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      console.log('ImagePicker result:', result);

      if (result.canceled || !result.assets || !result.assets[0]) {
        console.log('Image selection cancelled or no asset returned');
        return;
      }

      const ext = result.assets[0].mimeType?.split('/')[1] || 'jpg';

      setPreviewReceipt({
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType,
        booking,
      });
    } catch (err) {
      console.error('pickReceiptImage error:', err);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  // ─── Submit Receipt ──────────────────────────────────────────────────────────
  const submitReceipt = async () => {
    if (!previewReceipt) return;
    setUploading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const ext = previewReceipt.mimeType?.split('/')[1] || 'jpg';

      const uploadResult = await FileSystem.uploadAsync(
        `${API_BASE_URL}/api/upload/receipt`,
        previewReceipt.uri,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'receipt',
          mimeType: previewReceipt.mimeType || 'image/jpeg',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          parameters: {
            filename: `receipt-${Date.now()}.${ext}`,
          },
        }
      );

      const uploadData = JSON.parse(uploadResult.body);
      if (!uploadData.imageUrl) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      await api.patch(`/payments/${previewReceipt.booking.payment!.id}/submit-receipt`, { receiptImageUrl: uploadData.imageUrl });

      Alert.alert('Receipt Submitted', 'Your payment receipt has been sent to the owner for review.');
      setPreviewReceipt(null);
      fetchBookings();
    } catch (err) {
      const axiosErr = err as any;
      console.error('Receipt upload error:', axiosErr.response?.data || axiosErr.message || axiosErr);
      Alert.alert('Upload Failed', getApiError(err, 'Failed to upload receipt.'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
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
      <View style={styles.filterTabsWrapper}>
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
      </View>

      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.secondary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="clipboard" size={64} color={colors.text.secondary} style={{ marginBottom: 16, opacity: 0.5 }} />
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
              <View style={[styles.cardLeftLine, { backgroundColor: sStyle.text }]} />

              <View style={styles.cardInner}>
                <View style={styles.cardTop}>
                  <View style={styles.iconCircle}>
                    <Feather name="calendar" size={20} color={colors.secondary} />
                  </View>

                  <View style={styles.cardMain}>
                    <View style={styles.cardHeaderRow}>
                      <Text style={styles.stadiumName} numberOfLines={1}>{item.stadium.name}</Text>
                      <View style={[styles.badge, { backgroundColor: sStyle.bg, borderColor: sStyle.border }]}>
                        <Text style={[styles.badgeText, { color: sStyle.text }]}>{item.status}</Text>
                      </View>
                    </View>


                    <View style={styles.infoRow}>
                      <Feather name="calendar" size={14} color={colors.text.muted} />
                      <Text style={styles.infoText}>
                        {new Date(item.slot.startTime).toLocaleDateString('en-US', {
                          weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC',
                        })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="clock" size={14} color={colors.text.muted} />
                      <Text style={styles.infoText}>
                        {new Date(item.slot.startTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                        {' – '}
                        {new Date(item.slot.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Feather name="map-pin" size={14} color="#EF4444" />
                      <Text style={styles.infoText}>{item.slot.location}</Text>
                    </View>
                  </View>
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
                        <Text style={[styles.bankInfoValue, { color: colors.secondary, fontWeight: '800' }]}>
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

                <View style={styles.divider} />

                <View style={styles.cardFooter}>
                  <Text style={styles.price}>{item.slot.price.toLocaleString()} ETB</Text>
                  {pStyle && (
                    <View style={[styles.paymentBadge, { backgroundColor: pStyle.bg, borderColor: pStyle.border }]}>
                      <Text style={[styles.paymentBadgeText, { color: pStyle.text }]}>{pStyle.label}</Text>
                    </View>
                  )}
                </View>

                {/* Action buttons */}
                {(item.status === 'PENDING' || canUploadReceipt || (isRejected && item.payment?.status !== 'DISPUTED') || item.payment?.status === 'RECEIPT_SUBMITTED' || item.status === 'CONFIRMED') && (
                  <View style={styles.actions}>
                    {item.status === 'CONFIRMED' && item.bookingCode && (
                      <TouchableOpacity
                        style={styles.viewPassBtn}
                        onPress={() => setSelectedBooking(item)}
                      >
                        <Feather name="credit-card" size={14} color={colors.secondary} style={{ marginRight: 6 }} />
                        <Text style={styles.viewPassBtnText}>View Booking Pass</Text>
                      </TouchableOpacity>
                    )}

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
                        onPress={() => pickReceiptImage(item)}
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

                    {item.payment?.status === 'RECEIPT_SUBMITTED' && (
                      <TouchableOpacity
                        style={styles.viewReceiptBtn}
                        onPress={() => setReceiptModal(item)}
                      >
                        <Text style={styles.viewReceiptBtnText}>👁 View Submitted Receipt</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
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

      {/* Receipt Preview Modal */}
      <Modal visible={!!previewReceipt} transparent animationType="fade" onRequestClose={() => !uploading && setPreviewReceipt(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Preview Receipt</Text>
              {!uploading && (
                <TouchableOpacity onPress={() => setPreviewReceipt(null)} style={styles.modalClose}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
            {previewReceipt?.uri && (
              <Image
                source={{ uri: previewReceipt.uri }}
                style={styles.receiptImage}
                resizeMode="contain"
              />
            )}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <TouchableOpacity 
                style={[styles.disputeBtn, { flex: 1, borderColor: colors.text.muted }]} 
                onPress={() => pickReceiptImage(previewReceipt!.booking)}
                disabled={uploading}
              >
                <Text style={[styles.disputeBtnText, { color: colors.text.muted }]}>Replace</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.uploadBtn, { flex: 1 }, uploading && styles.btnDisabled]} 
                onPress={submitReceipt}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.uploadBtnText}>Submit Receipt</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Booking Pass Modal */}
      <Modal
        visible={!!selectedBooking}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedBooking(null)}
      >
        <View style={styles.passModalOverlay}>
          <View style={styles.passModalContent}>
            {/* Drag handle */}
            <View style={styles.dragHandle} />

            {/* Close Button */}
            <TouchableOpacity style={styles.closePassBtn} onPress={() => setSelectedBooking(null)}>
                <Feather name="x" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            {/* Pass Header */}
            <Text style={styles.passModalHeading}>Digital Booking Pass</Text>
            <Text style={styles.passModalSubheading}>Present this pass at the turf to check in</Text>

            {/* Booking Pass Card */}
            {selectedBooking && (
              <View style={styles.passTicket}>
                {/* Header */}
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketTitle}>{selectedBooking.stadium.name}</Text>
                  <View style={styles.ticketValidBadge}>
                    <Text style={styles.ticketValidText}>CONFIRMED</Text>
                  </View>
                </View>

                <Text style={styles.ticketLocation}>📍 {selectedBooking.slot.location}</Text>

                {/* Divider with notches */}
                <View style={styles.ticketDividerWrapper}>
                  <View style={styles.ticketLeftNotch} />
                  <View style={styles.ticketDashedLine} />
                  <View style={styles.ticketRightNotch} />
                </View>

                {/* Body */}
                <View style={styles.ticketBody}>
                  {/* Booking Code */}
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>BOOKING CODE</Text>
                    <Text style={styles.codeText}>{selectedBooking.bookingCode}</Text>
                  </View>

                  {/* Details Grid */}
                  <View style={styles.passDetailsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>DATE</Text>
                      <Text style={styles.gridValue}>
                        {new Date(selectedBooking.slot.startTime).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          timeZone: 'UTC'
                        })}
                      </Text>
                    </View>
                    
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>TIME</Text>
                      <Text style={[styles.gridValue, { color: colors.secondary }]}>
                        {new Date(selectedBooking.slot.startTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          timeZone: 'UTC'
                        })}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.passDetailsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>DURATION</Text>
                      <Text style={styles.gridValueSub}>
                        {(() => {
                          const start = new Date(selectedBooking.slot.startTime);
                          const end = new Date(selectedBooking.slot.endTime);
                          const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                          return `${hours} hour${hours !== 1 ? 's' : ''}`;
                        })()}
                      </Text>
                    </View>
                    
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>AMOUNT PAID</Text>
                      <Text style={styles.gridValueSub}>
                        {selectedBooking.slot.price.toLocaleString()} ETB
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setSelectedBooking(null)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: colors.dark.bg },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.dark.bg },
  header:     { backgroundColor: colors.dark.bg, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:{ fontSize: 28, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: colors.text.secondary, fontWeight: '500' },
  
  filterTabsWrapper: { height: 52, marginBottom: 8 },
  filterTabs: { paddingHorizontal: 20, paddingVertical: 8, gap: 8, alignItems: 'center' },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.dark.surface,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
  },
  filterTabActive: {
    backgroundColor: colors.successBg,
    borderColor: colors.secondary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTabTextActive: {
    color: colors.secondary,
  },

  list: { padding: 20, paddingBottom: 100, gap: 16 },

  card: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  cardLeftLine: {
    width: 4,
    alignSelf: 'stretch',
  },
  cardInner: {
    flex: 1,
    padding: 20,
  },
  cardTop: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.dark.elevated,
    justifyContent: 'center',
    alignItems: 'center',
  },  cardMain: {
    flex: 1,
    gap: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stadiumName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    letterSpacing: -0.3,
    marginRight: 8,
  },
  badge: {
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  bookingCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(46, 111, 64, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bookingCodeText: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.dark.border,
    marginBottom: 16,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: -0.5,
  },
  paymentBadge: {
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Bank info
  bankInfo: {
    backgroundColor: 'rgba(46, 111, 64, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.2)',
    gap: 4,
    marginBottom: 16,
  },
  bankInfoTitle: { fontSize: 13, fontWeight: '700', color: colors.secondary, marginBottom: 4 },
  bankInfoRow:   { fontSize: 13, color: colors.text.primary },
  bankInfoLabel: { fontWeight: '600', color: colors.text.secondary },
  bankInfoValue: { fontWeight: '600', color: colors.text.primary },
  bankInfoMissing: {
    backgroundColor: colors.warningBg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 16,
  },
  bankInfoMissingText: { fontSize: 12, color: colors.warning, fontWeight: '600' },

  // Rejection
  rejectionBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    gap: 4,
    marginBottom: 16,
  },
  rejectionTitle:  { fontSize: 13, fontWeight: '700', color: colors.danger },
  rejectionReason: { fontSize: 13, color: '#FCA5A5' },

  // Actions
  actions:    { flexDirection: 'column', gap: 8, marginTop: 16 },
  cancelBtn:  { backgroundColor: colors.danger, borderRadius: 12, padding: 12, alignItems: 'center' },
  cancelBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  uploadBtn:  { backgroundColor: colors.secondary, borderRadius: 12, padding: 12, alignItems: 'center' },
  uploadBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  viewReceiptBtn: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.dark.border,
  },
  viewReceiptBtnText: { color: colors.text.secondary, fontSize: 14, fontWeight: '600' },  btnDisabled: { opacity: 0.5 },
  viewPassBtn: {
    backgroundColor: colors.successBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.secondary,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  viewPassBtnText: { color: colors.secondary, fontSize: 14, fontWeight: '700' },

  // Empty
  empty:     { alignItems: 'center', marginTop: 80, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, color: colors.text.primary, fontWeight: '800', marginBottom: 8 },
  emptyText: { fontSize: 14, color: colors.text.secondary, fontWeight: '500', textAlign: 'center' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle:  { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  modalClose:  { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.dark.border, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 16, color: colors.text.secondary, fontWeight: '700' },
  receiptImage: { width: '100%', height: 300, borderRadius: 12 },
  receiptNote:  { fontSize: 13, color: colors.text.secondary, textAlign: 'center', fontWeight: '500' },

  // Booking Pass Modal
  passModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  passModalContent: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  closePassBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  passModalHeading: { fontSize: 20, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.3, marginTop: 8 },
  passModalSubheading: { fontSize: 13, color: colors.text.secondary, marginTop: 4, fontWeight: '500', marginBottom: 20 },
  passTicket: {
    backgroundColor: colors.dark.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
    marginBottom: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  ticketTitle: { fontSize: 18, fontWeight: '800', color: colors.text.primary, flex: 1, marginRight: 8 },
  ticketValidBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.25)',
  },
  ticketValidText: { fontSize: 9, fontWeight: '800', color: colors.secondary, letterSpacing: 1 },
  ticketLocation: { fontSize: 13, color: colors.text.secondary, paddingHorizontal: 16, marginBottom: 16, fontWeight: '600' },
  ticketDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ticketLeftNotch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.dark.surface,
    marginLeft: -8,
  },
  ticketDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  ticketRightNotch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.dark.surface,
    marginRight: -8,
  },
  ticketBody: { padding: 16, paddingTop: 8, gap: 16 },
  codeContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  codeLabel: { fontSize: 10, fontWeight: '800', color: colors.text.secondary, letterSpacing: 1.5, marginBottom: 8 },
  codeText: { fontSize: 24, fontWeight: '900', color: colors.secondary, letterSpacing: 2 },
  passDetailsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 10, fontWeight: '800', color: colors.text.secondary, letterSpacing: 1, marginBottom: 6 },
  gridValue: { fontSize: 14, fontWeight: '800', color: colors.text.primary },
  gridValueSub: { fontSize: 13, fontWeight: '700', color: colors.text.secondary },
  doneBtn: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.2 },
});

