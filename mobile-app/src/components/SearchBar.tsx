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
          <Feather name="search" size={16} color={colors.secondary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search turfs, locations..."
          placeholderTextColor={colors.text.muted}
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
    backgroundColor: colors.dark.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  searchIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    height: '100%',
    paddingVertical: 0,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.text.secondary,
    paddingHorizontal: spacing.xs,
  },
});

