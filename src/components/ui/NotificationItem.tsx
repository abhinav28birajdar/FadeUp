import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Notification } from '../../types/firestore.types';
import { Bell, CalendarCheck, Clock, Tag, Info } from 'lucide-react-native';
import { formatDate, formatTime } from '../../utils/dateHelpers';

interface NotificationItemProps {
    notification: Notification;
    onPress: () => void;
}

export const NotificationItem = React.memo(({ notification, onPress }: NotificationItemProps) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'booking_confirmed': return <CalendarCheck size={24} color={Colors.success} />;
            case 'booking_reminder': return <Clock size={24} color={Colors.warning} />;
            case 'queue_update': return <Bell size={24} color={Colors.primary} />;
            case 'promotion': return <Tag size={24} color={Colors.info} />;
            case 'system': return <Info size={24} color={Colors.textSecondary} />;
            default: return <Bell size={24} color={Colors.primary} />;
        }
    };

    return (
        <TouchableOpacity
            style={[styles.container, !notification.isRead && styles.unreadContainer]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                {getIcon()}
                {!notification.isRead && <View style={styles.unreadDot} />}
            </View>

            <View style={styles.content}>
                <Text style={[Typography.h4, { color: Colors.text, marginBottom: 2 }]}>
                    {notification.title}
                </Text>
                <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: 4 }]} numberOfLines={2}>
                    {notification.body}
                </Text>
                <Text style={[Typography.caption, { color: Colors.textMuted }]}>
                    {formatDate(notification.createdAt)} at {formatTime(notification.createdAt)}
                </Text>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    unreadContainer: {
        backgroundColor: Colors.surfaceElevated,
    },
    iconContainer: {
        position: 'relative',
        marginRight: Spacing.md,
        paddingTop: 4,
    },
    unreadDot: {
        position: 'absolute',
        top: 0,
        right: -4,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
        borderWidth: 2,
        borderColor: Colors.surfaceElevated,
    },
    content: {
        flex: 1,
    },
});
