import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Service, ShopCategory } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Trash2, Edit2 } from 'lucide-react-native';

export default function ServicesScreen() {
    const { user } = useAuthContext();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState<ShopCategory>('haircut');

    useEffect(() => {
        if (!user) return;
        loadServices();
    }, [user]);

    const loadServices = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // Barber might own a shop or be part of one. 
            // For now, assuming barberId = shopId for simplicity or we need to find the shop.
            // Let's try to find a shop where ownerId = user.uid
            const shops = await shopService.getApprovedShops();
            const myShop = shops.find(s => s.ownerId === user.uid);
            if (myShop) {
                const data = await shopService.getShopServices(myShop.id);
                setServices(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        if (!name || !price || !duration) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        try {
            const shops = await shopService.getApprovedShops();
            const myShop = shops.find(s => s.ownerId === user.uid);
            if (!myShop) return;

            const serviceData = {
                shopId: myShop.id,
                name,
                price: parseFloat(price),
                durationMinutes: parseInt(duration),
                category,
                description: '',
                isActive: true,
            };

            if (editingService) {
                await shopService.updateService(editingService.id, serviceData);
            } else {
                await shopService.addService(serviceData);
            }

            setModalVisible(false);
            resetForm();
            loadServices();
        } catch (error) {
            Alert.alert('Error', 'Failed to save service');
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setDuration('');
        setCategory('haircut');
        setEditingService(null);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setName(service.name);
        setPrice(service.price.toString());
        setDuration(service.durationMinutes.toString());
        setCategory(service.category);
        setModalVisible(true);
    };

    const handleDelete = async (id: string) => {
        Alert.alert('Delete Service', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await shopService.toggleService(id, false);
                    loadServices();
                },
            },
        ]);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Services & Pricing" />

            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <Card style={styles.serviceCard}>
                        <View style={{ flex: 1 }}>
                            <Text style={Typography.h4}>{item.name}</Text>
                            <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>
                                {item.durationMinutes} min • {item.category}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: Spacing.sm }}>
                            <Text style={[Typography.h3, { color: Colors.primary }]}>₹{item.price}</Text>
                            <View style={{ flexDirection: 'row', gap: Spacing.md }}>
                                <TouchableOpacity onPress={() => handleEdit(item)}>
                                    <Edit2 size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                                    <Trash2 size={20} color={Colors.error} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Card>
                )}
                ListEmptyComponent={() => (
                    <View style={styles.empty}>
                        <Text style={[Typography.body, { color: Colors.textMuted }]}>No services added yet.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    resetForm();
                    setModalVisible(true);
                }}
            >
                <Plus size={24} color={Colors.black} />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={[Typography.h3, { marginBottom: Spacing.xl }]}>
                            {editingService ? 'Edit Service' : 'Add New Service'}
                        </Text>

                        <ScrollView>
                            <Text style={styles.label}>Service Name</Text>
                            <Input value={name} onChangeText={setName} placeholder="e.g. Classic Haircut" />

                            <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Price (₹)</Text>
                                    <Input
                                        value={price}
                                        onChangeText={setPrice}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Duration (min)</Text>
                                    <Input
                                        value={duration}
                                        onChangeText={setDuration}
                                        placeholder="30"
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            <Text style={[styles.label, { marginTop: Spacing.md }]}>Category</Text>
                            <View style={styles.categoryGrid}>
                                {(['haircut', 'beard', 'coloring', 'facial', 'kids'] as ShopCategory[]).map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                                        onPress={() => setCategory(cat)}
                                    >
                                        <Text style={{ color: category === cat ? Colors.black : Colors.text, textTransform: 'capitalize' }}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <Button label="Cancel" variant="ghost" onPress={() => setModalVisible(false)} style={{ flex: 1 }} />
                            <Button label="Save Service" onPress={handleSave} style={{ flex: 2 }} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.xl },
    serviceCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, marginBottom: Spacing.md },
    fab: {
        position: 'absolute',
        right: Spacing.xl,
        bottom: Spacing.xl,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: Spacing.xl,
        maxHeight: '80%',
    },
    label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.xl },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    categoryChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
    modalFooter: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
    empty: { padding: Spacing.xxl, alignItems: 'center' },
});
