import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Feather } from '@expo/vector-icons';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing, typography } from '../theme';
import { useFocusEffect } from '@react-navigation/native';
import type { PlayerSubscription } from '../types';

const statusColors: Record<string, { bg: string; text: string; border: string; label: string }> = {
  RECEIPT_SUBMITTED: { bg: colors.infoBg, text: colors.info, border: 'rgba(59, 130, 246, 0.35)', label: 'Pending Review' },
  ACTIVE:            { bg: colors.successBg, text: colors.secondary, border: 'rgba(46, 111, 64, 0.3)', label: 'Active' },
  REJECTED:          { bg: colors.dangerBg, text: colors.danger, border: 'rgba(239, 68, 68, 0.3)', label: 'Rejected' },
  EXPIRED:           { bg: 'rgba(107, 123, 117, 0.15)', text: colors.text.muted, border: 'rgba(107, 123, 117, 0.3)', label: 'Expired' },
};


export default function MyMembershipsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Subscription States
  const [subscriptions, setSubscriptions] = useState<PlayerSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [selectedSub, setSelectedSub] = useState<PlayerSubscription | null>(null);
  const [detailSub, setDetailSub] = useState<PlayerSubscription | null>(null);
  const [slotsSub, setSlotsSub] = useState<PlayerSubscription | null>(null);

  // Fetch subscriptions every time screen comes to focus
  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      const fetchSubscriptions = async () => {
        try {
          const res = await api.get('/player-subscriptions/my');
          if (isMounted) {
            setSubscriptions(res.data);
          }
        } catch (err) {
          console.error('Failed to fetch subscriptions on memberships focus:', err);
        } finally {
          if (isMounted) {
            setLoadingSubscriptions(false);
          }
        }
      };

      fetchSubscriptions();

      return () => {
        isMounted = false;
      };
    }, [])
  );

  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return 0;
    const now = new Date();
    const end = new Date(endDateStr);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const handleSubPress = (sub: PlayerSubscription) => {
    if (sub.status === 'ACTIVE') {
      setSelectedSub(sub);
    } else if (sub.status === 'REJECTED') {
      Alert.alert(
        'Subscription Rejected',
        `Rejection Reason: ${sub.ownerRejectionReason || 'No reason provided.'}`
      );
    } else if (sub.status === 'RECEIPT_SUBMITTED') {
      Alert.alert(
        'Verification Pending',
        'Stadium owner is currently reviewing your receipt. Your digital pass will unlock as soon as it is approved.'
      );
    } else if (sub.status === 'EXPIRED') {
      Alert.alert(
        'Membership Expired',
        'This membership is expired. You can purchase a new plan by navigating to the stadium details page.'
      );
    }
  };

  const handleViewDetails = (sub: PlayerSubscription) => {
    setDetailSub(sub);
  };

  const handleViewSlots = (sub: PlayerSubscription) => {
    setSlotsSub(sub);
  };

  const formatSlotDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  const formatSlotTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>My Memberships</Text>
        <Text style={styles.headerSubtitle}>View and manage your digital check-in passes</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {loadingSubscriptions ? (
          <ActivityIndicator size="large" color={colors.secondary} style={{ marginTop: 40 }} />
        ) : subscriptions.length === 0 ? (
          <View style={styles.emptyCard}>
            <Feather name="award" size={48} color={colors.text.muted} style={{ marginBottom: 12, opacity: 0.5 }} />
            <Text style={styles.emptyText}>No stadium memberships yet</Text>
            <Text style={styles.emptySubtext}>Subscribe to stadium plans to unlock fast check-in passes.</Text>
          </View>
        ) : (
          <View style={styles.membershipList}>
            {subscriptions.map((sub) => {
              const sColor = statusColors[sub.status] || { bg: colors.dark.surface, text: colors.text.primary, border: colors.dark.border, label: sub.status };
              const daysLeft = sub.status === 'ACTIVE' ? getDaysRemaining(sub.endDate) : 0;

              return (
                <TouchableOpacity
                  key={sub.id}
                  style={[
                    styles.membershipCard,
                    sub.status === 'ACTIVE' && styles.activeCardGlow
                  ]}
                  onPress={() => handleSubPress(sub)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.planName} numberOfLines={1}>
                        {sub.subscriptionPlan.name}
                      </Text>
                      <Text style={styles.stadiumName} numberOfLines={1}>
                        🏟️ {sub.subscriptionPlan.stadium.name}
                      </Text>
                    </View>
                    
                    <View style={[styles.statusBadge, { backgroundColor: sColor.bg, borderColor: sColor.border }]}>
                      <Text style={[styles.statusText, { color: sColor.text }]}>
                        {sColor.label}
                      </Text>
                    </View>
                  </View>

                  {sub.status === 'ACTIVE' && (
                    <View style={styles.cardFooter}>
                      <View style={styles.countdownWrapper}>
                        <Feather name="clock" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.countdownText}>
                          {daysLeft} days remaining
                        </Text>
                      </View>
                    </View>
                  )}

                  {sub.status === 'RECEIPT_SUBMITTED' && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.footerNote}>Submitted on {new Date(sub.playerSubmittedAt).toLocaleDateString()}</Text>
                    </View>
                  )}

                  {sub.status === 'REJECTED' && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.rejectionTextHighlight} numberOfLines={1}>
                        ✕ Tap to see rejection reason
                      </Text>
                    </View>
                  )}

                  {sub.status === 'EXPIRED' && (
                    <View style={styles.cardFooter}>
                      <Text style={styles.footerNote}>Ended on {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : ''}</Text>
                    </View>
                  )}

                  <View style={styles.cardActions}>
                    {sub.status === 'ACTIVE' && (
                      <TouchableOpacity style={[styles.detailsBtn, { flex: 1 }]} onPress={() => handleSubPress(sub)}>
                        <Feather name="credit-card" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.detailsBtnText}>View Pass</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity style={[styles.detailsBtn, { flex: 1 }]} onPress={() => handleViewDetails(sub)}>
                      <Feather name="info" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                      <Text style={styles.detailsBtnText}>View Details</Text>
                    </TouchableOpacity>
                    {sub.slots && sub.slots.length > 0 && (
                      <TouchableOpacity style={[styles.detailsBtn, { flex: 1 }]} onPress={() => handleViewSlots(sub)}>
                        <Feather name="calendar" size={12} color={colors.secondary} style={{ marginRight: 4 }} />
                        <Text style={styles.detailsBtnText}>View Slots</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Premium Digital Pass Modal */}
      <Modal
        visible={!!selectedSub}
        transparent
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setSelectedSub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>

            {/* Close Button */}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSelectedSub(null)}>
              <Feather name="x" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            {/* Pass Header */}
            <Text style={styles.modalHeading}>Digital Membership Pass</Text>
            <Text style={styles.modalSubheading}>Present this pass at the turf to check in</Text>

            {/* Ticket Card representation */}
            {selectedSub && (
              <View style={styles.passTicket}>
                {/* Top Notch design */}
                <View style={styles.ticketHeader}>
                  <Text style={styles.ticketPlan}>{selectedSub.subscriptionPlan.name}</Text>
                  <View style={styles.ticketActiveBadge}>
                    <Text style={styles.ticketActiveText}>VALID PASS</Text>
                  </View>
                </View>

                <Text style={styles.ticketStadium}>🏟️ {selectedSub.subscriptionPlan.stadium.name}</Text>

                <View style={styles.ticketDividerWrapper}>
                  <View style={styles.ticketLeftNotch} />
                  <View style={styles.ticketDashedLine} />
                  <View style={styles.ticketRightNotch} />
                </View>

                <View style={styles.ticketBody}>
                  {/* Digital Pass Verification Code Container */}
                  <View style={styles.codeContainer}>
                    <Text style={styles.codeLabel}>PASS CODE</Text>
                    <Text style={styles.codeText}>{selectedSub.subscriptionCode}</Text>
                  </View>

                  <View style={styles.passDetailsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>PLAYER NAME</Text>
                      <Text style={styles.gridValue} numberOfLines={1}>{user?.name}</Text>
                    </View>
                    
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>DAYS REMAINING</Text>
                      <Text style={[styles.gridValue, { color: colors.secondary }]}>
                        {getDaysRemaining(selectedSub.endDate)} Days
                      </Text>
                    </View>
                  </View>

                  <View style={styles.passDetailsGrid}>
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>VALID FROM</Text>
                      <Text style={styles.gridValueSub}>
                        {selectedSub.startDate ? new Date(selectedSub.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </Text>
                    </View>
                    
                    <View style={styles.gridItem}>
                      <Text style={styles.gridLabel}>VALID UNTIL</Text>
                      <Text style={styles.gridValueSub}>
                        {selectedSub.endDate ? new Date(selectedSub.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setSelectedSub(null)}>
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Plan Details Modal */}
      <Modal
        visible={!!detailSub}
        transparent
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setDetailSub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setDetailSub(null)}>
              <Feather name="x" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            {detailSub && (
              <>
                <Text style={styles.modalHeading}>Plan Details</Text>
                <Text style={styles.modalSubheading}>{detailSub.subscriptionPlan.stadium.name}</Text>

                {/* Access Schedule */}
                <View style={{ marginBottom: 16, padding: 14, backgroundColor: colors.dark.card, borderRadius: 10, borderWidth: 1, borderColor: colors.dark.border }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5, marginBottom: 10 }}>ACCESS SCHEDULE</Text>
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Play Days</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.subscriptionPlan.openingDay} - {detailSub.subscriptionPlan.closingDay}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Play Hours</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.subscriptionPlan.openingTime} - {detailSub.subscriptionPlan.closingTime}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Hours per Day</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.subscriptionPlan.hoursPerDay}h</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Days per Week</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.subscriptionPlan.weeklyAllowedDays} day{detailSub.subscriptionPlan.weeklyAllowedDays > 1 ? 's' : ''}</Text>
                    </View>
                  </View>
                </View>

                {/* Validity Period */}
                <View style={{ marginBottom: 16, padding: 14, backgroundColor: colors.dark.card, borderRadius: 10, borderWidth: 1, borderColor: colors.dark.border }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5, marginBottom: 10 }}>VALIDITY</Text>
                  <View style={{ gap: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Started</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.startDate ? new Date(detailSub.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Expires</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.endDate ? new Date(detailSub.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</Text>
                    </View>
                    {detailSub.status === 'ACTIVE' && (
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 12, color: colors.text.secondary }}>Days Left</Text>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#22c55e' }}>{getDaysRemaining(detailSub.endDate)} days</Text>
                      </View>
                    )}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 12, color: colors.text.secondary }}>Plan Duration</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text.primary }}>{detailSub.subscriptionPlan.duration} days</Text>
                    </View>
                  </View>
                </View>

                {/* Price Paid */}
                <View style={{ marginBottom: 16, padding: 14, backgroundColor: colors.dark.card, borderRadius: 10, borderWidth: 1, borderColor: colors.dark.border }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>Price Paid</Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: colors.secondary }}>{detailSub.pricePaid.toLocaleString()} ETB</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ fontSize: 12, color: colors.text.secondary }}>Payment Status</Text>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.success }}>Paid ✓</Text>
                  </View>
                </View>

                {/* Rejection Reason */}
                {detailSub.status === 'REJECTED' && detailSub.ownerRejectionReason && (
                  <View style={{ marginBottom: 16, padding: 14, backgroundColor: colors.dangerBg, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: colors.danger, marginBottom: 4 }}>Rejection Reason</Text>
                    <Text style={{ fontSize: 12, color: '#FCA5A5' }}>{detailSub.ownerRejectionReason}</Text>
                  </View>
                )}


              </>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setDetailSub(null)}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Slots Modal */}
      <Modal
        visible={!!slotsSub}
        transparent
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        animationType="fade"
        onRequestClose={() => setSlotsSub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setSlotsSub(null)}>
              <Feather name="x" size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            {slotsSub && (
              <ScrollView style={{ maxHeight: 400 }} showsVerticalScrollIndicator={false}>
                <Text style={styles.modalHeading}>Booked Slots</Text>
                <Text style={styles.modalSubheading}>{slotsSub.subscriptionPlan.stadium.name} — {slotsSub.subscriptionPlan.name}</Text>

                {slotsSub.slots && slotsSub.slots.length > 0 ? (
                  <View style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5, marginBottom: 8 }}>{slotsSub.slots.length} SLOT{slotsSub.slots.length > 1 ? 'S' : ''} BOOKED</Text>
                    {slotsSub.slots.map((slot, idx) => (
                      <View key={slot.id} style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: colors.dark.card, borderRadius: 8, borderWidth: 1, borderColor: colors.dark.border, marginBottom: 6, gap: 10 }}>
                        <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94a3b8' }}>{idx + 1}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.text.primary }}>{slot.location}</Text>
                          <Text style={{ fontSize: 11, color: colors.text.secondary }}>{formatSlotDateTime(slot.startTime)}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.secondary }}>{formatSlotTime(slot.startTime)} - {formatSlotTime(slot.endTime)}</Text>
                          <Text style={{ fontSize: 11, color: colors.text.muted }}>{slot.price.toLocaleString()} ETB</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.noSlotsNotice}>
                    <Feather name="calendar" size={16} color={colors.text.muted} />
                    <Text style={styles.noSlotsText}>No slots booked for this plan</Text>
                  </View>
                )}
              </ScrollView>
            )}

            <TouchableOpacity style={styles.doneBtn} onPress={() => setSlotsSub(null)}>
              <Text style={styles.doneBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.text.secondary, marginTop: 4, fontWeight: '500' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20 },
  emptyCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: { fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
  emptySubtext: { fontSize: 12, color: colors.text.secondary, textAlign: 'center', lineHeight: 16 },
  membershipList: { gap: spacing.md },
  membershipCard: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.lg,
  },
  activeCardGlow: {
    borderColor: colors.secondary,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  planName: { fontSize: 18, fontWeight: '800', color: colors.text.primary },
  stadiumName: { fontSize: 12, color: colors.text.secondary, marginTop: 4, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, borderWidth: 1 },
  statusText: { fontSize: 10, fontWeight: '700' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing.md,
    marginTop: spacing.xs,
  },
  countdownWrapper: { flexDirection: 'row', alignItems: 'center' },
  countdownText: { fontSize: 12, color: colors.secondary, fontWeight: '700' },
  footerNote: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },
  rejectionTextHighlight: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: 24,
    paddingTop: 48,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },
  closeModalBtn: {
    position: 'absolute',
    top: 16,
    right: 20,
    padding: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.dark.border,
  },
  modalHeading: { fontSize: 20, fontWeight: '900', color: colors.text.primary, letterSpacing: -0.3, marginTop: 8 },
  modalSubheading: { fontSize: 13, color: colors.text.secondary, marginTop: 4, fontWeight: '500', marginBottom: 20 },
  passTicket: {
    backgroundColor: colors.dark.card,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.success,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 6,
    marginBottom: 20,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: 4,
  },
  ticketPlan: { fontSize: 16, fontWeight: '800', color: colors.text.primary },
  ticketActiveBadge: {
    backgroundColor: colors.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 0.5,
    borderColor: colors.success,
  },
  ticketActiveText: { fontSize: 9, fontWeight: '800', color: colors.secondary, letterSpacing: 0.5 },
  ticketStadium: { fontSize: 12, color: colors.text.secondary, fontWeight: '600', paddingHorizontal: spacing.md, marginBottom: spacing.md },
  ticketDividerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 20,
    overflow: 'hidden',
  },
  ticketLeftNotch: {
    width: 12,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.dark.surface,
    marginLeft: -6,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  ticketRightNotch: {
    width: 12,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.dark.surface,
    marginRight: -6,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  ticketDashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginHorizontal: 4,
  },
  ticketBody: { padding: spacing.lg, alignItems: 'center', gap: spacing.lg },
  codeContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingVertical: 18,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  codeLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  codeText: {
    fontSize: 22,
    color: colors.secondary,
    fontWeight: '800',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    letterSpacing: 2,
  },
  passDetailsGrid: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', gap: spacing.md },
  gridItem: { flex: 1 },
  gridLabel: { fontSize: 9, fontWeight: '700', color: colors.text.secondary, letterSpacing: 0.5 },
  gridValue: { fontSize: 14, fontWeight: '800', color: colors.text.primary, marginTop: 4 },
  gridValueSub: { fontSize: 13, fontWeight: '600', color: colors.text.secondary, marginTop: 4 },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.dark.border,
    backgroundColor: colors.dark.card,
  },
  detailsBtnText: { fontSize: 12, color: colors.secondary, fontWeight: '700' },
  noSlotsNotice: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: 8,
    backgroundColor: colors.dark.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    marginBottom: spacing.md,
  },
  noSlotsText: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
  doneBtn: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 0,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

