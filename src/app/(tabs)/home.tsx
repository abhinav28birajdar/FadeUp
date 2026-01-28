import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { MapPin, Bell, Search, Filter, Star, Clock, Heart } from 'lucide-react-native';

// Mock Data
const CATEGORIES = ['All', 'Haircut', 'Beard', 'Coloring', 'Facial'];
const NEARBY_SHOPS = [
    { id: '1', name: 'Fade Masters', rating: 4.8, reviews: 120, distance: '1.2 km', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500&auto=format&fit=crop&q=60', isOpen: true, waitTime: '15 min' },
    { id: '2', name: 'Urban Cuts', rating: 4.5, reviews: 85, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1503951914875-452162b7f304?w=500&auto=format&fit=crop&q=60', isOpen: true, waitTime: '30 min' },
    { id: '3', name: 'Elite Grooming', rating: 4.9, reviews: 200, distance: '3.0 km', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d6d4e84?w=500&auto=format&fit=crop&q=60', isOpen: false, waitTime: 'Closed' },
];

export default function HomeScreen() {
    const router = useRouter();
    const [activeCategory, setActiveCategory] = useState('All');

    const renderShopCard = ({ item }: { item: typeof NEARBY_SHOPS[0] }) => (
        <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => router.push(`/shop/${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <ThemedText variant="lg" weight="bold">{item.name}</ThemedText>
                    <View style={styles.ratingContainer}>
                        <Star size={14} color={Colors.primary} fill={Colors.primary} />
                        <ThemedText variant="sm" weight="medium" style={{ marginLeft: 4 }}>{item.rating}</ThemedText>
                    </View>
                </View>
                <ThemedText variant="sm" color={Colors.textSecondary} style={styles.address}>
                    {item.distance} • {item.reviews} reviews
                </ThemedText>

                <View style={styles.cardFooter}>
                    <View style={[styles.badge, item.isOpen ? styles.badgeOpen : styles.badgeClosed]}>
                        <ThemedText variant="xs" color={item.isOpen ? Colors.success : Colors.textTertiary} weight="medium">
                            {item.isOpen ? 'Open Now' : 'Closed'}
                        </ThemedText>
                    </View>
                    {item.isOpen && (
                        <View style={styles.waitTime}>
                            <Clock size={14} color={Colors.warning} />
                            <ThemedText variant="xs" color={Colors.warning} style={{ marginLeft: 4 }}>
                                ~{item.waitTime} wait
                            </ThemedText>
                        </View>
                    )}
                </View>
            </View>
            <TouchableOpacity style={styles.favButton}>
                <Heart size={20} color={Colors.white} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <Container>
            <View style={styles.header}>
                <View>
                    <ThemedText variant="xs" color={Colors.textSecondary}>Current Location</ThemedText>
                    <View style={styles.locationRow}>
                        <MapPin size={16} color={Colors.primary} />
                        <ThemedText variant="sm" weight="semibold" style={{ marginLeft: 4 }}>
                            New York, USA
                        </ThemedText>
                    </View>
                </View>
                <TouchableOpacity style={styles.bellButton}>
                    <Bell size={24} color={Colors.text} />
                    <View style={styles.notificationDot} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <Input
                        placeholder="Find a shop or barber..."
                        leftIcon={<Search size={20} color={Colors.textTertiary} />}
                        rightIcon={<Filter size={20} color={Colors.primary} />}
                        containerStyle={{ marginBottom: 0 }}
                    />
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                    {CATEGORIES.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[styles.categoryChip, activeCategory === cat && styles.categoryChipActive]}
                            onPress={() => setActiveCategory(cat)}
                        >
                            <ThemedText
                                variant="sm"
                                color={activeCategory === cat ? Colors.black : Colors.textSecondary}
                                weight={activeCategory === cat ? 'semibold' : 'regular'}
                            >
                                {cat}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Featured Section (Horizontal) */}
                <View style={styles.sectionHeader}>
                    <ThemedText variant="lg" weight="bold">Featured Shops</ThemedText>
                    <ThemedText variant="sm" color={Colors.primary}>See All</ThemedText>
                </View>
                <FlatList
                    horizontal
                    data={NEARBY_SHOPS} // Reusing for demo
                    renderItem={renderShopCard}
                    keyExtractor={(item) => `featured-${item.id}`}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.featuredList}
                />

                {/* Nearby Shops (Vertical) */}
                <View style={styles.sectionHeader}>
                    <ThemedText variant="lg" weight="bold">Nearby You</ThemedText>
                </View>
                <View style={styles.verticalList}>
                    {NEARBY_SHOPS.map((shop) => (
                        <View key={shop.id} style={{ marginBottom: Spacing.md }}>
                            {renderShopCard({ item: shop })}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    bellButton: {
        padding: 8,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.full,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: Colors.error,
        borderWidth: 1,
        borderColor: Colors.surface,
    },
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    searchContainer: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    categoriesContainer: {
        paddingLeft: Spacing.md,
        marginBottom: Spacing.lg,
    },
    categoryChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surface,
        marginRight: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryChipActive: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    featuredList: {
        paddingLeft: Spacing.md,
        paddingRight: Spacing.md, // Add right padding
        marginBottom: Spacing.lg,
    },
    verticalList: {
        paddingHorizontal: Spacing.md,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.xs,
        width: 280, // For horizontal
        marginRight: Spacing.md, // For horizontal gap
    },
    cardImage: {
        width: '100%',
        height: 140,
    },
    cardContent: {
        padding: Spacing.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    address: {
        marginBottom: Spacing.md,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    badgeOpen: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    badgeClosed: {
        backgroundColor: 'rgba(113, 113, 122, 0.1)',
    },
    waitTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    favButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 6,
        borderRadius: BorderRadius.full,
    },
});
