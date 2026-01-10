/**
 * Customer Profile Screen
 * User profile management, settings, and account options
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, ConfirmModal, ListItem, SwitchListItem } from '../../components/ui';
import { useTheme } from '../../theme';

interface ProfileStats {
  totalBookings: number;
  totalSpent: number;
  favoriteShops: number;
  memberSince: string;
}

const mockUser = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-0123',
  avatar: 'https://i.pravatar.cc/150?img=1',
  memberSince: 'January 2024',
  isPremium: true,
};

const mockStats: ProfileStats = {
  totalBookings: 24,
  totalSpent: 680,
  favoriteShops: 5,
  memberSince: 'January 2024',
};

export const ProfileScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleViewHistory = () => {
    router.push('/history');
  };

  const handleViewFavorites = () => {
    router.push('/favorites');
  };

  const handleViewPaymentMethods = () => {
    router.push('/profile/payment-methods');
  };

  const handleViewNotificationSettings = () => {
    router.push('/profile/notifications');
  };

  const handleViewPrivacy = () => {
    router.push('/profile/privacy');
  };

  const handleHelp = () => {
    router.push('/help');
  };

  const handleRateApp = () => {
    // TODO: Open app store rating
    Alert.alert('Rate Us', 'Thanks for your support! 🎉');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // TODO: Implement logout
    setShowLogoutModal(false);
    router.replace('/auth');
  };

  const renderProfileHeader = () => (
    <View style={[styles.profileHeader, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.avatarSection}>
        <Avatar
          name={`${mockUser.firstName} ${mockUser.lastName}`}
          source={{ uri: mockUser.avatar }}
          size={80}
          showOnline
        />
        <TouchableOpacity
          style={[
            styles.editAvatarButton,
            { backgroundColor: theme.colors.primary[500] },
          ]}
          onPress={handleEditProfile}
        >
          <Ionicons name="camera-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.nameRow}>
          <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
            {mockUser.firstName} {mockUser.lastName}
          </Text>
          {mockUser.isPremium && (
            <Badge label="Premium" variant="warning" size="sm" />
          )}
        </View>
        <Text style={[styles.userEmail, { color: theme.colors.text.secondary }]}>
          {mockUser.email}
        </Text>
        <Text style={[styles.memberSince, { color: theme.colors.text.muted }]}>
          Member since {mockUser.memberSince}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.editButton, { borderColor: theme.colors.border }]}
        onPress={handleEditProfile}
      >
        <Ionicons
          name="pencil-outline"
          size={16}
          color={theme.colors.primary[500]}
        />
        <Text
          style={[styles.editButtonText, { color: theme.colors.primary[500] }]}
        >
          Edit Profile
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStats = () => (
    <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>
          {mockStats.totalBookings}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
          Bookings
        </Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>
          ${mockStats.totalSpent}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
          Spent
        </Text>
      </View>
      <View style={[styles.statDivider, { backgroundColor: theme.colors.border }]} />
      <View style={styles.statItem}>
        <Text style={[styles.statValue, { color: theme.colors.primary[500] }]}>
          {mockStats.favoriteShops}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.text.secondary }]}>
          Favorites
        </Text>
      </View>
    </View>
  );

  const renderMenuSections = () => (
    <View style={styles.menuSections}>
      {/* Activity Section */}
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
          Activity
        </Text>
        <ListItem
          title="Booking History"
          leftIcon="time-outline"
          rightIcon="chevron-forward"
          onPress={handleViewHistory}
        />
        <ListItem
          title="Favorite Shops"
          leftIcon="heart-outline"
          rightIcon="chevron-forward"
          rightContent={
            <Badge label={mockStats.favoriteShops.toString()} size="sm" />
          }
          onPress={handleViewFavorites}
        />
        <ListItem
          title="Reviews"
          leftIcon="star-outline"
          rightIcon="chevron-forward"
          onPress={() => router.push('/profile/reviews')}
        />
      </View>

      {/* Payment Section */}
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
          Payment
        </Text>
        <ListItem
          title="Payment Methods"
          leftIcon="card-outline"
          rightIcon="chevron-forward"
          onPress={handleViewPaymentMethods}
        />
        <ListItem
          title="Transaction History"
          leftIcon="receipt-outline"
          rightIcon="chevron-forward"
          onPress={() => router.push('/profile/transactions')}
        />
        {mockUser.isPremium && (
          <ListItem
            title="Premium Subscription"
            leftIcon="diamond-outline"
            rightIcon="chevron-forward"
            rightContent={<Badge label="Active" variant="success" size="sm" />}
            onPress={() => router.push('/profile/subscription')}
          />
        )}
      </View>

      {/* Preferences Section */}
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
          Preferences
        </Text>
        <SwitchListItem
          title="Push Notifications"
          subtitle="Get updates on your bookings"
          leftIcon="notifications-outline"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
        <SwitchListItem
          title="Location Services"
          subtitle="Find nearby shops"
          leftIcon="location-outline"
          value={locationEnabled}
          onValueChange={setLocationEnabled}
        />
        <ListItem
          title="Notification Settings"
          leftIcon="settings-outline"
          rightIcon="chevron-forward"
          onPress={handleViewNotificationSettings}
        />
      </View>

      {/* Support Section */}
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
          Support
        </Text>
        <ListItem
          title="Help Center"
          leftIcon="help-circle-outline"
          rightIcon="chevron-forward"
          onPress={handleHelp}
        />
        <ListItem
          title="Contact Support"
          leftIcon="chatbubble-outline"
          rightIcon="chevron-forward"
          onPress={() => router.push('/support')}
        />
        <ListItem
          title="Rate FadeUp"
          leftIcon="star-half-outline"
          rightIcon="chevron-forward"
          onPress={handleRateApp}
        />
      </View>

      {/* Legal Section */}
      <View style={[styles.menuSection, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.muted }]}>
          Legal
        </Text>
        <ListItem
          title="Privacy Policy"
          leftIcon="shield-outline"
          rightIcon="chevron-forward"
          onPress={handleViewPrivacy}
        />
        <ListItem
          title="Terms of Service"
          leftIcon="document-text-outline"
          rightIcon="chevron-forward"
          onPress={() => router.push('/terms')}
        />
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error[50] }]}
        onPress={handleLogout}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={theme.colors.error[500]}
        />
        <Text
          style={[styles.logoutText, { color: theme.colors.error[500] }]}
        >
          Log Out
        </Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={[styles.versionText, { color: theme.colors.text.muted }]}>
        FadeUp v1.0.0
      </Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Profile
        </Text>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            { backgroundColor: theme.colors.neutral[100] },
          ]}
          onPress={() => router.push('/(tabs)/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {renderProfileHeader()}
        {renderStats()}
        {renderMenuSections()}
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Log Out"
        message="Are you sure you want to log out?"
        confirmLabel="Log Out"
        cancelLabel="Cancel"
        confirmVariant="error"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: '100%',
    marginHorizontal: 8,
  },
  menuSections: {
    gap: 16,
  },
  menuSection: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 16,
  },
});

export default ProfileScreen;
