/**
 * Barber Shop Profile Screen
 * Manage shop information, hours, services, and settings
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

interface ShopInfo {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  totalCustomers: number;
  coverImage: string;
  logo: string;
  isVerified: boolean;
  status: 'open' | 'closed' | 'busy';
}

interface BusinessHour {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface ServiceCategory {
  id: string;
  name: string;
  servicesCount: number;
}

const mockShop: ShopInfo = {
  id: '1',
  name: "Mike's Barber Shop",
  description: 'Premium barbershop offering classic and modern styles. Our experienced barbers provide top-quality haircuts, beard trims, and grooming services.',
  address: '123 Main Street, Downtown',
  phone: '+1 (555) 123-4567',
  email: 'contact@mikesbarber.com',
  rating: 4.8,
  reviewCount: 256,
  totalCustomers: 1250,
  coverImage: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600',
  logo: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
  isVerified: true,
  status: 'open',
};

const mockHours: BusinessHour[] = [
  { day: 'Monday', isOpen: true, openTime: '9:00 AM', closeTime: '7:00 PM' },
  { day: 'Tuesday', isOpen: true, openTime: '9:00 AM', closeTime: '7:00 PM' },
  { day: 'Wednesday', isOpen: true, openTime: '9:00 AM', closeTime: '7:00 PM' },
  { day: 'Thursday', isOpen: true, openTime: '9:00 AM', closeTime: '8:00 PM' },
  { day: 'Friday', isOpen: true, openTime: '9:00 AM', closeTime: '8:00 PM' },
  { day: 'Saturday', isOpen: true, openTime: '8:00 AM', closeTime: '6:00 PM' },
  { day: 'Sunday', isOpen: false, openTime: '', closeTime: '' },
];

const mockCategories: ServiceCategory[] = [
  { id: '1', name: 'Haircuts', servicesCount: 5 },
  { id: '2', name: 'Beard & Shave', servicesCount: 4 },
  { id: '3', name: 'Hair Coloring', servicesCount: 3 },
  { id: '4', name: 'Kids', servicesCount: 2 },
  { id: '5', name: 'Packages', servicesCount: 3 },
];

type TabType = 'details' | 'hours' | 'services' | 'gallery';

export const ShopProfileScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('details');

  const tabs = [
    { key: 'details', label: 'Details' },
    { key: 'hours', label: 'Hours' },
    { key: 'services', label: 'Services' },
    { key: 'gallery', label: 'Gallery' },
  ];

  const handleEditCover = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle image upload
      Alert.alert('Success', 'Cover image updated!');
    }
  };

  const handleEditLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Handle image upload
      Alert.alert('Success', 'Logo updated!');
    }
  };

  const getStatusColor = (status: ShopInfo['status']) => {
    switch (status) {
      case 'open':
        return theme.colors.success[500];
      case 'closed':
        return theme.colors.error[500];
      case 'busy':
        return theme.colors.warning[500];
    }
  };

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Cover Image */}
      <TouchableOpacity onPress={handleEditCover} activeOpacity={0.9}>
        <Image
          source={{ uri: mockShop.coverImage }}
          style={styles.coverImage}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.coverGradient}
        />
        <View style={styles.editCoverButton}>
          <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
          <Text style={styles.editCoverText}>Edit Cover</Text>
        </View>
      </TouchableOpacity>

      {/* Back Button */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={[styles.settingsButton, { top: insets.top + 8 }]}
        onPress={() => router.push('/shop/settings')}
      >
        <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <TouchableOpacity onPress={handleEditLogo}>
          <Image source={{ uri: mockShop.logo }} style={styles.logo} />
          <View style={styles.editLogoButton}>
            <Ionicons name="camera" size={14} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderShopInfo = () => (
    <View style={styles.shopInfo}>
      <View style={styles.nameRow}>
        <Text style={[styles.shopName, { color: theme.colors.text.primary }]}>
          {mockShop.name}
        </Text>
        {mockShop.isVerified && (
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={theme.colors.primary[500]}
          />
        )}
      </View>
      <View style={styles.statsRow}>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={theme.colors.warning[400]} />
          <Text style={[styles.ratingText, { color: theme.colors.text.primary }]}>
            {mockShop.rating}
          </Text>
          <Text style={[styles.reviewText, { color: theme.colors.text.muted }]}>
            ({mockShop.reviewCount} reviews)
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(mockShop.status) + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(mockShop.status) }]} />
          <Text style={[styles.statusText, { color: getStatusColor(mockShop.status) }]}>
            {mockShop.status.charAt(0).toUpperCase() + mockShop.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.statsCards}>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="people-outline" size={24} color={theme.colors.primary[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockShop.totalCustomers}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.muted }]}>
            Customers
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="star-outline" size={24} color={theme.colors.warning[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockShop.reviewCount}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.muted }]}>
            Reviews
          </Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.colors.surface }]}>
          <Ionicons name="cut-outline" size={24} color={theme.colors.success[500]} />
          <Text style={[styles.statValue, { color: theme.colors.text.primary }]}>
            {mockCategories.reduce((acc, cat) => acc + cat.servicesCount, 0)}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.text.muted }]}>
            Services
          </Text>
        </View>
      </View>
    </View>
  );

  const renderDetailsTab = () => (
    <View style={styles.tabContent}>
      {/* Description */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            About
          </Text>
          <TouchableOpacity onPress={() => router.push('/shop/edit/description')}>
            <Ionicons name="pencil-outline" size={18} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.descriptionText, { color: theme.colors.text.secondary }]}>
          {mockShop.description}
        </Text>
      </View>

      {/* Contact Info */}
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Contact Information
          </Text>
          <TouchableOpacity onPress={() => router.push('/shop/edit/contact')}>
            <Ionicons name="pencil-outline" size={18} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="location-outline" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.contactText, { color: theme.colors.text.primary }]}>
            {mockShop.address}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="call-outline" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.contactText, { color: theme.colors.text.primary }]}>
            {mockShop.phone}
          </Text>
        </View>
        <View style={styles.contactItem}>
          <Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />
          <Text style={[styles.contactText, { color: theme.colors.text.primary }]}>
            {mockShop.email}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderHoursTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Business Hours
          </Text>
          <TouchableOpacity onPress={() => router.push('/shop/edit/hours')}>
            <Ionicons name="pencil-outline" size={18} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        {mockHours.map((hour, index) => (
          <View key={hour.day} style={styles.hourRow}>
            <Text style={[styles.dayText, { color: theme.colors.text.primary }]}>
              {hour.day}
            </Text>
            {hour.isOpen ? (
              <Text style={[styles.hourText, { color: theme.colors.text.secondary }]}>
                {hour.openTime} - {hour.closeTime}
              </Text>
            ) : (
              <Text style={[styles.closedText, { color: theme.colors.error[500] }]}>
                Closed
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  const renderServicesTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Service Categories
          </Text>
          <TouchableOpacity onPress={() => router.push('/shop/services/add')}>
            <Ionicons name="add-outline" size={22} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        {mockCategories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryRow}
            onPress={() => router.push(`/shop/services/${category.id}`)}
          >
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: theme.colors.text.primary }]}>
                {category.name}
              </Text>
              <Text style={[styles.categoryCount, { color: theme.colors.text.muted }]}>
                {category.servicesCount} services
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text.muted}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGalleryTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Photo Gallery
          </Text>
          <TouchableOpacity onPress={() => router.push('/shop/gallery/add')}>
            <Ionicons name="add-outline" size={22} color={theme.colors.primary[500]} />
          </TouchableOpacity>
        </View>
        <View style={styles.galleryGrid}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.galleryItem}
              onPress={() => router.push(`/shop/gallery/${item}`)}
            >
              <Image
                source={{ uri: `https://picsum.photos/200?random=${item}` }}
                style={styles.galleryImage}
              />
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.viewAllButton, { borderColor: theme.colors.neutral[200] }]}
          onPress={() => router.push('/shop/gallery')}
        >
          <Text style={[styles.viewAllText, { color: theme.colors.primary[500] }]}>
            View All Photos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return renderDetailsTab();
      case 'hours':
        return renderHoursTab();
      case 'services':
        return renderServicesTab();
      case 'gallery':
        return renderGalleryTab();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderHeader()}
        {renderShopInfo()}

        <TabBar
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab as TabType)}
          style={{ marginHorizontal: 16, marginVertical: 16 }}
        />

        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    height: 200,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: 200,
  },
  coverGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  editCoverButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  editCoverText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -40,
    left: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  editLogoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shopInfo: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  shopName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
  },
  reviewText: {
    fontSize: 13,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statsCards: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  contactText: {
    fontSize: 14,
    flex: 1,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  hourText: {
    fontSize: 14,
  },
  closedText: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  categoryInfo: {},
  categoryName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  galleryItem: {
    width: '31%',
    aspectRatio: 1,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ShopProfileScreen;
