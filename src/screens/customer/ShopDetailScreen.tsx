/**
 * Shop Detail Screen
 * Complete shop profile with services, barbers, reviews, and booking options
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, RatingDisplay, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = 280;

// Mock data
const mockShop = {
  id: '1',
  name: 'Premium Cuts',
  description:
    'Premium Cuts is a full-service barbershop offering traditional and modern haircuts, beard grooming, and spa services. Our skilled barbers are dedicated to providing exceptional service in a comfortable environment.',
  address: '123 Main St',
  city: 'New York',
  state: 'NY',
  zip_code: '10001',
  phone: '+1 555-0123',
  email: 'hello@premiumcuts.com',
  website: 'www.premiumcuts.com',
  latitude: 40.7128,
  longitude: -74.006,
  rating: 4.8,
  review_count: 234,
  is_active: true,
  images: [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800',
    'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=800',
  ],
  operating_hours: {
    monday: { open: '09:00', close: '20:00' },
    tuesday: { open: '09:00', close: '20:00' },
    wednesday: { open: '09:00', close: '20:00' },
    thursday: { open: '09:00', close: '21:00' },
    friday: { open: '09:00', close: '21:00' },
    saturday: { open: '08:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' },
  },
  currentWait: 15,
  queueLength: 3,
  isFavorite: false,
  amenities: ['WiFi', 'Air Conditioning', 'Parking', 'Card Payment'],
};

const mockServices = [
  { id: '1', name: 'Classic Haircut', duration: 30, price: 25, popular: true },
  { id: '2', name: 'Fade Haircut', duration: 45, price: 35, popular: true },
  { id: '3', name: 'Beard Trim', duration: 20, price: 15, popular: false },
  { id: '4', name: 'Beard Shaping', duration: 30, price: 25, popular: false },
  { id: '5', name: 'Hot Towel Shave', duration: 30, price: 30, popular: true },
  { id: '6', name: 'Hair + Beard Combo', duration: 60, price: 50, popular: true },
  { id: '7', name: 'Kids Haircut', duration: 25, price: 18, popular: false },
  { id: '8', name: 'Hair Coloring', duration: 90, price: 75, popular: false },
];

const mockBarbers = [
  { id: '1', name: 'Mike Johnson', specialty: 'Fades & Designs', rating: 4.9, reviews: 156, available: true },
  { id: '2', name: 'James Wilson', specialty: 'Classic Cuts', rating: 4.7, reviews: 98, available: true },
  { id: '3', name: 'Alex Brown', specialty: 'Beard Expert', rating: 4.8, reviews: 134, available: false },
];

const mockReviews = [
  {
    id: '1',
    userName: 'John D.',
    rating: 5,
    comment: 'Best haircut I\'ve ever had! Mike really knows his stuff.',
    date: '2 days ago',
    helpful: 12,
  },
  {
    id: '2',
    userName: 'Sarah M.',
    rating: 4,
    comment: 'Great atmosphere and friendly staff. Wait time was a bit long.',
    date: '1 week ago',
    helpful: 8,
  },
  {
    id: '3',
    userName: 'Robert K.',
    rating: 5,
    comment: 'Been coming here for years. Consistent quality every time.',
    date: '2 weeks ago',
    helpful: 23,
  },
];

type TabType = 'services' | 'barbers' | 'reviews' | 'about';

export const ShopDetailScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [refreshing, setRefreshing] = useState(false);
  const [isFavorite, setIsFavorite] = useState(mockShop.isFavorite);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [imageIndex, setImageIndex] = useState(0);

  const scrollY = new Animated.Value(0);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, IMAGE_HEIGHT - 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${mockShop.name} on FadeUp!\n${mockShop.address}, ${mockShop.city}`,
        title: mockShop.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: Update favorite in backend
  };

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleJoinQueue = () => {
    router.push({
      pathname: '/shop/[id]/join-queue',
      params: { id: mockShop.id, services: selectedServices.join(',') },
    });
  };

  const handleBookAppointment = () => {
    router.push({
      pathname: '/shop/[id]/book',
      params: { id: mockShop.id, services: selectedServices.join(',') },
    });
  };

  const handleCall = () => {
    // TODO: Implement phone call
  };

  const handleDirections = () => {
    // TODO: Open maps
  };

  const tabs = [
    { key: 'services', label: 'Services' },
    { key: 'barbers', label: 'Barbers' },
    { key: 'reviews', label: 'Reviews' },
    { key: 'about', label: 'About' },
  ];

  const renderImageCarousel = () => (
    <View style={styles.imageContainer}>
      <FlatList
        data={mockShop.images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setImageIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.headerImage} />
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.imageGradient}
      />
      <View style={styles.imagePagination}>
        {mockShop.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              index === imageIndex && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );

  const renderShopInfo = () => (
    <View style={[styles.shopInfoCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.shopHeader}>
        <View style={styles.shopTitleRow}>
          <Text style={[styles.shopName, { color: theme.colors.text.primary }]}>
            {mockShop.name}
          </Text>
          <Badge label="Open" variant="success" />
        </View>
        <View style={styles.shopMeta}>
          <RatingDisplay rating={mockShop.rating} reviewCount={mockShop.review_count} />
          <Text style={[styles.shopAddress, { color: theme.colors.text.secondary }]}>
            {mockShop.address}, {mockShop.city}
          </Text>
        </View>
      </View>

      <View style={styles.shopStats}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockShop.currentWait} min
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            Wait Time
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockShop.queueLength}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            In Queue
          </Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
        <View style={styles.statItem}>
          <Ionicons name="cut-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockBarbers.filter((b) => b.available).length}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
            Available
          </Text>
        </View>
      </View>

      <View style={styles.shopActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={handleCall}
        >
          <Ionicons name="call-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>
            Call
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={handleDirections}
        >
          <Ionicons name="navigate-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>
            Directions
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.actionText, { color: theme.colors.primary[500] }]}>
            Share
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      {mockServices.map((service) => {
        const isSelected = selectedServices.includes(service.id);
        return (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.serviceCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.primary[500]
                  : theme.colors.border,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
            onPress={() => toggleService(service.id)}
            activeOpacity={0.8}
          >
            <View style={styles.serviceInfo}>
              <View style={styles.serviceHeader}>
                <Text
                  style={[styles.serviceName, { color: theme.colors.text.primary }]}
                >
                  {service.name}
                </Text>
                {service.popular && <Badge label="Popular" variant="info" size="sm" />}
              </View>
              <View style={styles.serviceMeta}>
                <Text
                  style={[styles.serviceDuration, { color: theme.colors.text.secondary }]}
                >
                  {service.duration} min
                </Text>
              </View>
            </View>
            <View style={styles.serviceRight}>
              <Text style={[styles.servicePrice, { color: theme.colors.text.primary }]}>
                ${service.price}
              </Text>
              <View
                style={[
                  styles.checkbox,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primary[500]
                      : 'transparent',
                    borderColor: isSelected
                      ? theme.colors.primary[500]
                      : theme.colors.border,
                  },
                ]}
              >
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderBarbersTab = () => (
    <View style={styles.tabContent}>
      {mockBarbers.map((barber) => (
        <TouchableOpacity
          key={barber.id}
          style={[styles.barberCard, { backgroundColor: theme.colors.surface }]}
          activeOpacity={0.8}
        >
          <Avatar name={barber.name} size={56} />
          <View style={styles.barberInfo}>
            <View style={styles.barberHeader}>
              <Text
                style={[styles.barberName, { color: theme.colors.text.primary }]}
              >
                {barber.name}
              </Text>
              <Badge
                label={barber.available ? 'Available' : 'Busy'}
                variant={barber.available ? 'success' : 'default'}
                size="sm"
              />
            </View>
            <Text
              style={[styles.barberSpecialty, { color: theme.colors.text.secondary }]}
            >
              {barber.specialty}
            </Text>
            <View style={styles.barberRating}>
              <Ionicons name="star" size={14} color={theme.colors.warning[500]} />
              <Text
                style={[
                  styles.barberRatingText,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {barber.rating} ({barber.reviews} reviews)
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.reviewsSummary, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.reviewsRating}>
          <Text style={[styles.reviewsRatingNumber, { color: theme.colors.text.primary }]}>
            {mockShop.rating}
          </Text>
          <View style={styles.reviewsStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={star <= Math.floor(mockShop.rating) ? 'star' : 'star-outline'}
                size={20}
                color={theme.colors.warning[500]}
              />
            ))}
          </View>
          <Text style={[styles.reviewsCount, { color: theme.colors.text.secondary }]}>
            Based on {mockShop.review_count} reviews
          </Text>
        </View>
      </View>

      {mockReviews.map((review) => (
        <View
          key={review.id}
          style={[styles.reviewCard, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.reviewHeader}>
            <Avatar name={review.userName} size={40} />
            <View style={styles.reviewMeta}>
              <Text
                style={[styles.reviewUserName, { color: theme.colors.text.primary }]}
              >
                {review.userName}
              </Text>
              <Text
                style={[styles.reviewDate, { color: theme.colors.text.muted }]}
              >
                {review.date}
              </Text>
            </View>
            <View style={styles.reviewRating}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= review.rating ? 'star' : 'star-outline'}
                  size={14}
                  color={theme.colors.warning[500]}
                />
              ))}
            </View>
          </View>
          <Text
            style={[styles.reviewComment, { color: theme.colors.text.secondary }]}
          >
            {review.comment}
          </Text>
          <TouchableOpacity style={styles.helpfulButton}>
            <Ionicons
              name="thumbs-up-outline"
              size={16}
              color={theme.colors.text.muted}
            />
            <Text
              style={[styles.helpfulText, { color: theme.colors.text.muted }]}
            >
              Helpful ({review.helpful})
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <Button variant="outline" fullWidth style={{ marginTop: 8 }}>
        View All Reviews
      </Button>
    </View>
  );

  const renderAboutTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.aboutSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text.primary }]}>
          About Us
        </Text>
        <Text style={[styles.aboutText, { color: theme.colors.text.secondary }]}>
          {mockShop.description}
        </Text>
      </View>

      <View style={[styles.aboutSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text.primary }]}>
          Operating Hours
        </Text>
        {Object.entries(mockShop.operating_hours).map(([day, hours]) => (
          <View key={day} style={styles.hoursRow}>
            <Text
              style={[styles.hoursDay, { color: theme.colors.text.secondary }]}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </Text>
            <Text
              style={[styles.hoursTime, { color: theme.colors.text.primary }]}
            >
              {hours.open} - {hours.close}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.aboutSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text.primary }]}>
          Amenities
        </Text>
        <View style={styles.amenitiesGrid}>
          {mockShop.amenities.map((amenity) => (
            <View key={amenity} style={styles.amenityItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success[500]}
              />
              <Text
                style={[styles.amenityText, { color: theme.colors.text.secondary }]}
              >
                {amenity}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.aboutSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.aboutTitle, { color: theme.colors.text.primary }]}>
          Contact
        </Text>
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons
            name="call-outline"
            size={18}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.contactText, { color: theme.colors.primary[500] }]}
          >
            {mockShop.phone}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.contactText, { color: theme.colors.primary[500] }]}
          >
            {mockShop.email}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactRow}>
          <Ionicons
            name="globe-outline"
            size={18}
            color={theme.colors.primary[500]}
          />
          <Text
            style={[styles.contactText, { color: theme.colors.primary[500] }]}
          >
            {mockShop.website}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'services':
        return renderServicesTab();
      case 'barbers':
        return renderBarbersTab();
      case 'reviews':
        return renderReviewsTab();
      case 'about':
        return renderAboutTab();
      default:
        return null;
    }
  };

  const totalPrice = selectedServices.reduce((sum, id) => {
    const service = mockServices.find((s) => s.id === id);
    return sum + (service?.price || 0);
  }, 0);

  const totalDuration = selectedServices.reduce((sum, id) => {
    const service = mockServices.find((s) => s.id === id);
    return sum + (service?.duration || 0);
  }, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Animated Header */}
      <Animated.View
        style={[
          styles.animatedHeader,
          {
            backgroundColor: theme.colors.background,
            opacity: headerOpacity,
            paddingTop: insets.top,
          },
        ]}
      >
        <Text
          style={[styles.animatedHeaderTitle, { color: theme.colors.text.primary }]}
          numberOfLines={1}
        >
          {mockShop.name}
        </Text>
      </Animated.View>

      {/* Fixed Header Buttons */}
      <View style={[styles.fixedHeader, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: 'rgba(0,0,0,0.3)' }]}
          onPress={toggleFavorite}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? theme.colors.error[500] : '#FFFFFF'}
          />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[500]}
          />
        }
      >
        {renderImageCarousel()}
        {renderShopInfo()}

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
          style={{ marginHorizontal: 16, marginTop: 16 }}
        />

        {renderTabContent()}

        <View style={{ height: 120 }} />
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      {selectedServices.length > 0 && (
        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: theme.colors.surface,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.selectionSummary}>
            <Text
              style={[styles.selectionCount, { color: theme.colors.text.primary }]}
            >
              {selectedServices.length} service{selectedServices.length > 1 ? 's' : ''} •{' '}
              {totalDuration} min
            </Text>
            <Text
              style={[styles.selectionPrice, { color: theme.colors.text.primary }]}
            >
              ${totalPrice}
            </Text>
          </View>
          <View style={styles.bottomActions}>
            <Button
              variant="outline"
              onPress={handleJoinQueue}
              style={{ flex: 1 }}
            >
              Join Queue
            </Button>
            <Button onPress={handleBookAppointment} style={{ flex: 1 }}>
              Book Now
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 100,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 60,
  },
  animatedHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 101,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    height: IMAGE_HEIGHT,
    width: SCREEN_WIDTH,
  },
  headerImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: IMAGE_HEIGHT / 2,
  },
  imagePagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  shopInfoCard: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopHeader: {
    marginBottom: 16,
  },
  shopTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  shopMeta: {
    gap: 4,
  },
  shopAddress: {
    fontSize: 14,
    marginTop: 4,
  },
  shopStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  shopActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceDuration: {
    fontSize: 13,
  },
  serviceRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  barberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  barberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  barberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  barberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  barberSpecialty: {
    fontSize: 13,
    marginBottom: 4,
  },
  barberRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  barberRatingText: {
    fontSize: 12,
  },
  reviewsSummary: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewsRating: {
    alignItems: 'center',
  },
  reviewsRatingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  reviewsStars: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  reviewsCount: {
    fontSize: 14,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewMeta: {
    flex: 1,
    marginLeft: 12,
  },
  reviewUserName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpfulText: {
    fontSize: 13,
  },
  aboutSection: {
    padding: 16,
    borderRadius: 12,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  hoursDay: {
    fontSize: 14,
  },
  hoursTime: {
    fontSize: 14,
    fontWeight: '500',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '45%',
  },
  amenityText: {
    fontSize: 14,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionCount: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default ShopDetailScreen;
