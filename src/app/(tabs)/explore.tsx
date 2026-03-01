import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Shop } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { ShopCard } from '../../components/ui/ShopCard';
import { Input } from '../../components/ui/Input';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { useDebounce } from '../../hooks/useDebounce';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/ui/EmptyState';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { Button } from '../../components/ui/Button';

export default function ExploreScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const fetchShops = useCallback(async () => {
        setIsLoading(true);
        try {
            if (debouncedQuery) {
                const results = await shopService.searchShops(debouncedQuery);
                setShops(results);
            } else {
                const results = await shopService.getApprovedShops();
                setShops(results);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedQuery]);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={[Typography.h2, { color: Colors.text, marginBottom: Spacing.md }]}>Explore</Text>
                <View style={styles.searchRow}>
                    <Input
                        placeholder="Search shops or barbers..."
                        value={query}
                        onChangeText={setQuery}
                        leftIcon={<Search size={20} color={Colors.textMuted} />}
                        containerStyle={{ flex: 1, marginBottom: 0 }}
                    />
                    <TouchableOpacity
                        style={styles.filterBtn}
                        onPress={() => { Keyboard.dismiss(); setShowFilters(true); }}
                    >
                        <SlidersHorizontal size={24} color={Colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={shops}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <View style={{ marginBottom: Spacing.md }}>
                        <ShopCard shop={item} layout="horizontal" onPress={() => router.push(`/shop/${item.id}`)} />
                    </View>
                )}
                ListEmptyComponent={() => (
                    !isLoading ? (
                        <EmptyState
                            icon={<Search size={32} color={Colors.textMuted} />}
                            title="No results found"
                            description="Try adjusting your search query or filters."
                        />
                    ) : null
                )}
            />

            <BottomSheet isVisible={showFilters} onClose={() => setShowFilters(false)} height={400}>
                <View style={styles.filterContent}>
                    <Text style={[Typography.h2, { color: Colors.text, marginBottom: Spacing.xl }]}>Filters</Text>
                    <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.md }]}>
                        Advanced filtering logic would go here (e.g., Category toggles, rating sliders).
                    </Text>
                    <Button label="Apply Filters" onPress={() => setShowFilters(false)} style={{ marginTop: 'auto' }} />
                </View>
            </BottomSheet>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    filterBtn: {
        height: 48,
        width: 48,
        backgroundColor: Colors.surfaceElevated,
        borderRadius: Spacing.borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: Spacing.xl,
    },
    filterContent: {
        flex: 1,
        padding: Spacing.xl,
    },
});
