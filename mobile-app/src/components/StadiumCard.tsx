import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography, radius } from '../theme';
import StarRating from './StarRating';
import { API_BASE_URL } from '../config/api';
import type { Stadium } from '../types';

interface Props {
  stadium: Stadium;
  onPress: () => void;
}

export default function StadiumCard({ stadium, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Stadium Image with Overlays */}
      <View style={styles.imageContainer}>
        {stadium.imageUrl ? (
          <Image
            source={{ uri: `${API_BASE_URL}${stadium.imageUrl}` }}
            style={styles.cardImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <View style={styles.placeholderIconCircle}>
              <Feather name="map" size={40} color={colors.primary} />
            </View>
          </View>
        )}

        {/* Rating Badge */}
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingIcon}>⭐</Text>
          <Text style={styles.ratingText}>{stadium.averageRating?.toFixed(1) || '4.5'}</Text>
        </View>
      </View>

      {/* Card Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardName} numberOfLines={1}>{stadium.name}</Text>
          <View style={styles.openBadge}>
            <Text style={styles.openIcon}>✓</Text>
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.locationRow}>
            <View style={styles.locationIconCircle}>
              <Feather name="map-pin" size={12} color={colors.primary} />
            </View>
            <Text style={styles.locationText} numberOfLines={1}>
              {stadium.locations && stadium.locations.length === 1 ? stadium.locations[0] : `${stadium.locations?.length || 0} locations`}
            </Text>
          </View>
        </View>

        {stadium.description ? (
          <Text style={styles.cardDesc} numberOfLines={2}>{stadium.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111816',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: '#1A2520',
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 260,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A2520',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#134826ff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  ratingIcon: {
    fontSize: 14,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: typography.weights.bold,
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardName: {
    fontSize: 20,
    fontWeight: typography.weights.extrabold,
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.3,
  },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.3)',
  },
  openIcon: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: typography.weights.bold,
  },
  openText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: typography.weights.bold,
  },
  cardMeta: {
    gap: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: '#8B9A94',
    fontWeight: typography.weights.medium,
    flex: 1,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  reviewText: {
    fontSize: typography.sizes.sm,
    color: '#8B9A94',
    fontWeight: typography.weights.medium,
  },
  cardDesc: {
    fontSize: typography.sizes.sm,
    color: '#8B9A94',
    lineHeight: 20,
  },
});
