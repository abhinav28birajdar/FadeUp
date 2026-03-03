import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Shop } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../components/ui/Toast';

export default function ShopDetailsScreen() {
    const { user } = useAuthContext();
    const { showToast } = useToastStore();
    const [shop, setShop] = useState<Shop | null>(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (!user) return;
        loadShop();
    }, [user]);

    const loadShop = async () => {
        try {
            const shops = await shopService.getApprovedShops();
            const myShop = shops.find(s => s.ownerId === user?.uid);
            if (myShop) {
                setShop(myShop);
                setName(myShop.name);
                setDescription(myShop.description);
                setAddress(myShop.address);
                setPhone(myShop.phone);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async () => {
        if (!shop) return;
        try {
            await shopService.updateShop(shop.id, {
                name,
                description,
                address,
                phone,
            });
            showToast({ message: 'Shop details updated', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to update shop details', type: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!shop) return;
        Alert.alert(
            'Delete Shop',
            'Are you sure you want to delete this shop? This action is permanent.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await shopService.deleteShop(shop.id);
                            showToast({ message: 'Shop deleted successfully', type: 'info' });
                            // In real app, might need to update user profile to remove shopId if it exists
                            // For now, reload or logout
                        } catch (e) {
                            showToast({ message: 'Failed to delete shop', type: 'error' });
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Shop Details" />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.label}>Business Name</Text>
                <Input value={name} onChangeText={setName} placeholder="e.g. FadeUp Barbershop" />

                <Text style={[styles.label, { marginTop: Spacing.md }]}>Description</Text>
                <Input
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Tell clients about your shop..."
                    multiline
                    numberOfLines={4}
                    style={{ height: 100, textAlignVertical: 'top' }}
                />

                <Text style={[styles.label, { marginTop: Spacing.md }]}>Address</Text>
                <Input value={address} onChangeText={setAddress} placeholder="Street address, city" />

                <Text style={[styles.label, { marginTop: Spacing.md }]}>Business Phone</Text>
                <Input value={phone} onChangeText={setPhone} placeholder="+1..." keyboardType="phone-pad" />

                <TouchableOpacity
                    onPress={handleDelete}
                    style={{ marginTop: Spacing.xxl, padding: Spacing.md, alignItems: 'center' }}
                >
                    <Text style={[Typography.body, { color: Colors.error }]}>Delete Shop</Text>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Save Changes" onPress={handleSave} fullWidth />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
    footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
});
