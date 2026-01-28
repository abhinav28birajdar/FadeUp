import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Search, MapPin, Star } from 'lucide-react-native';

const EXPLORE_SHOPS = [
    { id: '1', name: 'Fade Masters', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=500', rating: 4.8, type: 'Barber' },
    { id: '2', name: 'Urban Cuts', image: 'https://images.unsplash.com/photo-1503951914875-452162b7f304?w=500', rating: 4.5, type: 'Salon' },
    { id: '3', name: 'Elite Grooming', image: 'https://images.unsplash.com/photo-1621605815971-fbc98d6d4e84?w=500', rating: 4.9, type: 'Barber' },
    { id: '4', name: 'The Gentleman', image: 'https://images.unsplash.com/photo-1599351431202-0e671379f80f?w=500', rating: 4.7, type: 'Stylist' },
];

export default function ExploreScreen() {
    const router = useRouter();
    const [search, setSearch] = useState('');

    const renderItem = ({ item }: { item: typeof EXPLORE_SHOPS[0] }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/shop/${item.id}`)}
        >
            <Image source={{ uri: item.image }} style={styles.image} />
            <View style={styles.cardContent}>
                <ThemedText variant="md" weight="bold">{item.name}</ThemedText>
                <View style={styles.row}>
                    <Star size={14} color={Colors.primary} fill={Colors.primary} />
                    <ThemedText variant="sm" style={{ marginLeft: 4 }}>{item.rating}</ThemedText>
                    <View style={styles.dot} />
                    <ThemedText variant="sm" color={Colors.textSecondary}>{item.type}</ThemedText>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Explore</ThemedText>
            </View>
            <View style={styles.searchContainer}>
                <Input
                    placeholder="Search barbers, styles..."
                    value={search}
                    onChangeText={setSearch}
                    leftIcon={<Search size={20} color={Colors.textTertiary} />}
                />
            </View>

            <FlatList
                data={EXPLORE_SHOPS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={styles.list}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        marginVertical: Spacing.md,
    },
    searchContainer: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.md,
    },
    list: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.xl,
    },
    card: {
        width: '48%',
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
        marginBottom: Spacing.md,
    },
    image: {
        width: '100%',
        height: 120,
    },
    cardContent: {
        padding: Spacing.sm,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: Colors.textTertiary,
        marginHorizontal: 6,
    }
});
