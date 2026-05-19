import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
}

export default function SearchBar({ value, onChangeText }: Props) {
  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputWrapper}>
        <View style={styles.searchIconCircle}>
          <Feather name="search" size={16} color={colors.primary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search turfs, locations..."
          placeholderTextColor="#8B9A94"
          value={value}
          onChangeText={onChangeText}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {value !== '' && (
          <TouchableOpacity onPress={() => onChangeText('')} activeOpacity={0.7}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: spacing.lg,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1713',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1A2520',
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    height: '100%',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: '#8B9A94',
    paddingHorizontal: spacing.xs,
  },
});
