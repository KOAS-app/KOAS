import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, spacing, radius, typography, shadows } from '../theme';
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
            <View style={styles.cardTop}>
              <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
              <View style={styles.approvedBadge}>
                <Text style={styles.approvedText}>✓ Open</Text>
              </View>
            </View>
            <Text style={styles.cardLocation} numberOfLines={1}>📍 {item.location}</Text>
            {item.description ? (
              <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
            ) : null}
            <View style={styles.cardFooter}>
              <Text style={styles.cardOwner}>Owner: {item.owner.name}</Text>
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
    backgroundColor: colors.surface 
  },
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: colors.surface 
  },
  header: {
    backgroundColor: colors.sidebar,
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  greeting: { 
    fontSize: typography.sizes.xl, 
    fontWeight: typography.weights.bold, 
    color: colors.textInverse,
    letterSpacing: -0.3,
  },
  subtitle: { 
    fontSize: typography.sizes.sm, 
    color: 'rgba(255,255,255,0.7)', 
    marginTop: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  list: { 
    padding: spacing.lg, 
    gap: spacing.md 
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cardTop: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    gap: spacing.md,
  },
  cardName: { 
    fontSize: typography.sizes.md, 
    fontWeight: typography.weights.bold, 
    color: colors.textPrimary, 
    flex: 1,
    letterSpacing: -0.2,
  },
  approvedBadge: { 
    backgroundColor: colors.successBg, 
    borderRadius: radius.full, 
    paddingHorizontal: spacing.sm, 
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  approvedText: { 
    fontSize: typography.sizes.xs, 
    color: '#15803D', 
    fontWeight: typography.weights.semibold,
  },
  cardLocation: { 
    fontSize: typography.sizes.sm, 
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  cardDesc: { 
    fontSize: typography.sizes.sm, 
    color: colors.textSecondary,
    lineHeight: 20,
  },
  cardFooter: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xs,
  },
  cardOwner: { 
    fontSize: typography.sizes.xs, 
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
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
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: { 
    fontSize: typography.sizes.base, 
    color: colors.textMuted,
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
