import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity } from 'react-native';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Bell, Calendar, Percent } from 'lucide-react-native';

const NOTIFICATIONS = [
    { id: '1', type: 'booking', title: 'Booking Confirmed', message: 'Your cut with Fade Masters is set for tomorrow at 10:00 AM.', time: '2h ago', read: false },
    { id: '2', type: 'promo', title: '20% Off Promo', message: 'Get 20% off your next visit at Urban Cuts!', time: '1d ago', read: true },
    { id: '3', type: 'system', title: 'Welcome to FadeUp', message: 'Thanks for joining! Start by exploring top barbers.', time: '2d ago', read: true },
];

export default function NotificationsScreen() {
    const getIcon = (type: string) => {
        switch (type) {
            case 'booking': return <Calendar size={20} color={Colors.primary} />;
            case 'promo': return <Percent size={20} color={Colors.primary} />;
            default: return <Bell size={20} color={Colors.primary} />;
        }
    };

    const renderItem = ({ item }: { item: typeof NOTIFICATIONS[0] }) => (
        <TouchableOpacity style={[styles.item, !item.read && styles.unreadItem]}>
            <View style={styles.iconContainer}>
                {getIcon(item.type)}
            </View>
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <ThemedText variant="md" weight="bold">{item.title}</ThemedText>
                    <ThemedText variant="xs" color={Colors.textTertiary}>{item.time}</ThemedText>
                </View>
                <ThemedText variant="sm" color={Colors.textSecondary}>{item.message}</ThemedText>
            </View>
            {!item.read && <View style={styles.dot} />}
        </TouchableOpacity>
    );

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Updates</ThemedText>
            </View>
            <FlatList
                data={NOTIFICATIONS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    list: {
        paddingBottom: Spacing.xl,
    },
    item: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        marginBottom: 1,
    },
    unreadItem: {
        backgroundColor: Colors.surfaceLight,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(238, 186, 43, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    content: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.primary,
        marginLeft: Spacing.sm,
        alignSelf: 'center',
    }
});
