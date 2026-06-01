import { ScrollView, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface Props {
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  availableLocations: string[];
}

export default function FilterPills({ selectedFilter, onSelectFilter, availableLocations }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollStyle}
      contentContainerStyle={styles.filtersContainer}
      bounces={true}
    >
      {/* All */}
      <TouchableOpacity
        onPress={() => onSelectFilter('All')}
        style={[
          styles.filterPill,
          selectedFilter === 'All' && styles.filterPillActive
        ]}
        activeOpacity={0.8}
      >
        <View style={[
          styles.filterIconCircle,
          selectedFilter === 'All' && styles.filterIconCircleActive
        ]}>
          <Feather 
            name="map" 
            size={10} 
            color={selectedFilter === 'All' ? '#FFFFFF' : colors.secondary} 
          />
        </View>
        <Text style={[
          styles.filterText,
          selectedFilter === 'All' && styles.filterTextActive
        ]}>All</Text>
      </TouchableOpacity>

      {/* Top Rated */}
      <TouchableOpacity
        onPress={() => onSelectFilter('Top Rated')}
        style={[
          styles.filterPill,
          selectedFilter === 'Top Rated' && styles.filterPillActive
        ]}
        activeOpacity={0.8}
      >
        <View style={[
          styles.filterIconCircle,
          selectedFilter === 'Top Rated' && styles.filterIconCircleActive
        ]}>
          <Feather 
            name="star" 
            size={10} 
            color={selectedFilter === 'Top Rated' ? '#FFFFFF' : colors.secondary} 
          />
        </View>
        <Text style={[
          styles.filterText,
          selectedFilter === 'Top Rated' && styles.filterTextActive
        ]}>Top Rated</Text>
      </TouchableOpacity>

      {/* Dynamic Location Pills */}
      {availableLocations.map((loc) => (
        <TouchableOpacity
          key={loc}
          onPress={() => onSelectFilter(loc)}
          style={[
            styles.filterPill,
            selectedFilter === loc && styles.filterPillActive
          ]}
          activeOpacity={0.8}
        >
          <View style={[
            styles.filterIconCircle,
            selectedFilter === loc && styles.filterIconCircleActive
          ]}>
            <Feather 
              name="map-pin" 
              size={10} 
              color={selectedFilter === loc ? '#FFFFFF' : colors.secondary} 
            />
          </View>
          <Text style={[
            styles.filterText,
            selectedFilter === loc && styles.filterTextActive
          ]}>{loc}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollStyle: {
    marginHorizontal: -spacing.xl,
  },
  filtersContainer: {
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dark.surface,
    borderWidth: 1.5,
    borderColor: colors.dark.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: spacing.xs,
  },
  filterPillActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  filterIconCircleActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterText: {
    color: colors.text.secondary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },  filterTextActive: {
    color: '#FFFFFF',
  },
});

