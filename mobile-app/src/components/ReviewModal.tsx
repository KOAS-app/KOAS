import { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, radius, typography } from '../theme';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';

interface Props {
  visible: boolean;
  stadiumId: string;
  stadiumName: string;
  existingReview?: { rating: number; comment?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ visible, stadiumId, stadiumName, existingReview, onClose, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
    } else {
      setRating(0);
      setComment('');
    }
  }, [existingReview, visible]);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/reviews', {
        stadiumId,
        rating,
        comment: comment.trim() || undefined,
      });
      Alert.alert('Success', existingReview ? 'Review updated!' : 'Review submitted!');
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Error', getApiError(err, 'Failed to submit review'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%', maxWidth: 420, alignItems: 'center' }}
        >
          <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>
                {existingReview ? 'Update Review' : 'Write a Review'}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>{stadiumName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.label}>
              Comment <Text style={styles.optional}>(optional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Share your experience..."
              placeholderTextColor={colors.text.muted}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{comment.length}/500</Text>
          </View>

          {/* Star Rating */}
          <View style={[styles.section, { paddingTop: 0 }]}>
            <Text style={styles.label}>Your Rating</Text>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starBtn}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.star, rating >= star && styles.starFilled]}>
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && '⭐ Poor'}
                {rating === 2 && '⭐⭐ Fair'}
                {rating === 3 && '⭐⭐⭐ Good'}
                {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {existingReview ? 'Update' : 'Submit'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: colors.dark.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.dark.borderStrong,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.dark.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  closeIcon: {
    fontSize: 18,
    color: colors.text.secondary,
    fontWeight: typography.weights.bold,
  },
  section: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  optional: {
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  stars: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  starBtn: {
    padding: spacing.xs,
  },
  star: {
    fontSize: 36,
    color: colors.dark.border,
  },
  starFilled: {
    color: '#F59E0B',
  },
  ratingText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.dark.elevated,
    borderWidth: 1,
    borderColor: colors.dark.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.text.primary,
    minHeight: 100,
    fontWeight: typography.weights.medium,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    paddingTop: 0,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dark.elevated,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.secondary,
  },
  submitBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.secondary,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
});

