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
            activeOpacity={0.7}
          >
            {/* Stadium Image */}
            {item.imageUrl && (
              <Image 
                source={{ uri: `${API_BASE_URL}${item.imageUrl}` }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.cardContent}>
              <View style={styles.cardTop}>
                <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                <View style={styles.approvedBadge}>
                  <Text style={styles.approvedText}>✓ Open</Text>
                </View>
              </View>
              
              <View style={styles.cardMeta}>
                <Text style={styles.cardLocation} numberOfLines={1}>
                  📍 {item.locations.length === 1 ? item.locations[0] : `${item.locations.length} locations`}
                </Text>
                <StarRating 
                  rating={item.averageRating || 0} 
                  totalReviews={item.totalReviews || 0}
                  size={13}
                />
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
    backgroundColor: colors.dark.bg 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.dark.bg 
  },
  header: {
    backgroundColor: colors.dark.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: { 
    fontSize: typography.sizes.xxl, 
    fontWeight: typography.weights.extrabold, 
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: { 
    fontSize: typography.sizes.sm, 
    color: colors.text.muted, 
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  list: { 
    padding: spacing.lg, 
    gap: spacing.md 
  },
  card: {
    backgroundColor: colors.dark.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.dark.surface,
  },
  cardContent: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  cardTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: spacing.md,
  },
  cardName: { 
    fontSize: typography.sizes.md, 
    fontWeight: typography.weights.extrabold, 
    color: colors.text.primary, 
    flex: 1,
    letterSpacing: -0.3,
  },
  approvedBadge: { 
    backgroundColor: colors.successBg, 
    borderRadius: radius.md, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  approvedText: { 
    fontSize: typography.sizes.xs, 
    color: '#15803D', 
    fontWeight: typography.weights.bold,
  },
  cardLocation: { 
    fontSize: typography.sizes.sm, 
    color: colors.text.muted,
    fontWeight: typography.weights.semibold,
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cardDesc: { 
    fontSize: typography.sizes.sm, 
    color: colors.text.secondary,
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
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: { 
    fontSize: typography.sizes.base, 
    color: colors.text.muted,
    textAlign: 'center',
  },
  errorContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  error: { 
    color: colors.danger,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
});
