import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';

interface Props {
  userName?: string;
}

export default function GreetingHeader({ userName }: Props) {
  const firstName = userName ? userName.split(' ')[0] : 'Guest';
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.greetingContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Hey, {firstName}</Text>
          <Text style={styles.subtitle}>Find a turf and book your slot</Text>
        </View>
        <View style={styles.handGestureCircle}>
          <Text style={styles.handGestureEmoji}>👋</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.dark.bg,
    // paddingTop is set dynamically via insets in the component
    paddingBottom: spacing.md,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  handGestureCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: 'rgba(46, 111, 64, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handGestureEmoji: {
    fontSize: 22,
  },
  greeting: {
    fontSize: 32,
    fontWeight: typography.weights.extrabold,
    color: colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
});
