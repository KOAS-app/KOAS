import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import api from '../api/axios';
import { getApiError } from '../utils/apiError';
import { colors, radius, spacing, typography } from '../theme';
import StarRating from '../components/StarRating';
import ReviewModal from '../components/ReviewModal';
import { API_BASE_URL } from '../config/api';
import type { Stadium, Review, Slot, SubscriptionPlan } from '../types';
import type { StackScreenProps } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/types';

type Props = StackScreenProps<RootStackParamList, 'StadiumDetail'>;

const { width } = Dimensions.get('window');

// Amenity SVG Icons matching app theme
const ParkingIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 8h3a3 3 0 0 1 0 6H9V8z" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="9" y1="8" x2="9" y2="17" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const ChangingRoomIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="7" r="4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const ShowerIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 2v10" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="2" r="1" fill={colors.secondary} />
    <Line x1="8" y1="16" x2="8" y2="17" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="16" x2="12" y2="17" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="16" x2="16" y2="17" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="20" x2="8" y2="21" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="20" x2="12" y2="21" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="16" y1="20" x2="16" y2="21" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FloodlightIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="5" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="1" x2="12" y2="3" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="12" y1="21" x2="12" y2="23" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="1" y1="12" x2="3" y2="12" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="21" y1="12" x2="23" y2="12" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const SeatingIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M4 16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8H4v8z" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 8h20" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Path d="M6 4h12" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const RefreshmentsIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M18 8h1a4 4 0 0 1 0 8h-1" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="6" y1="1" x2="6" y2="4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="10" y1="1" x2="10" y2="4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="14" y1="1" x2="14" y2="4" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const FirstAidIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="3" width="18" height="18" rx="2" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Line x1="12" y1="8" x2="12" y2="16" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
    <Line x1="8" y1="12" x2="16" y2="12" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

const EquipmentIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M12 2a10 10 0 0 0 0 20" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const WiFiIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M5 12.55a11 11 0 0 1 14.08 0" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M1.42 9a16 16 0 0 1 21.16 0" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <Circle cx="12" cy="20" r="1" fill={colors.secondary} />
  </Svg>
);

const SecurityIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

// Amenity icon mapping
const amenityIconComponents: Record<string, React.ComponentType> = {
  'Parking': ParkingIcon,
  'Changing Rooms': ChangingRoomIcon,
  'Showers': ShowerIcon,
  'Floodlights': FloodlightIcon,
  'Seating Area': SeatingIcon,
  'Refreshments': RefreshmentsIcon,
  'First Aid': FirstAidIcon,
  'Equipment Rental': EquipmentIcon,
  'WiFi': WiFiIcon,
  'Security': SecurityIcon,
};

