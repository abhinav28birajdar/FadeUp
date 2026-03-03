import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthContext } from '../../context/AuthContext';
import { shopService } from '../../services/shop.service';
import { Search, Bell, Clock } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notification.store';
import { ShopCard } from '../../components/ui/ShopCard';
import { Card } from '../../components/ui/Card';
import { getGreeting } from '../../utils/dateHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { bookingService } from '../../services/booking.service';
import { Shop, ShopCategory, Booking } from '../../types/firestore.types';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthContext();
    const { unreadCount } = useNotificationStore();

    const [shops, setShops] = useState<Shop[]>([]);
    const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
    const categories: (ShopCategory | 'all')[] = ['all', 'haircut', 'beard', 'coloring', 'facial', 'kids'];

    const loadShops = useCallback(async () => {
        try {
            const data = await shopService.getApprovedShops();
            setShops(data);
        } catch {
            // network or permission error — silently handled
        }
    }, []);

    useEffect(() => {
        loadShops();

        if (user) {
            const unsub = bookingService.subscribeToCustomerBookings(user.uid, (data) => {
                const active = data.find(b => ['confirmed', 'in_progress'].includes(b.status));
                setActiveBooking(active || null);
            });
            return () => unsub();
        }
    }, [user, loadShops]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadShops();
        setRefreshing(false);
    };

    const filteredShops = selectedCategory === 'all'
        ? shops
        : shops.filter((s) => s.category.includes(selectedCategory as ShopCategory));

    const featuredShops = shops.slice(0, 5);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.headerText}>
                    <Text style={[Typography.body, { color: Colors.textSecondary }]}>{getGreeting()},</Text>
                    <Text style={[Typography.h2, { color: Colors.text }]}>{user?.displayName?.split(' ')[0]}</Text>
                </View>
                <TouchableOpacity style={styles.notificationBtn} onPress={() => router.push('/notifications')}>
                    <Bell size={24} color={Colors.text} />
                    {unreadCount > 0 && <View style={styles.badge} />}
                </TouchableOpacity>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                {activeBooking && (
                    <Card style={styles.activeBookingCard} onPress={() => router.push('/(tabs)/appointments')}>
                        <View style={styles.activeBookingHeader}>
                            <View style={styles.activeBadge}>
                                <View style={styles.activeDot} />
                                <Text style={styles.activeText}>Live Queue</Text>
                            </View>
                            <Text style={styles.positionText}>
                                {activeBooking.queuePosition ? `Pos: #${activeBooking.queuePosition}` : 'Next in line'}
                            </Text>
                        </View>
                        <View style={styles.activeBookingBody}>
                            <View style={{ flex: 1 }}>
                                <Text style={[Typography.h3, { color: Colors.text }]}>{activeBooking.shopName}</Text>
                                <Text style={[Typography.body, { color: Colors.textSecondary }]}>
                                    {activeBooking.serviceName} • {activeBooking.barberName}
                                </Text>
                            </View>
                            <View style={styles.timeContainer}>
                                <Clock size={16} color={Colors.primary} />
                                <Text style={[Typography.h4, { color: Colors.primary, marginLeft: 4 }]}>
                                    {activeBooking.status === 'in_progress' ? 'In Service' : 'Waiting'}
                                </Text>
                            </View>
                        </View>
                    </Card>
                )}

                <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/explore')} activeOpacity={0.8}>
                    <Search size={20} color={Colors.textMuted} style={styles.searchIcon} />
                    <Text style={[Typography.body, { color: Colors.textMuted }]}>Search for barbers, styles...</Text>
                </TouchableOpacity>

                <View style={styles.categoriesContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
                                onPress={() => setSelectedCategory(cat)}
                            >
                                <Text style={[Typography.bodySmall, { color: selectedCategory === cat ? Colors.black : Colors.text, textTransform: 'capitalize', fontWeight: '600' }]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={[Typography.h3, { color: Colors.text }]}>Featured</Text>
                        <TouchableOpacity onPress={() => router.push('/(tabs)/explore')}>
                            <Text style={[Typography.bodySmall, { color: Colors.primary }]}>See all</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={featuredShops}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => (
                            <ShopCard shop={item} layout="vertical" onPress={() => router.push(`/shop/${item.id}`)} />
                        )}
                        ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
                    />
                </View>

                <View style={[styles.section, { backgroundColor: 'rgba(200, 169, 110, 0.05)', paddingVertical: Spacing.xl }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[Typography.h3, { color: Colors.text }]}>New on FadeUp</Text>
                    </View>
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={shops.slice(0, 5)}
                        keyExtractor={(item) => `new-${item.id}`}
                        contentContainerStyle={styles.horizontalList}
                        renderItem={({ item }) => (
                            <ShopCard shop={item} layout="vertical" onPress={() => router.push(`/shop/${item.id}`)} />
                        )}
                        ItemSeparatorComponent={() => <View style={{ width: Spacing.md }} />}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[Typography.h3, styles.sectionTitle, { color: Colors.text }]}>Nearby Shops</Text>
                    {filteredShops.map((shop) => (
                        <View key={shop.id} style={{ marginBottom: Spacing.md }}>
                            <ShopCard shop={shop} layout="horizontal" onPress={() => router.push(`/shop/${shop.id}`)} />
                        </View>
                    ))}
                    {filteredShops.length === 0 && (
                        <Text style={[Typography.body, { color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl }]}>
                            No shops found in this category.
                        </Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.md,
    },
    headerText: {
        flex: 1,
    },
    notificationBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surfaceElevated,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 10,
        right: 12,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.error,
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        marginHorizontal: Spacing.xl,
        paddingHorizontal: Spacing.md,
        height: 50,
        borderRadius: Spacing.borderRadius.md,
        marginBottom: Spacing.lg,
    },
    searchIcon: {
        marginRight: Spacing.sm,
    },
    categoriesContainer: {
        marginBottom: Spacing.lg,
    },
    categoriesScroll: {
        paddingHorizontal: Spacing.xl,
        gap: Spacing.sm,
    },
    categoryChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: Spacing.borderRadius.full,
        borderWidth: 1,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    categoryChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    horizontalList: {
        paddingHorizontal: Spacing.xl,
    },
    activeBookingCard: {
        marginHorizontal: Spacing.xl,
        marginTop: Spacing.md,
        marginBottom: Spacing.lg,
        padding: Spacing.lg,
        backgroundColor: Colors.surface,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius: Spacing.borderRadius.lg,
    },
    activeBookingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(200, 169, 110, 0.1)',
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: 4,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.primary,
        marginRight: 6,
    },
    activeText: {
        fontSize: 10,
        fontWeight: '700',
        color: Colors.primary,
        textTransform: 'uppercase',
    },
    positionText: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textSecondary,
    },
    activeBookingBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        padding: Spacing.sm,
        borderRadius: 8,
    },
});