/**
 * Barber Earnings Screen
 * Track and analyze earnings, revenue reports, payouts
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Badge, TabBar } from '../../components/ui';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  pendingPayout: number;
  totalServices: number;
  averageService: number;
}

interface Transaction {
  id: string;
  customerName: string;
  services: string[];
  amount: number;
  date: string;
  time: string;
  paymentMethod: 'cash' | 'card' | 'app';
  tip?: number;
}

interface DailyEarning {
  date: string;
  label: string;
  amount: number;
  services: number;
}

const mockSummary: EarningsSummary = {
  today: 285,
  thisWeek: 1450,
  thisMonth: 5680,
  pendingPayout: 890,
  totalServices: 127,
  averageService: 44.7,
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    customerName: 'John Smith',
    services: ['Fade Haircut', 'Beard Trim'],
    amount: 50,
    date: '2024-12-15',
    time: '10:30 AM',
    paymentMethod: 'card',
    tip: 10,
  },
  {
    id: '2',
    customerName: 'Mike Johnson',
    services: ['Classic Haircut'],
    amount: 25,
    date: '2024-12-15',
    time: '11:15 AM',
    paymentMethod: 'cash',
    tip: 5,
  },
  {
    id: '3',
    customerName: 'Robert Wilson',
    services: ['Hot Towel Shave'],
    amount: 30,
    date: '2024-12-15',
    time: '12:00 PM',
    paymentMethod: 'app',
  },
  {
    id: '4',
    customerName: 'David Brown',
    services: ['Fade Haircut', 'Hair Coloring'],
    amount: 100,
    date: '2024-12-15',
    time: '1:30 PM',
    paymentMethod: 'card',
    tip: 15,
  },
  {
    id: '5',
    customerName: 'James Miller',
    services: ['Kids Haircut'],
    amount: 18,
    date: '2024-12-15',
    time: '2:45 PM',
    paymentMethod: 'cash',
  },
];

const mockWeeklyData: DailyEarning[] = [
  { date: '2024-12-09', label: 'Mon', amount: 245, services: 7 },
  { date: '2024-12-10', label: 'Tue', amount: 312, services: 9 },
  { date: '2024-12-11', label: 'Wed', amount: 198, services: 6 },
  { date: '2024-12-12', label: 'Thu', amount: 428, services: 12 },
  { date: '2024-12-13', label: 'Fri', amount: 356, services: 10 },
  { date: '2024-12-14', label: 'Sat', amount: 520, services: 14 },
  { date: '2024-12-15', label: 'Today', amount: 285, services: 8 },
];

type PeriodType = 'today' | 'week' | 'month';

export const EarningsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  const getEarningsForPeriod = () => {
    switch (selectedPeriod) {
      case 'today':
        return mockSummary.today;
      case 'week':
        return mockSummary.thisWeek;
      case 'month':
        return mockSummary.thisMonth;
    }
  };

  const maxDailyEarning = Math.max(...mockWeeklyData.map((d) => d.amount));

  const getPaymentIcon = (method: Transaction['paymentMethod']) => {
    switch (method) {
      case 'card':
        return 'card-outline';
      case 'cash':
        return 'cash-outline';
      case 'app':
        return 'phone-portrait-outline';
    }
  };

  const renderEarningsCard = () => (
    <LinearGradient
      colors={[theme.colors.primary[500], theme.colors.primary[700]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.earningsCard}
    >
      <View style={styles.earningsHeader}>
        <Text style={styles.earningsLabel}>Total Earnings</Text>
        <TouchableOpacity onPress={() => router.push('/earnings/report')}>
          <Text style={styles.viewReportText}>View Report</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.earningsAmount}>${getEarningsForPeriod()}</Text>
      <View style={styles.earningsStats}>
        <View style={styles.earningStat}>
          <Text style={styles.earningStatValue}>{mockSummary.totalServices}</Text>
          <Text style={styles.earningStatLabel}>Services</Text>
        </View>
        <View style={styles.earningsStatDivider} />
        <View style={styles.earningStat}>
          <Text style={styles.earningStatValue}>${mockSummary.averageService.toFixed(0)}</Text>
          <Text style={styles.earningStatLabel}>Avg/Service</Text>
        </View>
        <View style={styles.earningsStatDivider} />
        <View style={styles.earningStat}>
          <Text style={styles.earningStatValue}>
            ${mockTransactions.reduce((acc, t) => acc + (t.tip || 0), 0)}
          </Text>
          <Text style={styles.earningStatLabel}>Tips</Text>
        </View>
      </View>
    </LinearGradient>
  );

  const renderPendingPayout = () => (
    <TouchableOpacity
      style={[styles.payoutCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => router.push('/earnings/payout')}
    >
      <View style={styles.payoutInfo}>
        <View
          style={[styles.payoutIcon, { backgroundColor: theme.colors.success[50] }]}
        >
          <Ionicons
            name="wallet-outline"
            size={24}
            color={theme.colors.success[500]}
          />
        </View>
        <View>
          <Text style={[styles.payoutLabel, { color: theme.colors.text.secondary }]}>
            Pending Payout
          </Text>
          <Text style={[styles.payoutAmount, { color: theme.colors.text.primary }]}>
            ${mockSummary.pendingPayout}
          </Text>
        </View>
      </View>
      <View style={styles.payoutAction}>
        <Text style={[styles.payoutActionText, { color: theme.colors.primary[500] }]}>
          Request
        </Text>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.primary[500]}
        />
      </View>
    </TouchableOpacity>
  );

  const renderWeeklyChart = () => (
    <View style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
          Weekly Overview
        </Text>
        <TouchableOpacity onPress={() => router.push('/earnings/analytics')}>
          <Text style={[styles.viewAllText, { color: theme.colors.primary[500] }]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.chartContainer}>
        {mockWeeklyData.map((day, index) => (
          <View key={day.date} style={styles.chartBarContainer}>
            <Text
              style={[styles.chartBarValue, { color: theme.colors.text.secondary }]}
            >
              ${day.amount}
            </Text>
            <View
              style={[
                styles.chartBar,
                {
                  height: (day.amount / maxDailyEarning) * 100,
                  backgroundColor:
                    day.label === 'Today'
                      ? theme.colors.primary[500]
                      : theme.colors.primary[200],
                },
              ]}
            />
            <Text
              style={[
                styles.chartBarLabel,
                {
                  color:
                    day.label === 'Today'
                      ? theme.colors.primary[500]
                      : theme.colors.text.muted,
                  fontWeight: day.label === 'Today' ? '600' : '400',
                },
              ]}
            >
              {day.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.transactionMain}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: theme.colors.neutral[100] },
          ]}
        >
          <Ionicons
            name={getPaymentIcon(item.paymentMethod)}
            size={20}
            color={theme.colors.text.secondary}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text
            style={[styles.transactionCustomer, { color: theme.colors.text.primary }]}
          >
            {item.customerName}
          </Text>
          <Text
            style={[styles.transactionServices, { color: theme.colors.text.secondary }]}
          >
            {item.services.join(', ')}
          </Text>
          <Text
            style={[styles.transactionTime, { color: theme.colors.text.muted }]}
          >
            {item.time}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[styles.amountText, { color: theme.colors.success[500] }]}
          >
            +${item.amount}
          </Text>
          {item.tip && (
            <Text
              style={[styles.tipText, { color: theme.colors.text.muted }]}
            >
              +${item.tip} tip
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Earnings
        </Text>
        <TouchableOpacity
          style={[styles.settingsButton, { backgroundColor: theme.colors.neutral[100] }]}
          onPress={() => router.push('/earnings/settings')}
        >
          <Ionicons
            name="settings-outline"
            size={22}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Period Selector */}
        <TabBar
          tabs={periods}
          activeTab={selectedPeriod}
          onTabChange={(tab) => setSelectedPeriod(tab as PeriodType)}
          style={{ marginHorizontal: 16, marginBottom: 16 }}
        />

        {/* Earnings Card */}
        <View style={{ paddingHorizontal: 16 }}>
          {renderEarningsCard()}
        </View>

        {/* Pending Payout */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {renderPendingPayout()}
        </View>

        {/* Weekly Chart */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          {renderWeeklyChart()}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text
              style={[styles.transactionsTitle, { color: theme.colors.text.primary }]}
            >
              Today's Transactions
            </Text>
            <TouchableOpacity onPress={() => router.push('/earnings/transactions')}>
              <Text
                style={[styles.viewAllText, { color: theme.colors.primary[500] }]}
              >
                View All
              </Text>
            </TouchableOpacity>
          </View>
          {mockTransactions.map((transaction) => (
            <View key={transaction.id}>
              {renderTransaction({ item: transaction })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  earningsCard: {
    borderRadius: 20,
    padding: 24,
  },
  earningsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  earningsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  viewReportText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  earningsAmount: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
  },
  earningStat: {
    alignItems: 'center',
  },
  earningStatValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningStatLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  earningsStatDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 4,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  payoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  payoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  payoutAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  payoutAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  payoutActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    fontSize: 10,
    marginBottom: 4,
  },
  chartBar: {
    width: 24,
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 11,
    marginTop: 8,
  },
  transactionsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  transactionMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionServices: {
    fontSize: 13,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 11,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default EarningsScreen;
