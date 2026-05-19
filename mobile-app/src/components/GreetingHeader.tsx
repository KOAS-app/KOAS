import { View, Text, StyleSheet } from 'react-native';
import { spacing, typography } from '../theme';

interface Props {
  userName?: string;
}

export default function GreetingHeader({ userName }: Props) {
  const firstName = userName ? userName.split(' ')[0] : 'Guest';

  return (
    <View style={styles.header}>
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
    backgroundColor: '#0A0E0D',
    paddingTop: 48,
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
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  handGestureEmoji: {
    fontSize: 22,
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
});
