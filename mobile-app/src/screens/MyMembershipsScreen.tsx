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
  
  // Subscription States
  const [subscriptions, setSubscriptions] = useState<PlayerSubscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);
  const [selectedSub, setSelectedSub] = useState<PlayerSubscription | null>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Memberships</Text>
        <Text style={styles.headerSubtitle}>View and manage your digital check-in passes</Text>
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                      <View style={styles.passPrompt}>
                        <Text style={styles.passPromptText}>View Pass</Text>
                        <Feather name="arrow-right" size={12} color={colors.secondary} style={{ marginLeft: 2 }} />
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
        animationType="slide"
        onRequestClose={() => setSelectedSub(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            {/* Modal Drag handle visual */}
            <View style={styles.dragHandle} />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.dark.bg },
  header: { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: colors.text.primary, letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 13, color: colors.text.secondary, marginTop: 4, fontWeight: '500' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
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
  passPrompt: { flexDirection: 'row', alignItems: 'center' },
  passPromptText: { fontSize: 12, color: colors.secondary, fontWeight: '700' },
  footerNote: { fontSize: 12, color: colors.text.secondary, fontWeight: '500' },
  rejectionTextHighlight: { fontSize: 12, color: colors.danger, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.dark.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: 24,
    paddingTop: 16,
    maxHeight: '90%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.dark.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
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
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  doneBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
});