export default function StadiumDetailScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { stadiumId, stadiumName } = route.params;
  const [stadium, setStadium] = useState<Stadium & { slots?: Slot[] } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollView>(null);

  const fetchStadium = async () => {
    try {
      const res = await api.get(`/stadiums/${stadiumId}`);
      setStadium(res.data);
    } catch (err) {
      Alert.alert('Error', getApiError(err, 'Failed to load stadium.'));
      navigation.goBack();
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/stadium/${stadiumId}`);
      setReviews(res.data.reviews);
      setAverageRating(res.data.averageRating);
      setTotalReviews(res.data.totalReviews);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    }
  };

  const fetchMyReview = async () => {
    try {
      const res = await api.get(`/reviews/my-review/${stadiumId}`);
      setMyReview(res.data);
    } catch (err) {
      // No review found, that's okay
      setMyReview(null);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await api.get(`/subscription-plans/stadium/${stadiumId}`);
      setPlans(res.data);
    } catch (err) {
      console.error('Failed to load subscription plans:', err);
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchStadium(), fetchReviews(), fetchMyReview(), fetchPlans()]);
      setLoading(false);
    };
    init();
  }, [stadiumId, navigation]);

  const handleReviewSuccess = () => {
    fetchReviews();
    fetchMyReview();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.secondary} />
      </View>
    );
  }

  if (!stadium) return null;

  // Calculate minimum price from slots
  const minPrice = stadium.slots && stadium.slots.length > 0
    ? Math.min(...stadium.slots.map(slot => slot.price))
    : 0;

  // Collect all images from all locations for the carousel
  const allImages: string[] = [];
  if (stadium.locations) {
    stadium.locations.forEach(loc => {
      if (loc.images) allImages.push(...loc.images);
    });
  }

  return (
    <>
      <ScrollView style={styles.container}>
        {/* Hero Image Carousel with Overlay */}
        <View style={styles.heroContainer}>
          {allImages.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              ref={imageScrollRef}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / width);
                setActiveImageIndex(index);
              }}
              style={styles.heroImage}
            >
              {allImages.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: `${API_BASE_URL}${img}` }}
                  style={[styles.heroImage, { width }]}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  transition={300}
                  priority={i === activeImageIndex ? 'high' : 'low'}
                />
              ))}
            </ScrollView>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>🏟️</Text>
            </View>
          )}

          {/* Image counter badge */}
          {allImages.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1} / {allImages.length}
              </Text>
            </View>
          )}
          
          {/* Back Button */}
          <TouchableOpacity 
            style={[styles.backButton, { top: insets.top + 12 }]} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Feather name="arrow-left" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Stadium Info Overlay */}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>{stadium.name}</Text>
            
            {/* Locations */}
            <Text style={styles.heroLocation}>
              📍 {stadium.locations.map(l => l.name).join(' • ') || 'No locations'}
            </Text>
            
            <View style={styles.heroMeta}>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingIcon}>⭐</Text>
                <Text style={styles.ratingText}>
                  {averageRating.toFixed(1)} <Text style={styles.ratingCount}>({totalReviews} reviews)</Text>
                </Text>
              </View>
            </View>

            {/* Pagination Dots */}
            {allImages.length > 1 && (
              <View style={styles.dotsContainer}>
                {allImages.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === activeImageIndex && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Amenities */}
          {stadium.amenities && stadium.amenities.length > 0 && (
            <View style={styles.amenitiesSection}>
              {stadium.amenities.slice(0, 5).map((amenity, index) => {
                const IconComponent = amenityIconComponents[amenity];
                return (
                  <View key={index} style={styles.amenityItem}>
                    <View style={styles.amenityIcon}>
                      {IconComponent ? <IconComponent /> : (
                        <Text style={styles.amenityIconFallback}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.amenityLabel}>
                      {amenity.split(' ')[0]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Location Galleries */}
          {stadium.locations && stadium.locations.length > 0 && (
            <View style={styles.section}>
              {stadium.locations.map((loc) => (
                loc.images && loc.images.length > 0 ? (
                  <View key={loc.id} style={{ marginBottom: spacing.lg }}>
                    <Text style={[styles.sectionTitle, { marginBottom: spacing.sm }]}>
                      📍 {loc.name}
                      <Text style={{ fontSize: typography.sizes.sm, color: colors.text.muted, fontWeight: typography.weights.medium }}>
                        {' '}({loc.images.length} photos)
                      </Text>
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ gap: spacing.sm }}
                    >
                      {loc.images.map((img, i) => (
                        <Image
                          key={i}
                          source={{ uri: `${API_BASE_URL}${img}` }}
                          style={{
                            width: 160,
                            height: 120,
                            borderRadius: radius.md,
                            backgroundColor: colors.dark.surface,
                          }}
                          contentFit="cover"
                          cachePolicy="memory-disk"
                          transition={300}
                          priority="low"
                        />
                      ))}
                    </ScrollView>
                  </View>
                ) : null
              ))}
            </View>
          )}

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText}>
              {stadium.description || 'No description available.'}
            </Text>
          </View>

          {/* Subscription Plans Section */}
          {plans.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Subscription Plans</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.plansContainer}
                style={{ marginTop: spacing.md }}
              >
                {plans.map((plan) => (
                  <View key={plan.id} style={styles.planCard}>
                    <View style={styles.planBadge}>
                      <Text style={styles.planBadgeText}>MEMBERSHIP</Text>
                    </View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <View style={styles.planPriceContainer}>
                      <Text style={styles.planPrice}>{plan.price.toLocaleString()}</Text>
                      <Text style={styles.planPriceUnit}> ETB / {plan.duration} Days</Text>
                    </View>
                    
                    {/* Schedule & usage info */}
                    <View style={styles.planScheduleContainer}>
                      {plan.location && (
                        <Text style={styles.planScheduleText}>
                          📍 {plan.location}
                        </Text>
                      )}
                      <Text style={styles.planScheduleText}>
                        📅 {plan.openingDay} - {plan.closingDay}
                      </Text>
                      <Text style={styles.planScheduleText}>
                        🕒 {plan.openingTime} - {plan.closingTime}
                      </Text>
                      <Text style={styles.planScheduleText}>
                        ⏱️ {plan.hoursPerDay || 1} {(plan.hoursPerDay || 1) === 1 ? 'hour' : 'hours'} per day
                      </Text>
                      <Text style={styles.planScheduleHighlight}>
                        ⭐ Max {(plan.weeklyAllowedDays || 1) * Math.floor(plan.duration / 7)} play days ({plan.weeklyAllowedDays || 1} { (plan.weeklyAllowedDays || 1) === 1 ? 'day' : 'days' }/week)
                      </Text>
                    </View>
                    {plan.description && (
                      <View style={styles.planBenefits}>
                        {plan.description.split('\n').filter(Boolean).map((benefit, idx) => (
                          <View key={idx} style={styles.benefitRow}>
                            <Text style={styles.benefitCheck}>✓</Text>
                            <Text style={styles.benefitText} numberOfLines={2}>{benefit}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <TouchableOpacity
                      style={styles.subscribeButton}
                      onPress={() => navigation.navigate('SubscriptionCheckout', {
                        planId: plan.id,
                        planName: plan.name,
                        price: plan.price,
                        stadiumId,
                        stadiumName
                      })}
                    >
                      <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews ({totalReviews})</Text>
              <TouchableOpacity
                style={styles.writeReviewBtn}
                onPress={() => setShowReviewModal(true)}
              >
                <Text style={styles.writeReviewText}>
                  {myReview ? 'Edit' : 'Write'}
                </Text>
              </TouchableOpacity>
            </View>

            {reviews.length === 0 ? (
              <View style={styles.emptyReviews}>
                <Text style={styles.emptyReviewsIcon}>💬</Text>
                <Text style={styles.emptyReviewsText}>No reviews yet</Text>
                <Text style={styles.emptyReviewsSubtext}>Be the first to review this stadium</Text>
              </View>
            ) : (
              <View style={styles.reviewsList}>
                {reviews.slice(0, 3).map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>
                          {review.player?.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewName}>{review.player?.name}</Text>
                        <StarRating rating={review.rating} showCount={false} size={12} />
                      </View>
                    </View>
                    {review.comment && (
                      <Text style={styles.reviewComment} numberOfLines={3}>
                        {review.comment}
                      </Text>
                    )}
                    <Text style={styles.reviewDate}>
                      {new Date(review.createdAt).toLocaleDateString([], { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </Text>
                    
                    {/* Owner Reply */}
                    {review.ownerReply && (
                      <View style={styles.ownerReply}>
                        <View style={styles.ownerReplyHeader}>
                          <Text style={styles.ownerReplyLabel}>Owner Response</Text>
                          {review.repliedAt && (
                            <Text style={styles.ownerReplyDate}>
                              {new Date(review.repliedAt).toLocaleDateString([], { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Text>
                          )}
                        </View>
                        <Text style={styles.ownerReplyText}>{review.ownerReply}</Text>
                      </View>
                    )}
                  </View>
                ))}
                {reviews.length > 3 && (
                  <Text style={styles.moreReviews}>
                    + {reviews.length - 3} more review{reviews.length - 3 !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 + insets.bottom }} />
        </View>
      </ScrollView>

      {/* Bottom Bar with Pricing and Book Button */}
      <View style={[styles.bottomBar, { paddingBottom: spacing.lg + insets.bottom }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>From</Text>
          <Text style={styles.priceAmount}>
            {minPrice > 0 ? `${minPrice} ETB` : 'N/A'}
            <Text style={styles.priceUnit}> / hour</Text>
          </Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate('Booking', { stadiumId, stadiumName })}
        >
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>

      <ReviewModal
        visible={showReviewModal}
        stadiumId={stadiumId}
        stadiumName={stadiumName}
        existingReview={myReview}
        onClose={() => setShowReviewModal(false)}
        onSuccess={handleReviewSuccess}
      />
    </>
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
  
  // Hero Section
  heroContainer: {
    position: 'relative',
    height: 420,
  },
  heroImage: {
    width: width,
    height: 420,
    backgroundColor: colors.dark.surface,
  },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroPlaceholderText: {
    fontSize: 80,
    opacity: 0.3,
  },
  backButton: {
    position: 'absolute',
    // top is set dynamically via insets in the component
    top: 56,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(10, 14, 13, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: spacing.xs,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroLocation: {
    fontSize: typography.sizes.base,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.md,
    fontWeight: typography.weights.medium,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingIcon: {
    fontSize: 18,
  },
  ratingText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  ratingCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ade80',
  },
  imageCounter: {
    position: 'absolute',
    top: 56,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  imageCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Content
  content: {
    padding: spacing.xl,
  },

  // Amenities Section
  amenitiesSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  amenityItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  amenityIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(22, 163, 74, 0.3)',
  },
  amenityIconFallback: {
    fontSize: 24,
    color: colors.secondary,
    fontWeight: '700',
  },
  amenityLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: colors.text.primary,
    letterSpacing: -0.3
  },
  aboutText: {
    fontSize: typography.sizes.base,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  // Reviews
  writeReviewBtn: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  writeReviewText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  emptyReviews: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyReviewsIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
    opacity: 0.4,
  },
  emptyReviewsText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  emptyReviewsSubtext: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
  },
  reviewsList: {
    gap: spacing.md,
  },
  reviewCard: {
    backgroundColor: colors.dark.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.dark.border,
    gap: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewAvatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: '#fff',
  },
  reviewMeta: {
    flex: 1,
    gap: spacing.xs,
  },
  reviewName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  reviewComment: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: spacing.xs,
  },
  ownerReply: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    backgroundColor: colors.successBg,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  ownerReplyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ownerReplyLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ownerReplyDate: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  ownerReplyText: {
    fontSize: typography.sizes.sm,
    color: '#166534',
    lineHeight: 20,
  },
  moreReviews: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    textAlign: 'center',
    fontWeight: typography.weights.semibold,
    paddingVertical: spacing.md,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.dark.card,
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  priceUnit: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.muted,
  },
  bookButton: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.2,
  },
  plansContainer: {
    paddingRight: spacing.xl,
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  planCard: {
    width: width * 0.72,
    backgroundColor: colors.dark.card,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(22, 163, 74, 0.25)', // slight primary green highlight border
    padding: spacing.lg,
    marginRight: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  planBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(22, 163, 74, 0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: 'rgba(22, 163, 74, 0.4)',
    marginBottom: spacing.sm,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.secondary,
    letterSpacing: 1,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  planPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.secondary,
  },
  planPriceUnit: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.muted,
  },
  planBenefits: {
    borderTopWidth: 1,
    borderTopColor: colors.dark.border,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  benefitCheck: {
    fontSize: 12,
    color: colors.secondary,
    fontWeight: '700',
    marginTop: 1,
  },
  benefitText: {
    fontSize: 12,
    color: colors.text.secondary,
    lineHeight: 16,
    flex: 1,
  },
  subscribeButton: {
    backgroundColor: colors.secondary,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  subscribeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.1,
  },
  planScheduleContainer: {
    backgroundColor: colors.dark.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.dark.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: 4,
  },
  planScheduleText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  planScheduleHighlight: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.secondary,
    marginTop: 2,
  },
});

