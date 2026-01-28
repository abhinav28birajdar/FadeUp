import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Container } from '../../../components/ui/Container';
import { ThemedText } from '../../../components/ui/ThemedText';
import { ThemedView } from '../../../components/ui/ThemedView';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import { Users, Calendar, DollarSign, Clock, ChevronRight, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const STATS = [
    { label: 'Today Visits', value: '12', icon: Users, color: '#3b82f6' },
    { label: 'Appointments', value: '8', icon: Calendar, color: '#10b981' },
    { label: 'Earnings', value: '$340', icon: DollarSign, color: '#eeba2b' },
    { label: 'In Queue', value: '4', icon: Clock, color: '#f59e0b' },
];

export default function DashboardScreen() {
    return (
        <Container>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Welcome back,</ThemedText>
                        <ThemedText variant="xxl" weight="bold">Elite Barber Shop</ThemedText>
                    </View>
                    <TouchableOpacity style={styles.profileButton}>
                        <ThemedView color={Colors.surfaceLight} style={styles.avatar}>
                            <Users size={20} color={Colors.primary} />
                        </ThemedView>
                    </TouchableOpacity>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {STATS.map((stat, index) => (
                        <ThemedView key={index} style={styles.statCard}>
                            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <ThemedText variant="xl" weight="bold" style={styles.statValue}>{stat.value}</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>{stat.label}</ThemedText>
                        </ThemedView>
                    ))}
                </View>

                {/* Live Queue Widget */}
                <ThemedView style={styles.queueWidget}>
                    <View style={styles.widgetHeader}>
                        <ThemedText variant="lg" weight="bold">Live Queue</ThemedText>
                        <TouchableOpacity>
                            <ThemedText variant="sm" color={Colors.primary}>Manage</ThemedText>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.queueInfo}>
                        <View style={styles.queueStatus}>
                            <ThemedText variant="display" weight="bold" color={Colors.primary}>4</ThemedText>
                            <ThemedText variant="sm" color={Colors.textSecondary}>People Waiting</ThemedText>
                        </View>
                        <View style={styles.queueDivider} />
                        <View style={styles.nextCustomer}>
                            <ThemedText variant="xs" color={Colors.textSecondary}>Next Up:</ThemedText>
                            <ThemedText variant="md" weight="semibold">Alex Thompson</ThemedText>
                            <ThemedText variant="xs" color={Colors.textTertiary}>Fade & Beard Trim</ThemedText>
                        </View>
                    </View>
                </ThemedView>

                {/* Upcoming Appointments */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText variant="lg" weight="bold">Today's Appointments</ThemedText>
                        <TouchableOpacity>
                            <ThemedText variant="sm" color={Colors.textSecondary}>View All</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {[1, 2, 3].map((item) => (
                        <TouchableOpacity key={item} style={styles.appointmentItem}>
                            <ThemedView color={Colors.surfaceLight} style={styles.timeLabel}>
                                <ThemedText variant="sm" weight="bold">10:30</ThemedText>
                                <ThemedText variant="xs" color={Colors.textTertiary}>AM</ThemedText>
                            </ThemedView>
                            <View style={styles.appointmentDetails}>
                                <ThemedText variant="md" weight="semibold">Mark Wilson</ThemedText>
                                <ThemedText variant="xs" color={Colors.textSecondary}>Classic Haircut • 30 min</ThemedText>
                            </View>
                            <ChevronRight size={18} color={Colors.textTertiary} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Performance Brief */}
                <ThemedView style={styles.performanceCard}>
                    <View style={styles.performanceInfo}>
                        <TrendingUp size={24} color={Colors.success} />
                        <View style={{ marginLeft: Spacing.md }}>
                            <ThemedText variant="md" weight="bold">Weekly Growth</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>You're doing 15% better than last week</ThemedText>
                        </View>
                    </View>
                </ThemedView>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        marginTop: Spacing.md,
        marginBottom: Spacing.xl,
    },
    profileButton: {
        padding: 2,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    statCard: {
        width: (width - Spacing.md * 3) / 2,
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        marginBottom: 2,
    },
    queueWidget: {
        marginHorizontal: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: Spacing.xl,
    },
    widgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    queueInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    queueStatus: {
        alignItems: 'center',
        width: 100,
    },
    queueDivider: {
        width: 1,
        height: 40,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.xl,
    },
    nextCustomer: {
        flex: 1,
    },
    section: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    appointmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    timeLabel: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 6,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        minWidth: 50,
    },
    appointmentDetails: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    performanceCard: {
        marginHorizontal: Spacing.md,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(16, 185, 129, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.1)',
    },
    performanceInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
