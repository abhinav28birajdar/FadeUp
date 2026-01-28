import React from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ChevronRight, Lock, Shield, Moon, HelpCircle } from 'lucide-react-native';

const SETTINGS_SECTIONS = [
    {
        title: 'Account',
        items: [
            { label: 'Privacy', icon: Lock, route: '/settings/privacy' },
            { label: 'Security', icon: Shield, route: '/settings/security' },
        ]
    },
    {
        title: 'App Settings',
        items: [
            { label: 'Theme', icon: Moon, route: '/settings/theme' },
            { label: 'Help & Support', icon: HelpCircle, route: '/settings/help' },
        ]
    }
];

export default function SettingsScreen() {
    const router = useRouter();

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Settings</ThemedText>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {SETTINGS_SECTIONS.map((section, idx) => (
                    <View key={idx} style={styles.section}>
                        <ThemedText variant="sm" weight="bold" color={Colors.textSecondary} style={styles.sectionTitle}>
                            {section.title.toUpperCase()}
                        </ThemedText>
                        <View style={styles.sectionContainer}>
                            {section.items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.item, index === section.items.length - 1 && styles.lastItem]}
                                    onPress={() => router.push(item.route)}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <item.icon size={20} color={Colors.text} />
                                        <ThemedText style={{ marginLeft: Spacing.md }}>{item.label}</ThemedText>
                                    </View>
                                    <ChevronRight size={20} color={Colors.textTertiary} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: Spacing.md,
    },
    content: {
        padding: Spacing.md,
    },
    section: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    sectionContainer: {
        backgroundColor: Colors.surface,
        borderRadius: 12, // Using hardcoded value or standard
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceLight,
    },
    lastItem: {
        borderBottomWidth: 0,
    }
});
