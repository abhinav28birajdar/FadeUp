import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { useAuthContext } from '../../context/AuthContext';
import { CreditCard, Wallet as WalletIcon, Plus, History, Gift, Shield, ChevronRight, Share2 } from 'lucide-react-native';

export default function CustomerWalletScreen() {
    const { user } = useAuthContext();
    const [balance, setBalance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="My Wallet" />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
                showsVerticalScrollIndicator={false}
            >
                <Card style={styles.balanceCard}>
                    <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }]}>AVAILABLE BALANCE</Text>
                    <Text style={[Typography.h1, { color: Colors.white, fontSize: 36, marginVertical: Spacing.sm }]}>
                        {formatCurrency(balance)}
                    </Text>
                    <View style={styles.cardFooter}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Shield size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)', marginLeft: 4 }]}>Secure Payments</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(200, 169, 110, 0.1)' }]}>
                            <Plus size={24} color={Colors.primary} />
                        </View>
                        <Text style={[Typography.label, { marginTop: Spacing.xs }]}>Add Funds</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                            <Gift size={24} color={Colors.textSecondary} />
                        </View>
                        <Text style={[Typography.label, { marginTop: Spacing.xs }]}>Redeem</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                            <Share2 size={24} color={Colors.textSecondary} />
                        </View>
                        <Text style={[Typography.label, { marginTop: Spacing.xs }]}>Refer</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[Typography.h3, styles.sectionTitle]}>Payment Methods</Text>
                    <Card style={styles.menuCard}>
                        <TouchableOpacity style={styles.menuItem}>
                            <CreditCard size={20} color={Colors.textSecondary} />
                            <Text style={[Typography.body, styles.menuText]}>Saved Cards</Text>
                            <ChevronRight size={18} color={Colors.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]}>
                            <Plus size={20} color={Colors.primary} />
                            <Text style={[Typography.body, styles.menuText, { color: Colors.primary }]}>Add New Method</Text>
                        </TouchableOpacity>
                    </Card>
                </View>

                <View style={styles.section}>
                    <Text style={[Typography.h3, styles.sectionTitle]}>Rewards & Offers</Text>
                    <TouchableOpacity style={styles.promoBanner}>
                        <View style={styles.promoIcon}>
                            <Gift size={24} color={Colors.white} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[Typography.h4, { color: Colors.white }]}>Refer a Friend</Text>
                            <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.8)' }]}>Get ₹100 for every referral</Text>
                        </View>
                        <Button label="Invite" size="sm" onPress={() => { }} style={{ minWidth: 80 }} />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={[Typography.h3, styles.sectionTitle]}>Transaction History</Text>
                    <Card style={styles.historyCard}>
                        <View style={{ alignItems: 'center', paddingVertical: Spacing.xxl }}>
                            <History size={48} color={Colors.border} />
                            <Text style={[Typography.body, { color: Colors.textMuted, marginTop: Spacing.md }]}>
                                No recent activity
                            </Text>
                        </View>
                    </Card>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl, paddingBottom: 100 },
    balanceCard: {
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        borderRadius: 24,
        marginBottom: Spacing.xl,
    },
    cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: Spacing.md, marginTop: Spacing.md },
    actionGrid: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    actionItem: { flex: 1, alignItems: 'center' },
    iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    section: { marginBottom: Spacing.xl },
    sectionTitle: { marginBottom: Spacing.md, color: Colors.text },
    menuCard: { padding: 0, overflow: 'hidden' },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuText: { flex: 1, marginLeft: Spacing.md, color: Colors.text },
    promoBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surfaceElevated,
        padding: Spacing.lg,
        borderRadius: Spacing.borderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        gap: Spacing.md
    },
    promoIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
    historyCard: { padding: Spacing.md },
});
