import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface Props {
  searchQuery: string;
  selectedFilter: string;
}

export default function EmptyState({ searchQuery, selectedFilter }: Props) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconCircle}>
        <Feather name="map" size={32} color={colors.secondary} />
      </View>
      <Text style={styles.emptyTitle}>No stadiums found</Text>
      <Text style={styles.emptyText}>
        {searchQuery || selectedFilter !== 'All'
          ? 'Try adjusting your search or filters'
          : 'Check back soon for new listings'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    marginTop: 80,
    paddingHorizontal: spacing.xl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.successBg,
    borderWidth: 1.5,
    borderColor: 'rgba(46, 111, 64, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

