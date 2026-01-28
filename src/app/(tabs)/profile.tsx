import React from 'react';
import { StyleSheet, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { User, Settings, CreditCard, Bell, LogOut, ChevronRight, Shield, HelpCircle } from 'lucide-react-native';

const MENU_ITEMS = [
    { label: 'Edit Profile', icon: User, route: '/profile/edit' },
    { label: 'Payment Methods', icon: CreditCard, route: '/profile/payments' },
    { label: 'Notifications', icon: Bell, route: '/profile/notifications' },
    { label: 'Security', icon: Shield, route: '/profile/security' },
    { label: 'Help & Support', icon: HelpCircle, route: '/profile/support' },
];

export default function ProfileScreen() {
    const router = useRouter();

    const handleLogout = () => {
        router.replace('/(auth)/welcome');
    };

    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <ThemedText variant="xxl" weight="bold">Profile</ThemedText>
                    <TouchableOpacity>
                        <Settings size={24} color={Colors.text} />
                    </TouchableOpacity>
                </View>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200' }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <ThemedText variant="xl" weight="bold">Sarah Johnson</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>sarah.j@example.com</ThemedText>
                        <View style={styles.membershipBadge}>
                            <ThemedText variant="xs" color={Colors.black} weight="bold">GOLD MEMBER</ThemedText>
                        </View>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <ThemedText variant="xl" weight="bold" color={Colors.primary}>12</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Bookings</ThemedText>
                    </View>
                    <View style={styles.statLine} />
                    <View style={styles.statItem}>
                        <ThemedText variant="xl" weight="bold" color={Colors.primary}>4</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Reviews</ThemedText>
                    </View>
                    <View style={styles.statLine} />
                    <View style={styles.statItem}>
                        <ThemedText variant="xl" weight="bold" color={Colors.primary}>2</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Favorites</ThemedText>
                    </View>
                </View>

                {/* Menu */}
                <View style={styles.menuContainer}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.menuItem}>
                            <View style={styles.menuIcon}>
                                <item.icon size={20} color={Colors.text} />
                            </View>
                            <ThemedText variant="md" style={styles.menuLabel}>{item.label}</ThemedText>
                            <ChevronRight size={20} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <Button
                    label="Log Out"
                    variant="outline"
                    style={styles.logoutBtn}
                    onPress={handleLogout}
                    leftIcon={<LogOut size={20} color={Colors.primary} />}
                />

                <ThemedText variant="xs" color={Colors.textTertiary} centered style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}>
                    Version 1.0.0
                </ThemedText>

            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: Colors.primary,
    },
    profileInfo: {
        marginLeft: Spacing.lg,
    },
    membershipBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 8,
        alignSelf: 'flex-start',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: Colors.surface,
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.xl,
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
    },
    statLine: {
        width: 1,
        height: 24,
        backgroundColor: Colors.border,
    },
    menuContainer: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    menuIcon: {
        width: 32,
        alignItems: 'center',
    },
    menuLabel: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    logoutBtn: {
        marginHorizontal: Spacing.md,
    }
});
