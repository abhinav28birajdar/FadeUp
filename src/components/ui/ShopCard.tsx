import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Shop } from '../../types/firestore.types';
import { StarRating } from './StarRating';
import { useFavoritesStore } from '../../store/favorites.store';
import { formatRating } from '../../utils/formatters';

interface ShopCardProps {
    shop: Shop;
    onPress: () => void;
    layout?: 'vertical' | 'horizontal';
}

export const ShopCard = React.memo(({ shop, onPress, layout = 'vertical' }: ShopCardProps) => {
    const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
    const isFav = isFavorite(shop.id);
    const isVertical = layout === 'vertical';

    const toggleFavorite = (e: any) => {
        e.stopPropagation();
        if (isFav) {
            removeFavorite(shop.id);
        } else {
            addFavorite(shop.id);
        }
    };

    const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <TouchableOpacity
            style={[styles.container, isVertical ? styles.vertical : styles.horizontal]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <View style={isVertical ? styles.imageContainerVertical : styles.imageContainerHorizontal}>
                <Image
                    source={{ uri: shop.photoURL || shop.coverPhotoURL || 'https://via.placeholder.com/300' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                {!shop.isOpen && (
                    <View style={styles.closedBadge}>
                        <Text style={[Typography.caption, { color: Colors.white, fontWeight: '700' }]}>CLOSED</Text>
                    </View>
                )}
                <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
                    <Heart size={20} color={isFav ? Colors.error : Colors.white} fill={isFav ? Colors.error : 'rgba(0,0,0,0.3)'} />
                </TouchableOpacity>
            </View>

            <View style={[styles.content, isVertical ? styles.contentVertical : styles.contentHorizontal]}>
                <View style={styles.header}>
                    <Text style={[Typography.h4, { color: Colors.text }]} numberOfLines={1}>{shop.name}</Text>
                    <View style={styles.ratingContainer}>
                        <StarRating rating={1} size={14} />
                        <Text style={[Typography.caption, { color: Colors.text, marginLeft: 4 }]}>
                            {formatRating(shop.rating)} ({shop.reviewCount})
                        </Text>
                    </View>
                </View>

                <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginBottom: Spacing.sm }]} numberOfLines={1}>
                    {shop.category.map(capitalize).join(' • ')}
                </Text>

                <View style={styles.footer}>
                    <MapPin size={14} color={Colors.textMuted} />
                    <Text style={[Typography.caption, { color: Colors.textMuted, marginLeft: 4 }]} numberOfLines={1}>
                        {shop.city} • {shop.address}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.surface,
        borderRadius: Spacing.borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    vertical: {
        width: 250,
    },
    horizontal: {
        flexDirection: 'row',
        width: '100%',
        height: 120,
    },
    imageContainerVertical: {
        width: '100%',
        height: 140,
        backgroundColor: Colors.surfaceElevated,
        position: 'relative',
    },
    imageContainerHorizontal: {
        width: 120,
        height: '100%',
        backgroundColor: Colors.surfaceElevated,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: Spacing.md,
    },
    contentVertical: {
        flex: 1,
    },
    contentHorizontal: {
        flex: 1,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    favoriteButton: {
        position: 'absolute',
        top: Spacing.sm,
        right: Spacing.sm,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: Spacing.xs,
    },
    closedBadge: {
        position: 'absolute',
        bottom: Spacing.sm,
        left: Spacing.sm,
        backgroundColor: Colors.error,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Spacing.borderRadius.sm,
    },
});
