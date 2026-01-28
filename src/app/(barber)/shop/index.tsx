import React from 'react';
import { StyleSheet, View, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Container } from '../../../components/ui/Container';
import { ThemedText } from '../../../components/ui/ThemedText';
import { ThemedView } from '../../../components/ui/ThemedView';
import { Button } from '../../../components/ui/Button';
import { Colors } from '../../../constants/colors';
import { Spacing, BorderRadius } from '../../../constants/spacing';
import { MapPin, Phone, Mail, Globe, Clock, Edit3, Camera, Scissors } from 'lucide-react-native';

export default function ShopManagementScreen() {
    return (
        <Container padding={false}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Spacing.xxl }}>
                {/* Cover Photo Area */}
                <View style={styles.coverSection}>
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800' }}
                        style={styles.coverImage}
                    />
                    <View style={styles.coverOverlay} />
                    <TouchableOpacity style={styles.editCoverBtn}>
                        <Camera size={20} color={Colors.white} />
                    </TouchableOpacity>
                </View>

                {/* Shop Profile Header */}
                <View style={styles.headerContent}>
                    <View style={styles.logoWrapper}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1621605815971-fbc98d6d4e84?w=200' }}
                            style={styles.logo}
                        />
                        <TouchableOpacity style={styles.editLogoBtn}>
                            <Edit3 size={14} color={Colors.white} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.titleSection}>
                        <ThemedText variant="xxl" weight="bold">Elite Barber Shop</ThemedText>
                        <ThemedText variant="sm" color={Colors.textSecondary}>Est. 2018 • Premium Men's Grooming</ThemedText>
                        <View style={styles.statusRow}>
                            <View style={styles.activeDot} />
                            <ThemedText variant="xs" weight="medium" color={Colors.success}>Publicly Visible</ThemedText>
                        </View>
                    </View>

                    <Button label="Edit Shop Profile" variant="outline" style={styles.editBtn} />
                </View>

                {/* Quick Info Grid */}
                <View style={styles.infoGrid}>
                    <View style={styles.infoCard}>
                        <MapPin size={20} color={Colors.primary} />
                        <ThemedText variant="sm" style={styles.infoLabel}>Location</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary} centered>123 Barber St, NYC</ThemedText>
                    </View>
                    <View style={styles.infoCard}>
                        <Clock size={20} color={Colors.primary} />
                        <ThemedText variant="sm" style={styles.infoLabel}>Hours</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary} centered>09:00 - 20:00</ThemedText>
                    </View>
                    <View style={styles.infoCard}>
                        <Scissors size={20} color={Colors.primary} />
                        <ThemedText variant="sm" style={styles.infoLabel}>Services</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary} centered>12 Active</ThemedText>
                    </View>
                </View>

                {/* Management Tabs/Buttons */}
                <View style={styles.managementSection}>
                    <ThemedText variant="md" weight="bold" style={styles.sectionTitle}>Management</ThemedText>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Scissors size={20} color={Colors.text} />
                        </View>
                        <View style={styles.menuText}>
                            <ThemedText variant="md" weight="semibold">Service Catalog</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>Manage your grooming packages</ThemedText>
                        </View>
                        <ThemedText variant="sm" color={Colors.primary}>Edit</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Clock size={20} color={Colors.text} />
                        </View>
                        <View style={styles.menuText}>
                            <ThemedText variant="md" weight="semibold">Operating Hours</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>Set open/close & break times</ThemedText>
                        </View>
                        <ThemedText variant="sm" color={Colors.primary}>Edit</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIcon}>
                            <Camera size={20} color={Colors.text} />
                        </View>
                        <View style={styles.menuText}>
                            <ThemedText variant="md" weight="semibold">Gallery Management</ThemedText>
                            <ThemedText variant="xs" color={Colors.textSecondary}>Refresh your shop portfolio</ThemedText>
                        </View>
                        <ThemedText variant="sm" color={Colors.primary}>Update</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Contact Info */}
                <View style={styles.contactSection}>
                    <ThemedText variant="md" weight="bold" style={styles.sectionTitle}>Contact & Social</ThemedText>
                    <View style={styles.contactRow}>
                        <Phone size={18} color={Colors.textSecondary} />
                        <ThemedText variant="sm" style={{ marginLeft: 12 }}>+1 (555) 123-4567</ThemedText>
                    </View>
                    <View style={styles.contactRow}>
                        <Mail size={18} color={Colors.textSecondary} />
                        <ThemedText variant="sm" style={{ marginLeft: 12 }}>contact@elitebarber.com</ThemedText>
                    </View>
                    <View style={styles.contactRow}>
                        <Globe size={18} color={Colors.textSecondary} />
                        <ThemedText variant="sm" style={{ marginLeft: 12 }}>www.elitebarber.com</ThemedText>
                    </View>
                </View>
            </ScrollView>
        </Container>
    );
}

const styles = StyleSheet.create({
    coverSection: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    coverImage: {
        width: '100%',
        height: '100%',
    },
    coverOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    editCoverBtn: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: BorderRadius.full,
    },
    headerContent: {
        marginTop: -40,
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoWrapper: {
        position: 'relative',
        marginBottom: Spacing.md,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: Colors.background,
    },
    editLogoBtn: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: Colors.primary,
        padding: 6,
        borderRadius: BorderRadius.full,
        borderWidth: 3,
        borderColor: Colors.background,
    },
    titleSection: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.success,
        marginRight: 6,
    },
    editBtn: {
        paddingHorizontal: 40,
    },
    infoGrid: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    infoCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    infoLabel: {
        marginTop: 8,
        marginBottom: 2,
        fontWeight: 'bold',
    },
    managementSection: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        marginBottom: Spacing.md,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    menuIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    contactSection: {
        paddingHorizontal: Spacing.md,
        marginBottom: Spacing.xl,
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
});
