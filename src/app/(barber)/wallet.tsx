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
import { earningsService } from '../../services/earnings.service';
import { CreditCard, Wallet as WalletIcon, Download, AlertCircle } from 'lucide-react-native';

export default function WalletScreen() {
    const { user } = useAuthContext();
    const [balance, setBalance] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    const loadEarnings = async () => {
        if (!user) return;
        try {
            const data = await earningsService.getBarberEarnings(user.uid);
            const total = data.reduce((sum, e) => sum + e.amount, 0);
            setBalance(total);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadEarnings();
    }, [user]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEarnings();
        setRefreshing(false);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="My Wallet" />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
            >
                <Card style={styles.balanceCard}>
                    <Text style={[Typography.caption, { color: 'rgba(255,255,255,0.7)', letterSpacing: 1 }]}>AVAILABLE BALANCE</Text>
                    <Text style={[Typography.h1, { color: Colors.white, fontSize: 36, marginVertical: Spacing.sm }]}>
                        {formatCurrency(balance)}
                    </Text>
                    <View style={styles.cardFooter}>
                        <View style={styles.row}>
                            <WalletIcon size={16} color="rgba(255,255,255,0.7)" />
                            <Text style={[Typography.bodySmall, { color: 'rgba(255,255,255,0.9)', marginLeft: 6 }]}>Withdrawal Limit: ₹5,000</Text>
                        </View>
                    </View>
                </Card>

                <View style={styles.actionGrid}>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(200, 169, 110, 0.1)' }]}>
                            <Download size={24} color={Colors.primary} />
                        </View>
                        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>Withdraw</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionItem}>
                        <View style={[styles.iconBox, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                            <CreditCard size={24} color={Colors.textSecondary} />
                        </View>
                        <Text style={[Typography.bodySmall, { marginTop: Spacing.xs }]}>Add Card</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.infoBox}>
                    <AlertCircle size={20} color={Colors.textMuted} />
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary, marginLeft: Spacing.sm, flex: 1 }]}>
                        Withdrawals are processed within 2-3 business days. Minimum withdrawal: ₹500.
                    </Text>
                </View>

                <Text style={[Typography.h3, { marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Transaction History</Text>
                <Card style={styles.transactionCard}>
                    <Text style={[Typography.body, { color: Colors.textMuted, textAlign: 'center', marginVertical: Spacing.xxl }]}>
                        No recent transactions to display.
                    </Text>
                </Card>
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Transfer to Bank" onPress={() => { }} fullWidth />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    balanceCard: {
        backgroundColor: Colors.primary,
        padding: Spacing.xl,
        borderRadius: 20,
        marginBottom: Spacing.xl,
    },
    row: { flexDirection: 'row', alignItems: 'center' },
    cardFooter: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: Spacing.md, marginTop: Spacing.md },
    actionGrid: { flexDirection: 'row', gap: Spacing.lg, marginBottom: Spacing.xl },
    actionItem: { flex: 1, alignItems: 'center' },
    iconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
    infoBox: { flexDirection: 'row', backgroundColor: Colors.surfaceElevated, padding: Spacing.md, borderRadius: 12 },
    transactionCard: { padding: Spacing.md },
    footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
});
