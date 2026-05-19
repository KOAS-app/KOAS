import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, spacing, radius, typography } from '../theme';
import type { Stadium } from '../types';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { TabParamList } from '../navigation/types';

// Isolated Components for Reusability and Organization
import GreetingHeader from '../components/GreetingHeader';
import SearchBar from '../components/SearchBar';
import FilterPills from '../components/FilterPills';
import EmptyState from '../components/EmptyState';
import StadiumCard from '../components/StadiumCard';

type Props = BottomTabScreenProps<TabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

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

  useEffect(() => {
    fetchStadiums();
  }, [fetchStadiums]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStadiums();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Filter and Sort logic
  const filteredStadiums = stadiums
    .filter(stadium => {
      const matchesSearch = searchQuery.trim() === '' ||
        stadium.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stadium.locations.some(loc => loc.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesPill = true;
      if (selectedFilter !== 'All' && selectedFilter !== 'Top Rated') {
        matchesPill = stadium.locations.includes(selectedFilter);
      }

      return matchesSearch && matchesPill;
    });

  if (selectedFilter === 'Top Rated') {
    filteredStadiums.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }

  const availableLocations = Array.from(new Set(stadiums.flatMap(s => s.locations || [])));

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={filteredStadiums}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <GreetingHeader userName={user?.name} />
            <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
            <FilterPills 
              selectedFilter={selectedFilter} 
              onSelectFilter={setSelectedFilter} 
              availableLocations={availableLocations} 
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState searchQuery={searchQuery} selectedFilter={selectedFilter} />
        }
        renderItem={({ item }) => (
          <StadiumCard 
            stadium={item} 
            onPress={() => (navigation as any).navigate('StadiumDetail', { stadiumId: item.id, stadiumName: item.name })} 
          />
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
  list: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    marginBottom: spacing.lg,
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
