import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { adminService } from '../../services/admin.service';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { getGreeting } from '../../utils/dateHelpers';

export default function AdminDashboardScreen() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalUsers: 0, totalShops: 0, pendingApprovals: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const data = await adminService.getPlatformStats();
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title={getGreeting()} showBack={false} />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                <Text style={[Typography.h2, { color: Colors.text, marginBottom: Spacing.xl }]}>Admin Console</Text>

                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Total Users</Text>
                        <Text style={[Typography.h2, { color: Colors.text, marginVertical: Spacing.xs }]}>{stats.totalUsers}</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Total Shops</Text>
                        <Text style={[Typography.h2, { color: Colors.text, marginVertical: Spacing.xs }]}>{stats.totalShops}</Text>
                    </Card>
                    <Card style={styles.statCardBorder}>
                        <Text style={[Typography.caption, { color: Colors.textSecondary }]}>Pending Shops</Text>
                        <Text style={[Typography.h2, { color: Colors.warning, marginVertical: Spacing.xs }]}>{stats.pendingApprovals}</Text>
                    </Card>
                </View>

                <View style={styles.actions}>
                    <Button
                        label="Manage Shop Approvals"
                        onPress={() => router.push('/admin/shops')}
                        style={styles.actionBtn}
                    />
                    <Button
                        label="Manage Users"
                        variant="outline"
                        onPress={() => router.push('/admin/users')}
                        style={styles.actionBtn}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.xl },
    statCard: { flexBasis: '47%', padding: Spacing.md, backgroundColor: Colors.surfaceElevated },
    statCardBorder: { flexBasis: '47%', padding: Spacing.md, backgroundColor: Colors.surfaceElevated, borderColor: Colors.warning, borderWidth: 1 },
    actions: { marginTop: Spacing.xl },
    actionBtn: { marginBottom: Spacing.md },
});
