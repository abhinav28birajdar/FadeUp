/**
 * Notifications Screen
 * Display all notifications for both customers and barbers
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

interface Notification {
  id: string;
  type: 'booking' | 'queue' | 'promo' | 'system' | 'review' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: "Your appointment at Mike's Barber Shop for tomorrow at 2:00 PM has been confirmed.",
    timestamp: '5 min ago',
    isRead: false,
    actionUrl: '/bookings/1',
  },
  {
    id: '2',
    type: 'queue',
    title: "You're Next!",
    message: 'Get ready! You are next in the queue at Fresh Cuts.',
    timestamp: '15 min ago',
    isRead: false,
    actionUrl: '/queue',
  },
  {
    id: '3',
    type: 'promo',
    title: '20% Off This Weekend!',
    message: 'Book any service this weekend and get 20% off. Use code: WEEKEND20',
    timestamp: '1 hour ago',
    isRead: false,
  },
  {
    id: '4',
    type: 'review',
    title: 'Leave a Review',
    message: "How was your experience at Mike's Barber Shop? Leave a review!",
    timestamp: '3 hours ago',
    isRead: true,
    actionUrl: '/reviews/new/1',
  },
  {
    id: '5',
    type: 'payment',
    title: 'Payment Successful',
    message: 'Your payment of $45 has been processed successfully.',
    timestamp: 'Yesterday',
    isRead: true,
    actionUrl: '/payments/1',
  },
  {
    id: '6',
    type: 'system',
    title: 'Welcome to FadeUp!',
    message: 'Thanks for joining! Explore nearby barber shops and book your first appointment.',
    timestamp: '2 days ago',
    isRead: true,
  },
  {
    id: '7',
    type: 'booking',
    title: 'Booking Reminder',
    message: 'Reminder: Your appointment is in 2 hours at Fresh Cuts.',
    timestamp: '2 days ago',
    isRead: true,
    actionUrl: '/bookings/2',
  },
  {
    id: '8',
    type: 'queue',
    title: 'Queue Update',
    message: 'Your position has moved up! You are now #2 in the queue.',
    timestamp: '3 days ago',
    isRead: true,
    actionUrl: '/queue',
  },
];

type TabType = 'all' | 'unread';

export const NotificationsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
  ];

  const filteredNotifications = notifications.filter(
    (n) => activeTab === 'all' || !n.isRead
  );

  const getNotificationIcon = (type: Notification['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'booking':
        return 'calendar-outline';
      case 'queue':
        return 'people-outline';
      case 'promo':
        return 'pricetag-outline';
      case 'system':
        return 'notifications-outline';
      case 'review':
        return 'star-outline';
      case 'payment':
        return 'card-outline';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking':
        return theme.colors.primary[500];
      case 'queue':
        return theme.colors.success[500];
      case 'promo':
        return theme.colors.warning[500];
      case 'system':
        return theme.colors.neutral[400];
      case 'review':
        return theme.colors.warning[400];
      case 'payment':
        return theme.colors.success[500];
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate if action URL exists
    if (notification.actionUrl) {
      router.push(notification.actionUrl as any);
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.isRead
            ? theme.colors.surface
            : theme.colors.primary[50],
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.type) + '20' },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={22}
          color={getNotificationColor(item.type)}
        />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.title,
              {
                color: theme.colors.text.primary,
                fontWeight: item.isRead ? '500' : '600',
              },
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && (
            <View
              style={[
                styles.unreadDot,
                { backgroundColor: theme.colors.primary[500] },
              ]}
            />
          )}
        </View>
        <Text
          style={[styles.message, { color: theme.colors.text.secondary }]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        <Text style={[styles.timestamp, { color: theme.colors.text.muted }]}>
          {item.timestamp}
        </Text>
      </View>
    </TouchableOpacity>
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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Notifications
        </Text>
        <TouchableOpacity
          onPress={handleMarkAllRead}
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markReadText,
              {
                color:
                  unreadCount > 0
                    ? theme.colors.primary[500]
                    : theme.colors.text.muted,
              },
            ]}
          >
            Mark all read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as TabType)}
        style={{ marginHorizontal: 16, marginBottom: 16 }}
      />

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View
              style={[
                styles.emptyIcon,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
            >
              <Ionicons
                name="notifications-off-outline"
                size={48}
                color={theme.colors.text.muted}
              />
            </View>
            <Text
              style={[styles.emptyTitle, { color: theme.colors.text.primary }]}
            >
              No notifications
            </Text>
            <Text
              style={[styles.emptyMessage, { color: theme.colors.text.secondary }]}
            >
              {activeTab === 'unread'
                ? "You're all caught up!"
                : "You don't have any notifications yet"}
            </Text>
          </View>
        }
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
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  markReadText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default NotificationsScreen;
