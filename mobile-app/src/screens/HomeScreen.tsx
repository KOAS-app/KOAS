import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, spacing, radius, typography, shadows } from '../theme';
import StarRating from '../components/StarRating';
import { API_BASE_URL } from '../config/api';
import type { Stadium } from '../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user, logout } = useAuth();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchStadiums = useCallback(async () => {
    try {
      const res = await api.get('/stadiums');
      setStadiums(res.data);
      setError('');
    } catch (err) {
      setError(getApiError(err, 'Failed to load stadiums.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStadiums(); }, [fetchStadiums]);

  const onRefresh = () => { setRefreshing(true); fetchStadiums(); };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Find a turf and book your slot</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={stadiums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏟️</Text>
            <Text style={styles.emptyTitle}>No stadiums available</Text>
            <Text style={styles.emptyText}>Check back soon for new listings</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => (navigation as any).navigate('StadiumDetail', { stadiumId: item.id, stadiumName: item.name })}
            activeOpacity={0.9}
          >
            {/* Stadium Image with Overlays */}
            <View style={styles.imageContainer}>
              {item.imageUrl ? (
                <Image 
                  source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderIcon}>🏟️</Text>
                </View>
              )}
              
              {/* Rating Badge */}
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>{item.averageRating?.toFixed(1) || '4.5'}</Text>
              </View>
            </View>
            
            {/* Card Content */}
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.openBadge}>
                  <Text style={styles.openIcon}>✓</Text>
                  <Text style={styles.openText}>Open</Text>
                </View>
              </View>
              
              <View style={styles.cardMeta}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationIcon}>📍</Text>
                  <Text style={styles.locationText} numberOfLines={1}>
                    {item.locations.length === 1 ? item.locations[0] : `${item.locations.length} locations`}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.starsText}>⭐⭐⭐⭐⭐</Text>
                  <Text style={styles.reviewText}>
                    {item.totalReviews ? `${item.totalReviews} reviews` : 'No reviews'}
                  </Text>
                </View>
              </View>
              
              {item.description ? (
                <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
              ) : null}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0A0E0D',
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#0A0E0D',
  },
  header: {
    backgroundColor: '#0A0E0D',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
  },
  greeting: { 
    fontSize: 32, 
    fontWeight: typography.weights.extrabold, 
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: typography.sizes.base, 
    color: '#8B9A94', 
    fontWeight: typography.weights.medium,
  },
  list: { 
    padding: spacing.xl,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#0F1713',
    borderRadius: 20,
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
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  ratingBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F4C2C',
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
  locationIcon: {
    fontSize: 14,
    color: '#22C55E',
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
  starsText: {
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.4,
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
  empty: { 
    alignItems: 'center', 
    marginTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { 
    fontSize: 64, 
    marginBottom: spacing.lg,
    opacity: 0.3,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    color: '#FFFFFF',
    marginBottom: spacing.xs,
  },
  emptyText: { 
    fontSize: typography.sizes.base, 
    color: '#8B9A94',
    textAlign: 'center',
  },
  errorContainer: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  error: { 
    color: '#EF4444',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
