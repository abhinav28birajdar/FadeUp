import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../../components/ui/Container';
import { ThemedText } from '../../../components/ui/ThemedText';
import { ThemedView } from '../../../components/ui/ThemedView';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import {
    BarChart3,
    Wallet,
    Settings,
    Users,
    MessageSquare,
    ShieldCheck,
    HelpCircle,
    LogOut,
    ChevronRight,
    UserCircle,
    Bell
} from 'lucide-react-native';

const MENU_GROUPS = [
    {
        title: 'Business',
        items: [
            { label: 'Detailed Analytics', icon: BarChart3, color: '#3b82f6' },
            { label: 'Earnings & Payouts', icon: Wallet, color: '#10b981' },
            { label: 'Invoices & Tax', icon: ShieldCheck, color: '#8b5cf6' },
        ]
    },
    {
        title: 'Marketing',
        items: [
            { label: 'Customer Reviews', icon: MessageSquare, color: '#eeba2b' },
            { label: 'Promotional Offers', icon: UserCircle, color: '#f97316' },
            { label: 'Loyalty Program', icon: Users, color: '#ec4899' },
        ]
    },
    {
        title: 'System',
        items: [
            { label: 'Notification Settings', icon: Bell, color: '#64748b' },
            { label: 'App Settings', icon: Settings, color: '#64748b' },
            { label: 'Support Center', icon: HelpCircle, color: '#64748b' },
        ]
    }
];

export default function MoreScreen() {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/onboarding/welcome');
    };

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <ThemedText variant="xxl" weight="bold">More Options</ThemedText>
                </View>

                {/* User Quick Switch */}
                <ThemedView style={styles.switchCard}>
                    <View style={styles.switchInfo}>
                        <View style={styles.switchIcon}>
                            <Users size={24} color={Colors.primary} />
                        </View>
                        <View style={{ marginLeft: Spacing.md }}>
                            <ThemedText variant="md" weight="bold">Customer View</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>Switch to browse other shops</ThemedText>
                        </View>
                    </View>
                    <Button
                        label="Switch"
                        variant="secondary"
                        style={styles.switchBtn}
                        labelStyle={{ fontSize: 13 }}
                        onPress={() => router.replace('/(tabs)/home')}
                    />
                </ThemedView>

                {/* Menu Groups */}
                {MENU_GROUPS.map((group, groupIndex) => (
                    <View key={groupIndex} style={styles.group}>
                        <ThemedText variant="sm" weight="bold" color={Colors.textTertiary} style={styles.groupTitle}>
                            {group.title.toUpperCase()}
                        </ThemedText>
                        <View style={styles.groupContent}>
                            {group.items.map((item, itemIndex) => (
                                <TouchableOpacity key={itemIndex} style={styles.menuItem}>
                                    <View style={[styles.iconWrapper, { backgroundColor: `${item.color}15` }]}>
                                        <item.icon size={20} color={item.color} />
                                    </View>
                                    <ThemedText variant="md" style={styles.menuLabel}>{item.label}</ThemedText>
                                    <ChevronRight size={18} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <View style={styles.footer}>
                    <Button
                        label="Logout"
                        variant="outline"
                        style={styles.logoutBtn}
                        leftIcon={<LogOut size={20} color={Colors.error} />}
                        labelStyle={{ color: Colors.error }}
                        onPress={handleLogout}
                    />
                    <ThemedText variant="xs" color={Colors.textTertiary} centered style={{ marginTop: Spacing.xl }}>
                        FadeUp Business v1.0.0 (Production)
                    </ThemedText>
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
    },
    switchCard: {
        marginHorizontal: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xl,
    },
    switchInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    switchIcon: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    switchBtn: {
        minHeight: 36,
        paddingHorizontal: Spacing.lg,
        width: 'auto',
    },
    group: {
        marginBottom: Spacing.xl,
    },
    groupTitle: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.sm,
        letterSpacing: 1,
    },
    groupContent: {
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: Colors.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        marginLeft: Spacing.md,
        paddingLeft: 0,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuLabel: {
        flex: 1,
    },
    footer: {
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.lg,
    },
    logoutBtn: {
        borderColor: Colors.error,
    },
});
