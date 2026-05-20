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
import type { Stadium } from '../types';

type Props = StackScreenProps<RootStackParamList, 'SubscriptionCheckout'>;

export default function SubscriptionCheckoutScreen({ route, navigation }: Props) {
  const { planId, planName, price, stadiumId, stadiumName } = route.params;

  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [loading, setLoading] = useState(true);
  const [receiptImage, setReceiptImage] = useState<{ uri: string; mimeType?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeAccount = stadium?.bankAccounts?.find(acc => acc.isDefault) || stadium?.bankAccounts?.[0];
  const bankName = activeAccount?.bankName || stadium?.bankName;
  const accountNumber = activeAccount?.accountNumber || stadium?.accountNumber;
  const accountHolderName = activeAccount?.accountHolderName || stadium?.accountHolderName;

  useEffect(() => {
    const fetchStadiumDetails = async () => {
      try {
        const res = await api.get(`/stadiums/${stadiumId}`);
        setStadium(res.data);
      } catch (err) {
        Alert.alert('Error', getApiError(err, 'Failed to fetch stadium bank details.'));
      } finally {
        setLoading(false);
      }
    };

    fetchStadiumDetails();
  }, [stadiumId]);

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

      // 2. Submit subscription request
      await api.post('/player-subscriptions/subscribe', {
        subscriptionPlanId: planId,
        pricePaid: price,
        receiptImageUrl: imageUrl,
      });

      Alert.alert(
        'Success',
        'Your subscription application has been submitted successfully! The stadium owner will verify and activate your membership.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset navigation and go to Profile or stadium details
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
