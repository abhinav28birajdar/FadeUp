/**
 * Customer Queue Screen
 * View and manage current queue position
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar, Badge, Button, ConfirmModal } from '../../components/ui';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface QueueInfo {
  shopName: string;
  shopAddress: string;
  barberName: string;
  services: string[];
  position: number;
  totalInQueue: number;
  estimatedWait: number;
  joinedAt: string;
  serviceDuration: number;
  totalPrice: number;
  status: 'waiting' | 'almost_ready' | 'ready';
}

const mockQueueInfo: QueueInfo | null = {
  shopName: 'Premium Cuts',
  shopAddress: '123 Main St, New York',
  barberName: 'Mike Johnson',
  services: ['Fade Haircut', 'Beard Trim'],
  position: 3,
  totalInQueue: 7,
  estimatedWait: 15,
  joinedAt: '10:15 AM',
  serviceDuration: 65,
  totalPrice: 50,
  status: 'waiting',
};

export const QueueScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [queueInfo, setQueueInfo] = useState<QueueInfo | null>(mockQueueInfo);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (queueInfo?.status === 'almost_ready' || queueInfo?.status === 'ready') {
      // Pulse animation for almost ready/ready state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Progress animation
    if (queueInfo) {
      const progress = ((queueInfo.totalInQueue - queueInfo.position + 1) / queueInfo.totalInQueue);
      Animated.timing(progressAnim, {
        toValue: progress,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }
  }, [queueInfo?.status, queueInfo?.position]);

  const handleLeaveQueue = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveQueue = () => {
    // TODO: Implement leave queue
    setQueueInfo(null);
    setShowLeaveModal(false);
    Alert.alert('Success', 'You have left the queue');
  };

  const handleViewShop = () => {
    router.push({
      pathname: '/shop/[id]',
      params: { id: '1' }, // TODO: Use actual shop ID
    });
  };

  const handleGetDirections = () => {
    // TODO: Open maps with directions
  };

  const handleContactShop = () => {
    // TODO: Implement phone call
  };

  const getStatusColor = () => {
    switch (queueInfo?.status) {
      case 'ready':
        return theme.colors.success[500];
      case 'almost_ready':
        return theme.colors.warning[500];
      default:
        return theme.colors.primary[500];
    }
  };

  const getStatusText = () => {
    switch (queueInfo?.status) {
      case 'ready':
        return "It's your turn!";
      case 'almost_ready':
        return 'Almost your turn';
      default:
        return 'Waiting in queue';
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.colors.neutral[100] },
        ]}
      >
        <Ionicons
          name="people-outline"
          size={64}
          color={theme.colors.text.muted}
        />
      </View>
      <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
        Not in any queue
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.colors.text.secondary }]}>
        Find a shop and join their queue to skip the wait
      </Text>
      <Button
        onPress={() => router.push('/(tabs)/explore')}
        style={{ marginTop: 24 }}
        size="lg"
      >
        Find a Shop
      </Button>
    </View>
  );

  const renderQueueStatus = () => {
    if (!queueInfo) return null;

    const progressWidth = progressAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    });

    return (
      <View style={styles.queueStatusContainer}>
        {/* Position Card */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <LinearGradient
            colors={[getStatusColor(), theme.colors.primary[700]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.positionCard}
          >
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <View style={styles.positionCircle}>
              <Text style={styles.positionNumber}>
                {queueInfo.status === 'ready' ? '!' : queueInfo.position}
              </Text>
              {queueInfo.status !== 'ready' && (
                <Text style={styles.positionLabel}>in line</Text>
              )}
            </View>
            {queueInfo.status !== 'ready' && (
              <>
                <View style={styles.estimatedWait}>
                  <Ionicons name="time-outline" size={20} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.waitText}>
                    ~{queueInfo.estimatedWait} min wait
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[styles.progressFill, { width: progressWidth }]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {queueInfo.totalInQueue - queueInfo.position} ahead of you
                  </Text>
                </View>
              </>
            )}
            {queueInfo.status === 'ready' && (
              <Text style={styles.readyMessage}>
                Please head to the shop now!
              </Text>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Shop Info Card */}
        <TouchableOpacity
          style={[styles.shopCard, { backgroundColor: theme.colors.surface }]}
          onPress={handleViewShop}
          activeOpacity={0.8}
        >
          <View style={styles.shopHeader}>
            <View style={styles.shopIconContainer}>
              <Ionicons
                name="storefront-outline"
                size={24}
                color={theme.colors.text.muted}
              />
            </View>
            <View style={styles.shopInfo}>
              <Text
                style={[styles.shopName, { color: theme.colors.text.primary }]}
              >
                {queueInfo.shopName}
              </Text>
              <Text
                style={[styles.shopAddress, { color: theme.colors.text.secondary }]}
              >
                {queueInfo.shopAddress}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.text.muted}
            />
          </View>

          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />

          <View style={styles.barberSection}>
            <Avatar name={queueInfo.barberName} size={48} />
            <View style={styles.barberInfo}>
              <Text
                style={[styles.barberLabel, { color: theme.colors.text.muted }]}
              >
                Your Barber
              </Text>
              <Text
                style={[styles.barberName, { color: theme.colors.text.primary }]}
              >
                {queueInfo.barberName}
              </Text>
            </View>
            <Badge label="Assigned" variant="success" size="sm" />
          </View>
        </TouchableOpacity>

        {/* Services Card */}
        <View style={[styles.servicesCard, { backgroundColor: theme.colors.surface }]}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.text.primary }]}
          >
            Your Services
          </Text>
          {queueInfo.services.map((service, index) => (
            <View key={index} style={styles.serviceItem}>
              <Ionicons
                name="checkmark-circle"
                size={18}
                color={theme.colors.success[500]}
              />
              <Text
                style={[styles.serviceName, { color: theme.colors.text.secondary }]}
              >
                {service}
              </Text>
            </View>
          ))}
          <View
            style={[styles.divider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.servicesSummary}>
            <View style={styles.summaryItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={theme.colors.text.muted}
              />
              <Text
                style={[styles.summaryText, { color: theme.colors.text.secondary }]}
              >
                {queueInfo.serviceDuration} min
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color={theme.colors.text.muted}
              />
              <Text
                style={[styles.summaryText, { color: theme.colors.text.primary }]}
              >
                ${queueInfo.totalPrice}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={handleGetDirections}
          >
            <Ionicons
              name="navigate-outline"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.text.secondary },
              ]}
            >
              Directions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={handleContactShop}
          >
            <Ionicons
              name="call-outline"
              size={24}
              color={theme.colors.primary[500]}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.text.secondary },
              ]}
            >
              Call Shop
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: theme.colors.error[50] },
            ]}
            onPress={handleLeaveQueue}
          >
            <Ionicons
              name="exit-outline"
              size={24}
              color={theme.colors.error[500]}
            />
            <Text
              style={[
                styles.quickActionText,
                { color: theme.colors.error[500] },
              ]}
            >
              Leave Queue
            </Text>
          </TouchableOpacity>
        </View>

        {/* Join Time */}
        <Text style={[styles.joinedText, { color: theme.colors.text.muted }]}>
          Joined at {queueInfo.joinedAt}
        </Text>
      </View>
    );
  };

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
          My Queue
        </Text>
        {queueInfo && (
          <TouchableOpacity
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={20}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {queueInfo ? renderQueueStatus() : renderEmptyState()}

      {/* Leave Queue Modal */}
      <ConfirmModal
        visible={showLeaveModal}
        title="Leave Queue?"
        message="Are you sure you want to leave the queue? You will lose your current position."
        confirmLabel="Leave Queue"
        cancelLabel="Stay in Queue"
        confirmVariant="error"
        onConfirm={confirmLeaveQueue}
        onCancel={() => setShowLeaveModal(false)}
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
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 22,
  },
  queueStatusContainer: {
    flex: 1,
    padding: 20,
  },
  positionCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  positionCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  positionNumber: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
  },
  positionLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  estimatedWait: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  waitText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  readyMessage: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
  shopCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  shopHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shopIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  shopAddress: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  barberSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barberInfo: {
    flex: 1,
    marginLeft: 12,
  },
  barberLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  barberName: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },
  servicesCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  serviceName: {
    fontSize: 14,
  },
  servicesSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  joinedText: {
    textAlign: 'center',
    fontSize: 13,
  },
});

export default QueueScreen;
