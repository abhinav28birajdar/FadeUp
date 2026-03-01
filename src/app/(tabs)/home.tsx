import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthContext } from '../../context/AuthContext';
import { Shop, ShopCategory } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { Search, Bell } from 'lucide-react-native';
import { useNotificationStore } from '../../store/notification.store';
import { Input } from '../../components/ui/Input';
import { ShopCard } from '../../components/ui/ShopCard';
import { getGreeting } from '../../utils/dateHelpers';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user } = useAuthContext();
    const { unreadCount } = useNotificationStore();

    const [shops, setShops] = useState<Shop[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | 'all'>('all');
    const categories: (ShopCategory | 'all')[] = ['all', 'haircut', 'beard', 'coloring', 'facial', 'kids'];

    const loadShops = useCallback(async () => {
        try {
            const data = await shopService.getApprovedShops();
            setShops(data);
        } catch (e) {
            console.error(e);
        }
    }, []);

    useEffect(() => {
        loadShops();
    }, [loadShops]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadShops();
        setRefreshing(false);
    };

    const filteredShops = selectedCategory === 'all'
        ? shops
        : shops.filter(s => s.category.includes(selectedCategory as ShopCategory));

    const featuredShops = shops.slice(0, 5); // Just mockup logic for featured

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
                    <Text style={[Typography.h3, styles.sectionTitle, { color: Colors.text }]}>Featured</Text>
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

                <View style={styles.section}>
                    <Text style={[Typography.h3, styles.sectionTitle, { color: Colors.text }]}>Nearby Shops</Text>
                    {filteredShops.map(shop => (
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
    sectionTitle: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.md,
    },
    horizontalList: {
        paddingHorizontal: Spacing.xl,
    },
});
