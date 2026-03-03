import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { formatCurrency } from '../../utils/formatters';
import { formatDate } from '../../utils/dateHelpers';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Card } from '../../components/ui/Card';
import { useAuthContext } from '../../context/AuthContext';
import { earningsService } from '../../services/earnings.service';
import { Earning } from '../../types/firestore.types';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';

export default function EarningsScreen() {
    const { user } = useAuthContext();
    const [earnings, setEarnings] = useState<Earning[]>([]);

    useEffect(() => {
        if (!user) return;
        const unsub = earningsService.subscribeToBarberEarnings(user.uid, (data) => {
            setEarnings(data);
        });
        return () => unsub();
    }, [user]);

    const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

    // Calculate real chart data from earnings
    const getChartData = () => {
        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const data = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat

        const now = new Date();
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        earnings.forEach(e => {
            const edate = new Date(e.date);
            if (edate >= firstDayOfWeek) {
                const dayIndex = edate.getDay();
                data[dayIndex] += e.amount;
            }
        });

        const max = Math.max(...data, 100);
        return data.map((val, i) => ({
            day: days[i],
            h: (val / max) * 120 // max height 120
        }));
    };

    const chartData = getChartData();
    // Shift so M is first if that was intended (currently data is Sun-Sat)
    const displayData = [...chartData.slice(1), chartData[0]];

    return (
        <View style={styles.container}>
            <ScreenHeader title="Earnings" showBack={false} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.summaryContainer}>
                    <Text style={[Typography.caption, { color: Colors.textSecondary, textTransform: 'uppercase' }]}>Total Earnings</Text>
                    <Text style={[Typography.h1, { color: Colors.primary, marginVertical: Spacing.xs }]}>{formatCurrency(totalEarnings)}</Text>
                    <Text style={[Typography.bodySmall, { color: Colors.success }]}>+15% from last month</Text>
                </View>

                <Card style={styles.chartCard} elevated>
                    <Text style={[Typography.h4, { color: Colors.text, marginBottom: Spacing.xl }]}>This Week</Text>
                    <View style={styles.chartWrapper}>
                        <Svg height="150" width="100%">
                            {displayData.map((d, i) => (
                                <View key={i}>
                                    <Rect
                                        x={(i * 100 / 7) + '%'}
                                        y={130 - d.h}
                                        width="10%"
                                        height={d.h}
                                        fill={Colors.primary}
                                        rx={4}
                                    />
                                </View>
                            ))}
                            <Line x1="0" y1="130" x2="100%" y2="130" stroke={Colors.border} strokeWidth="1" />
                        </Svg>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 5, marginTop: 5 }}>
                            {displayData.map((d, i) => <Text key={i} style={{ color: Colors.textMuted, fontSize: 10 }}>{d.day}</Text>)}
                        </View>
                    </View>
                </Card>

                <Text style={[Typography.h3, { color: Colors.text, marginTop: Spacing.xl, marginBottom: Spacing.md }]}>Transactions</Text>

                {earnings.slice(0, 10).map((e) => (
                    <View key={e.id} style={styles.transactionItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={[Typography.h4, { color: Colors.text }]}>{e.serviceName}</Text>
                            <Text style={[Typography.caption, { color: Colors.textSecondary }]}>{e.customerName} • {e.date.split('T')[0]}</Text>
                        </View>
                        <Text style={[Typography.h3, { color: Colors.primary }]}>{formatCurrency(e.amount)}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    summaryContainer: { alignItems: 'center', marginBottom: Spacing.xxl },
    chartCard: { padding: Spacing.xl },
    chartWrapper: { width: '100%' },
    transactionItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border },
});
