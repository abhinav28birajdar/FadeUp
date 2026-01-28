


















































































import React from 'react';
import { StyleSheet, View, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { MoveLeft, Star, Clock, MapPin, Share2, Heart, CheckCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const SHOP_DATA = {
    id: '1',
    name: 'Fade Masters',
    image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800',
    rating: 4.8,
    reviews: 124,
    address: '123 Barber St, New York, NY',
    status: 'Open Now',
    services: [
        { id: '1', name: 'Classic Fade', price: '$35', duration: '45 min' },
        { id: '2', name: 'Beard Trim', price: '$20', duration: '20 min' },
        { id: '3', name: 'Hot Towel Shave', price: '$40', duration: '30 min' },
    ],
    barbers: [
        { id: '1', name: 'Mike', image: 'https://i.pravatar.cc/150?u=mike' },
        { id: '2', name: 'Dave', image: 'https://i.pravatar.cc/150?u=dave' },
    ]
};

export default function ShopDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <Container padding={false}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Hero Section */}
                <View style={styles.hero}>
                    <Image source={{ uri: SHOP_DATA.image }} style={styles.heroImage} />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        style={styles.heroGradient}
                    >
                        <View style={styles.heroHeader}>
                            <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
                                <MoveLeft size={24} color={Colors.white} />
                            </TouchableOpacity>
                            <View style={styles.heroActions}>
                                <TouchableOpacity style={styles.iconBtn}>
                                    <Share2 size={24} color={Colors.white} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.iconBtn}>
                                    <Heart size={24} color={Colors.white} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.shopInfo}>
                            <ThemedText variant="display" weight="bold" color={Colors.white}>{SHOP_DATA.name}</ThemedText>
                            <View style={styles.ratingRow}>
                                <Star size={16} color={Colors.primary} fill={Colors.primary} />
                                <ThemedText variant="sm" color={Colors.white} style={{ marginLeft: 4 }}>
                                    {SHOP_DATA.rating} ({SHOP_DATA.reviews} reviews)
                                </ThemedText>
                                <View style={styles.dot} />
                                <ThemedText variant="sm" color={Colors.success} weight="bold">{SHOP_DATA.status}</ThemedText>
                            </View>
                            <View style={styles.addressRow}>
                                <MapPin size={16} color={Colors.textTertiary} />
                                <ThemedText variant="sm" color={Colors.textTertiary} style={{ marginLeft: 4 }}>{SHOP_DATA.address}</ThemedText>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Services Section */}
                <View style={styles.section}>
                    <ThemedText variant="lg" weight="bold" style={styles.sectionTitle}>Services</ThemedText>
                    {SHOP_DATA.services.map((service) => (
                        <View key={service.id} style={styles.serviceCard}>
                            <View>
                                <ThemedText variant="md" weight="semibold">{service.name}</ThemedText>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                    <Clock size={14} color={Colors.textTertiary} />
                                    <ThemedText variant="xs" color={Colors.textTertiary} style={{ marginLeft: 4 }}>{service.duration}</ThemedText>
                                </View>
                            </View>
                            <View style={styles.priceTag}>
                                <ThemedText variant="md" weight="bold" color={Colors.black}>{service.price}</ThemedText>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Team Section */}
                <View style={styles.section}>
                    <ThemedText variant="lg" weight="bold" style={styles.sectionTitle}>Meet the Team</ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.md, paddingHorizontal: Spacing.md }}>
                        {SHOP_DATA.barbers.map((barber) => (
                            <View key={barber.id} style={styles.barberCard}>
                                <Image source={{ uri: barber.image }} style={styles.barberImage} />
                                <ThemedText variant="sm" weight="medium" centered style={{ marginTop: 8 }}>{barber.name}</ThemedText>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <BlurView intensity={80} tint="dark" style={styles.bottomBar}>
                <View style={{ flex: 1, marginRight: Spacing.md }}>
                    <ThemedText variant="xs" color={Colors.textSecondary}>Next Available</ThemedText>
                    <ThemedText variant="lg" weight="bold">10:00 AM</ThemedText>
                </View>
                <Button label="Book Appointment" style={{ flex: 2 }} />
            </BlurView>
        </Container>
    );
}

const styles = StyleSheet.create({
    hero: {
        height: 350,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    heroGradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '100%',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    heroHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: Spacing.xl,
    },
    iconBtn: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: BorderRadius.full,
        marginLeft: Spacing.sm,
    },
    heroActions: {
        flexDirection: 'row',
    },
    shopInfo: {
        marginBottom: Spacing.lg,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    dot: {
        width: 4,
        height: 4,
        backgroundColor: Colors.white,
        borderRadius: 2,
        marginHorizontal: 8,
        opacity: 0.6,
    },
    section: {
        padding: Spacing.md,
        marginTop: Spacing.md,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    serviceCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    priceTag: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
    },
    barberCard: {
        marginRight: Spacing.lg,
        alignItems: 'center',
    },
    barberImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: Spacing.md,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    }
});
