/**
 * Payment Methods Screen
 * Manage saved payment methods
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

// Mock payment methods
const mockPaymentMethods = [
  {
    id: '1',
    type: 'card' as const,
    brand: 'Visa',
    last4: '4242',
    expiryMonth: 12,
    expiryYear: 25,
    isDefault: true,
  },
  {
    id: '2',
    type: 'card' as const,
    brand: 'Mastercard',
    last4: '8888',
    expiryMonth: 6,
    expiryYear: 26,
    isDefault: false,
  },
];

type PaymentMethod = {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  brand?: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
};

const cardBrandIcons: Record<string, string> = {
  Visa: 'card',
  Mastercard: 'card',
  Amex: 'card',
  Discover: 'card',
};

export const PaymentMethodsScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find((pm) => pm.id === id);
    
    Alert.alert(
      'Remove Payment Method',
      `Are you sure you want to remove this ${method?.brand} ending in ${method?.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
          },
        },
      ]
    );
  };

  const handleAddCard = () => {
    Alert.alert('Add Card', 'This would open a card input form or Stripe payment sheet.');
  };

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
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          Payment Methods
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Cards Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            CARDS
          </Text>
          {paymentMethods.map((method) => (
            <View
              key={method.id}
              style={[styles.cardItem, { backgroundColor: theme.colors.surface }]}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.cardIconWrapper,
                    { backgroundColor: theme.colors.primary[50] },
                  ]}
                >
                  <Ionicons
                    name="card"
                    size={22}
                    color={theme.colors.primary[500]}
                  />
                </View>
                <View style={styles.cardInfo}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardBrand, { color: theme.colors.text.primary }]}>
                      {method.brand} •••• {method.last4}
                    </Text>
                    {method.isDefault && (
                      <View
                        style={[
                          styles.defaultBadge,
                          { backgroundColor: theme.colors.success[100] },
                        ]}
                      >
                        <Text
                          style={[
                            styles.defaultText,
                            { color: theme.colors.success[600] },
                          ]}
                        >
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.cardExpiry, { color: theme.colors.text.muted }]}>
                    Expires {method.expiryMonth}/{method.expiryYear}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={22}
                      color={theme.colors.text.secondary}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(method.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={22}
                    color={theme.colors.error[500]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Add Card Button */}
        <TouchableOpacity
          style={[
            styles.addCardBtn,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.primary[500],
            },
          ]}
          onPress={handleAddCard}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary[500]} />
          <Text style={[styles.addCardText, { color: theme.colors.primary[500] }]}>
            Add New Card
          </Text>
        </TouchableOpacity>

        {/* Digital Wallets Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.secondary }]}>
            DIGITAL WALLETS
          </Text>
          
          <TouchableOpacity
            style={[styles.walletItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.walletLeft}>
              <View style={[styles.walletIconWrapper, { backgroundColor: '#000000' }]}>
                <Ionicons name="logo-apple" size={22} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.walletName, { color: theme.colors.text.primary }]}>
                  Apple Pay
                </Text>
                <Text style={[styles.walletStatus, { color: theme.colors.text.muted }]}>
                  Not set up
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.setupBtn,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
            >
              <Text style={[styles.setupText, { color: theme.colors.text.secondary }]}>
                Set Up
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.walletItem, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.walletLeft}>
              <View style={[styles.walletIconWrapper, { backgroundColor: '#4285F4' }]}>
                <Ionicons name="logo-google" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.walletName, { color: theme.colors.text.primary }]}>
                  Google Pay
                </Text>
                <Text style={[styles.walletStatus, { color: theme.colors.text.muted }]}>
                  Not set up
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.setupBtn,
                { backgroundColor: theme.colors.neutral[100] },
              ]}
            >
              <Text style={[styles.setupText, { color: theme.colors.text.secondary }]}>
                Set Up
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View
          style={[styles.infoBox, { backgroundColor: theme.colors.primary[50] }]}
        >
          <Ionicons name="shield-checkmark" size={20} color={theme.colors.primary[500]} />
          <Text style={[styles.infoText, { color: theme.colors.primary[700] }]}>
            Your payment information is securely encrypted and processed through Stripe.
          </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardBrand: {
    fontSize: 15,
    fontWeight: '600',
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
  },
  cardExpiry: {
    fontSize: 13,
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
  },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  addCardText: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 15,
    fontWeight: '600',
  },
  walletStatus: {
    fontSize: 13,
    marginTop: 2,
  },
  setupBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  setupText: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default PaymentMethodsScreen;
