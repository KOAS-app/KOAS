import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '../theme';

interface Props {
  rating: number;
  totalReviews?: number;
  size?: number;
  showCount?: boolean;
}

export default function StarRating({ rating, totalReviews = 0, size = 14, showCount = true }: Props) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.container}>
      <View style={styles.stars}>
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Text key={`full-${i}`} style={[styles.star, { fontSize: size }]}>★</Text>
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <Text key="half" style={[styles.star, { fontSize: size }]}>★</Text>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.emptyStar, { fontSize: size }]}>★</Text>
        ))}
      </View>
      
      {showCount && totalReviews > 0 && (
        <Text style={styles.count}>
          {rating.toFixed(1)} ({totalReviews})
        </Text>
      )}
      
      {showCount && totalReviews === 0 && (
        <Text style={styles.noReviews}>No reviews</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    color: '#F59E0B',
    lineHeight: 16,
  },
  emptyStar: {
    color: colors.dark.border,
    lineHeight: 16,
  },
  count: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.semibold,
  },
  noReviews: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    fontWeight: typography.weights.medium,
  },
});
