import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Shop } from '../../types/firestore.types';
import { adminService } from '../../services/admin.service';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Store } from 'lucide-react-native';
import { useToastStore } from '../../components/ui/Toast';

export default function AdminShopsScreen() {
    const { showToast } = useToastStore();
    const [shops, setShops] = useState<Shop[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchPendingShops = async () => {
        try {
            setIsLoading(true);
            const data = await adminService.getPendingShops();
            setShops(data);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingShops();
    }, []);

    const handleApprove = async (shopId: string) => {
        try {
            await adminService.approveShop(shopId);
            showToast({ message: 'Shop approved successfully', type: 'success' });
            fetchPendingShops();
        } catch (e) {
            showToast({ message: 'Failed to approve shop', type: 'error' });
        }
    };

    const renderItem = ({ item }: { item: Shop }) => (
        <View style={styles.shopItem}>
            <View style={{ flex: 1, marginRight: Spacing.md }}>
                <Text style={[Typography.h4, { color: Colors.text }]}>{item.name}</Text>
                <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]}>{item.city} • {item.phone}</Text>
            </View>
            <View style={styles.actions}>
                <Button label="Approve" size="sm" onPress={() => handleApprove(item.id)} />
                <Button label="Reject" variant="outline" size="sm" style={{ marginLeft: Spacing.sm }} />
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ScreenHeader title="Shop Approvals" />

            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={Colors.primary} /></View>
            ) : (
                <FlatList
                    data={shops}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={renderItem}
                    ListEmptyComponent={<EmptyState icon={<Store size={32} color={Colors.textMuted} />} title="No Pending Approvals" description="There are currently no shops waiting for approval." />}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.xl, flexGrow: 1 },
    shopItem: { backgroundColor: Colors.surface, padding: Spacing.md, borderRadius: Spacing.borderRadius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.md },
    actions: { flexDirection: 'row', marginTop: Spacing.md, justifyContent: 'flex-end', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.md },
});
