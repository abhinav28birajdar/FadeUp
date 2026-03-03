import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Colors } from '../constants/colors';
import { Spacing } from '../constants/spacing';
import { Notification } from '../types/firestore.types';
import { notificationService } from '../services/notification.service';
import { useAuthContext } from '../context/AuthContext';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { NotificationItem } from '../components/ui/NotificationItem';
import { EmptyState } from '../components/ui/EmptyState';
import { Bell } from 'lucide-react-native';
import { useNotificationStore } from '../store/notification.store';

export default function NotificationsScreen() {
    const { user } = useAuthContext();
    const { setNotifications } = useNotificationStore();

    const [notifications, setLocalNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsub = notificationService.subscribeToNotifications(user.uid, (data) => {
            setLocalNotifications(data);
            setNotifications(data); // sync global store for badge count
            setIsLoading(false);
        });
        return () => unsub();
    }, [user?.uid, setNotifications]);

    const handleRead = useCallback(async (notification: Notification) => {
        if (!user || notification.isRead) return;
        try {
            await notificationService.markAsRead(user.uid, notification.id!);
        } catch { /* silently ignore */ }
    }, [user]);

    return (
        <View style={styles.container}>
            <ScreenHeader title="Notifications" />

            <FlatList
                data={notifications}
                keyExtractor={(item) => item.id!}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <NotificationItem
                        notification={item}
                        onPress={() => handleRead(item)}
                    />
                )}
                ListEmptyComponent={() => (
                    !isLoading ? (
                        <EmptyState
                            icon={<Bell size={48} color={Colors.textMuted} />}
                            title="No notifications"
                            description="You're all caught up for now."
                        />
                    ) : null
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { flexGrow: 1, paddingBottom: Spacing.xl },
});
