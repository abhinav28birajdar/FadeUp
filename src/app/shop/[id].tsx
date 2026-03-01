import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Shop, Service, Barber } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { StarRating } from '../../components/ui/StarRating';
import { formatRating } from '../../utils/formatters';
import { MapPin, Phone, Clock, Share2, Heart, ShieldCheck } from 'lucide-react-native';
import { useFavoritesStore } from '../../store/favorites.store';
import { useBookingStore } from '../../store/booking.store';
import { ServiceCard } from '../../components/ui/ServiceCard';
import { BarberCard } from '../../components/ui/BarberCard';
import { chatService } from '../../services/chat.service';
import { useAuthContext } from '../../context/AuthContext';
import { useToastStore } from '../../components/ui/Toast';

export default function ShopDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const shopId = id as string;
    const { user } = useAuthContext();
    const { isFavorite, addFavorite, removeFavorite } = useFavoritesStore();
    const { setSelectedShop, resetBooking } = useBookingStore();
    const { showToast } = useToastStore();

    const [shop, setShopData] = useState<Shop | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const isFav = isFavorite(shopId);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                const [shopData, shopServices, shopBarbers] = await Promise.all([
                    shopService.getShopById(shopId),
                    shopService.getShopServices(shopId),
                    shopService.getShopBarbers(shopId)
                ]);

                if (shopData) {
                    setShopData(shopData);
                    setServices(shopServices);
                    setBarbers(shopBarbers);
                }
            } catch (e) {
                console.error('Error fetching shop details:', e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShopData();
    }, [shopId]);

    const toggleFavorite = () => {
        if (isFav) removeFavorite(shopId);
        else addFavorite(shopId);
    };

    const startBooking = () => {
        if (shop) {
            resetBooking();
            setSelectedShop(shop);
            router.push('/booking/select-service');
        }
    };

    const startChat = async () => {
        if (!user || !shop) return;
        try {
            // Find or create a chat room between user and shop owner
            const roomId = await chatService.getOrCreateChatRoom(
                user.uid,
                shop.id,
                shop.ownerId,
                shop.name || 'Shop',
                shop.photoURL || null,
                user.displayName || 'Customer',
                user.photoURL || null
            );
            router.push(`/chat/${roomId}`);
        } catch (e) {
            showToast({ message: 'Failed to start chat', type: 'error' });
        }
    };

    if (!shop && !isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ScreenHeader title="" />
                <Text style={[Typography.h3, { color: Colors.text }]}>Shop not found</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {shop?.coverPhotoURL || shop?.photoURL ? (
                    <Image source={{ uri: shop.coverPhotoURL || shop.photoURL || '' }} style={styles.coverImage} />
                ) : (
                    <View style={[styles.coverImage, { backgroundColor: Colors.surfaceElevated }]} />
                )}

                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
                        <ScreenHeader title="" transparent />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', position: 'absolute', top: 50, right: Spacing.md, gap: Spacing.md }}>
                        <TouchableOpacity style={styles.iconButton} onPress={toggleFavorite}>
                            <Heart size={20} color={isFav ? Colors.error : Colors.white} fill={isFav ? Colors.error : 'rgba(0,0,0,0.3)'} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton}>
                            <Share2 size={20} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.content}>
                    <View style={styles.titleRow}>
                        <Text style={[Typography.h1, { color: Colors.text, flex: 1 }]} numberOfLines={2}>{shop?.name}</Text>
                        {shop?.isApproved && <ShieldCheck size={24} color={Colors.primary} />}
                    </View>

                    <View style={styles.ratingRow}>
                        <StarRating rating={1} size={16} />
                        <Text style={[Typography.body, { color: Colors.text, marginLeft: Spacing.xs }]}>
                            {formatRating(shop?.rating || 0)}
                        </Text>
                        <Text style={[Typography.body, { color: Colors.textMuted, marginLeft: 4 }]}>
                            ({shop?.reviewCount || 0} reviews)
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <MapPin size={16} color={Colors.textMuted} />
                        <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginLeft: Spacing.sm, flex: 1 }]}>
                            {shop?.address}, {shop?.city}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock size={16} color={Colors.textMuted} />
                        <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginLeft: Spacing.sm }]}>
                            {shop?.isOpen ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Phone size={16} color={Colors.textMuted} />
                        <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginLeft: Spacing.sm }]}>
                            {shop?.phone}
                        </Text>
                    </View>

                    <View style={styles.buttonRow}>
                        <Button label="Message Shop" variant="outline" onPress={startChat} style={{ flex: 1, marginRight: Spacing.sm }} />
                        <Button label="Book Now" onPress={startBooking} style={{ flex: 1 }} />
                    </View>

                    <Text style={[Typography.h3, styles.sectionTitle]}>About</Text>
                    <Text style={[Typography.body, { color: Colors.textSecondary, lineHeight: 22 }]}>
                        {shop?.description || 'No description available for this shop.'}
                    </Text>

                    {barbers.length > 0 && (
                        <>
                            <Text style={[Typography.h3, styles.sectionTitle, { marginTop: Spacing.xl }]}>Barbers</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: Spacing.md }}>
                                {barbers.map(barber => (
                                    <BarberCard key={barber.id} barber={barber} layout="vertical" />
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {services.length > 0 && (
                        <>
                            <Text style={[Typography.h3, styles.sectionTitle, { marginTop: Spacing.xl }]}>Services</Text>
                            {services.map(service => (
                                <ServiceCard key={service.id} service={service} />
                            ))}
                        </>
                    )}
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Book Appointment" onPress={startBooking} fullWidth disabled={!shop?.isOpen} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    coverImage: { width: '100%', height: 250 },
    headerButtons: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between' },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
    content: { padding: Spacing.xl, paddingTop: Spacing.md },
    titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xs },
    ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm },
    buttonRow: { flexDirection: 'row', marginTop: Spacing.md, marginBottom: Spacing.xl },
    sectionTitle: { color: Colors.text, marginBottom: Spacing.md },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.xl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
