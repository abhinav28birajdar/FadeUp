import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Container } from '../../../components/ui/Container';
import { ThemedText } from '../../../components/ui/ThemedText';
import { ThemedView } from '../../../components/ui/ThemedView';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import { Users, Play, X, UserMinus, Phone, MoreVertical } from 'lucide-react-native';

const MOCK_QUEUE = [
    { id: '1', name: 'Alex Thompson', service: 'Fade & Beard Trim', timeJoined: '10:15 AM', status: 'Waiting' },
    { id: '2', name: 'James Rodri', service: 'Classic Haircut', timeJoined: '10:22 AM', status: 'Waiting' },
    { id: '3', name: 'Kevin Durant', service: 'Buzz Cut', timeJoined: '10:35 AM', status: 'Waiting' },
    { id: '4', name: 'Chris Pratt', service: 'Styling', timeJoined: '10:40 AM', status: 'Waiting' },
];

export default function QueueManagementScreen() {
    const [isAccepting, setIsAccepting] = useState(true);

    const renderQueueItem = ({ item, index }: { item: typeof MOCK_QUEUE[0], index: number }) => (
        <ThemedView style={styles.queueItem}>
            <View style={styles.itemHeader}>
                <View style={styles.rankBadge}>
                    <ThemedText variant="sm" weight="bold" color={Colors.black}>{index + 1}</ThemedText>
                </View>
                <View style={styles.customerInfo}>
                    <ThemedText variant="md" weight="bold">{item.name}</ThemedText>
                    <ThemedText variant="xs" color={Colors.textSecondary}>{item.service}</ThemedText>
                </View>
                <View style={styles.timeInfo}>
                    <ThemedText variant="xs" color={Colors.textTertiary}>{item.timeJoined}</ThemedText>
                </View>
            </View>

            <View style={styles.itemActions}>
                <Button
                    label="Start"
                    variant="primary"
                    style={styles.actionBtn}
                    labelStyle={{ color: Colors.black, fontSize: 13 }}
                    leftIcon={<Play size={16} color={Colors.black} />}
                />
                <Button
                    label="No Show"
                    variant="secondary"
                    style={styles.actionBtn}
                    labelStyle={{ fontSize: 13 }}
                    leftIcon={<UserMinus size={16} color={Colors.textSecondary} />}
                />
                <TouchableOpacity style={styles.moreBtn}>
                    <MoreVertical size={20} color={Colors.textTertiary} />
                </TouchableOpacity>
            </View>
        </ThemedView>
    );

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Queue Manager</ThemedText>
                <View style={styles.toggleContainer}>
                    <ThemedText variant="xs" color={Colors.textSecondary} style={{ marginRight: Spacing.sm }}>
                        {isAccepting ? 'Accepting Customers' : 'Queue Paused'}
                    </ThemedText>
                    <TouchableOpacity
                        onPress={() => setIsAccepting(!isAccepting)}
                        style={[styles.toggle, isAccepting ? styles.toggleOn : styles.toggleOff]}
                    >
                        <View style={[styles.toggleThumb, isAccepting ? styles.thumbOn : styles.thumbOff]} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsRow}>
                <ThemedView style={styles.miniStat}>
                    <ThemedText variant="lg" weight="bold">{MOCK_QUEUE.length}</ThemedText>
                    <ThemedText variant="xs" color={Colors.textSecondary}>In Queue</ThemedText>
                </ThemedView>
                <ThemedView style={styles.miniStat}>
                    <ThemedText variant="lg" weight="bold">~45</ThemedText>
                    <ThemedText variant="xs" color={Colors.textSecondary}>Wait (min)</ThemedText>
                </ThemedView>
                <ThemedView style={styles.miniStat}>
                    <ThemedText variant="lg" weight="bold">12</ThemedText>
                    <ThemedText variant="xs" color={Colors.textSecondary}>Served Today</ThemedText>
                </ThemedView>
            </View>

            <FlatList
                data={MOCK_QUEUE}
                renderItem={renderQueueItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                    <ThemedText variant="md" weight="semibold" style={styles.listHeader}>Current List</ThemedText>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Users size={48} color={Colors.surfaceLight} />
                        <ThemedText variant="md" color={Colors.textSecondary} style={{ marginTop: Spacing.md }}>
                            Queue is currently empty
                        </ThemedText>
                    </View>
                }
            />

            <View style={styles.footer}>
                <Button label="Add Walk-in Customer" />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toggle: {
        width: 44,
        height: 24,
        borderRadius: 12,
        padding: 2,
    },
    toggleOn: {
        backgroundColor: Colors.primary,
    },
    toggleOff: {
        backgroundColor: Colors.surfaceLight,
    },
    toggleThumb: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: Colors.white,
    },
    thumbOn: {
        alignSelf: 'flex-end',
    },
    thumbOff: {
        alignSelf: 'flex-start',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    miniStat: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: 100,
    },
    listHeader: {
        marginBottom: Spacing.md,
    },
    queueItem: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 6,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    customerInfo: {
        flex: 1,
    },
    timeInfo: {
        alignItems: 'flex-end',
    },
    itemActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 8,
        minHeight: 40,
    },
    moreBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.surfaceLight,
        borderRadius: BorderRadius.md,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: Spacing.xxl,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.md,
        backgroundColor: 'transparent',
    },
});
