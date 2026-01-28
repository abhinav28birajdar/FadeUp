import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { ThemedView } from '../../components/ui/ThemedView';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { User, Store } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';

export default function UserChoiceScreen() {
    const router = useRouter();

    const handleChoice = (type: 'customer' | 'barber') => {
        if (type === 'customer') {
            router.push('/(auth)/sign-up-customer');
        } else {
            router.push('/(auth)/sign-up-barber');
        }
    };

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Join FadeUp</ThemedText>
                <ThemedText variant="md" color={Colors.textSecondary} style={styles.subtitle}>
                    Choose how you want to use the app
                </ThemedText>
            </View>

            <View style={styles.content}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.card}
                    onPress={() => handleChoice('customer')}
                >
                    <View style={styles.iconContainer}>
                        <User size={32} color={Colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.cardTitle}>
                            I'm a Customer
                        </ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>
                            Book appointments, join queues, and find the best barbers near you.
                        </ThemedText>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.card}
                    onPress={() => handleChoice('barber')}
                >
                    <View style={styles.iconContainer}>
                        <Store size={32} color={Colors.primary} />
                    </View>
                    <View style={styles.textContainer}>
                        <ThemedText variant="lg" weight="semibold" style={styles.cardTitle}>
                            Barber / Shop Owner
                        </ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>
                            Manage your shop, queues, appointments, and grow your business.
                        </ThemedText>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <ThemedText variant="sm" color={Colors.textSecondary} centered>
                    Already have an account?{' '}
                    <ThemedText
                        variant="sm"
                        color={Colors.primary}
                        weight="semibold"
                        onPress={() => router.push('/(auth)/sign-in')}
                    >
                        Sign In
                    </ThemedText>
                </ThemedText>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        marginTop: Spacing.xl,
        marginBottom: Spacing.xxl,
    },
    subtitle: {
        marginTop: Spacing.xs,
    },
    content: {
        gap: Spacing.lg,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: BorderRadius.full,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    cardTitle: {
        marginBottom: 4,
    },
    footer: {
        marginTop: 'auto',
        marginBottom: Spacing.xl,
    }
});
