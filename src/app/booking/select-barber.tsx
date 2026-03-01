import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { useBookingStore } from '../../store/booking.store';
import { shopService } from '../../services/shop.service';
import { Barber } from '../../types/firestore.types';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { BarberCard } from '../../components/ui/BarberCard';
import { Button } from '../../components/ui/Button';

export default function SelectBarberScreen() {
    const router = useRouter();
    const { selectedShop: shop, selectedBarber: barber, setSelectedBarber: setBarber } = useBookingStore();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (shop) {
            shopService.getShopBarbers(shop.id)
                .then(data => {
                    setBarbers(data);
                    setIsLoading(false);
                })
                .catch(() => setIsLoading(false));
        }
    }, [shop]);

    if (isLoading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={Colors.primary} /></View>;
    }

    return (
        <View style={styles.container}>
            <ScreenHeader title="Select Barber" />

            <FlatList
                data={barbers}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <BarberCard
                        barber={item}
                        isSelected={barber?.id === item.id}
                        onSelect={() => setBarber(item)}
                        layout="horizontal"
                    />
                )}
            />

            <View style={styles.footer}>
                <Button
                    label="Next step"
                    onPress={() => router.push('/booking/select-time')}
                    disabled={!barber}
                    fullWidth
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.xl },
    footer: { padding: Spacing.xl, backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border },
});
