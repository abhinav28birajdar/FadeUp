import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { useAuthContext } from '../../context/AuthContext';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useImagePicker } from '../../hooks/useImagePicker';
import { Camera, ChevronRight, LogOut, Settings, Bell, Headset, Trash2, Edit2, Wallet, ShieldCheck, Mail, LayoutDashboard } from 'lucide-react-native';
import { Input } from '../../components/ui/Input';
import { useToastStore } from '../../components/ui/Toast';

export default function ProfileScreen() {
    const { user } = useAuthContext();
    const router = useRouter();
    const { pickImage, uploadToStorage, isUploading } = useImagePicker();
    const { showToast } = useToastStore();

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');

    const handleUpdateImage = async () => {
        const result = await pickImage();
        if (!result.canceled && result.assets[0] && user) {
            try {
                const url = await uploadToStorage(result.assets[0].uri, `users/${user.uid}/profile.jpg`);
                await userService.updateProfile(user.uid, { photoURL: url });
                await authService.updateUserProfile({ photoURL: url });
                showToast({ message: 'Profile photo updated', type: 'success' });
            } catch (e) {
                showToast({ message: 'Failed to upload image', type: 'error' });
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        try {
            await userService.updateProfile(user.uid, { displayName, phone, email });
            await authService.updateUserProfile({ displayName });
            setIsEditing(false);
            showToast({ message: 'Profile updated', type: 'success' });
        } catch (e) {
            showToast({ message: 'Failed to update profile', type: 'error' });
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: () => authService.logout() }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Profile" showBack={false} />

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={handleUpdateImage} disabled={isUploading}>
                        <View style={styles.avatarWrapper}>
                            <Avatar url={user?.photoURL} name={user?.displayName || ''} size="lg" />
                            <View style={styles.editBadge}>
                                <Camera size={14} color={Colors.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <Text style={[Typography.h2, { color: Colors.text, marginTop: Spacing.md }]}>{user?.displayName}</Text>
                    <Text style={[Typography.body, { color: Colors.textSecondary }]}>{user?.email}</Text>
                    <Text style={[Typography.caption, { color: Colors.primary, marginTop: Spacing.xs, textTransform: 'uppercase' }]}>{user?.role}</Text>
                </View>

                {isEditing ? (
                    <View style={styles.editForm}>
                        <Input label="Name" value={displayName} onChangeText={setDisplayName} />
                        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
                        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        <View style={{ flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.md }}>
                            <Button label="Cancel" variant="outline" onPress={() => setIsEditing(false)} style={{ flex: 1 }} />
                            <Button label="Save" onPress={handleSaveProfile} style={{ flex: 1 }} />
                        </View>
                    </View>
                ) : (
                    <View style={styles.section}>
                        {user?.role !== 'customer' && (
                            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(barber)/dashboard')}>
                                <View style={styles.menuIcon}><LayoutDashboard size={20} color={Colors.primary} /></View>
                                <Text style={[Typography.body, styles.menuText, { color: Colors.primary, fontWeight: '700' }]}>Barber Dashboard</Text>
                                <ChevronRight size={20} color={Colors.primary} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={styles.menuItem} onPress={() => setIsEditing(true)}>
                            <View style={styles.menuIcon}><Edit2 size={20} color={Colors.text} /></View>
                            <Text style={[Typography.body, styles.menuText]}>Edit Profile</Text>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push(user?.role === 'customer' ? '/wallet/customer' : '/(barber)/wallet' as any)}>
                            <View style={styles.menuIcon}><Wallet size={20} color={Colors.text} /></View>
                            <Text style={[Typography.body, styles.menuText]}>My Wallet</Text>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(barber)/security')}>
                            <View style={styles.menuIcon}><ShieldCheck size={20} color={Colors.text} /></View>
                            <Text style={[Typography.body, styles.menuText]}>Security & Password</Text>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
                            <View style={styles.menuIcon}><Bell size={20} color={Colors.text} /></View>
                            <Text style={[Typography.body, styles.menuText]}>Notifications</Text>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Support', 'Contact us at: abhinav28.birajdar@gmail.com')}>
                            <View style={styles.menuIcon}><Headset size={20} color={Colors.text} /></View>
                            <View style={{ flex: 1 }}>
                                <Text style={[Typography.body, styles.menuText]}>Support</Text>
                                <Text style={[Typography.caption, { color: Colors.textMuted, marginLeft: Spacing.md }]}>abhinav28.birajdar@gmail.com</Text>
                            </View>
                            <ChevronRight size={20} color={Colors.textMuted} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
                            <View style={styles.menuIcon}><LogOut size={20} color={Colors.error} /></View>
                            <Text style={[Typography.body, styles.menuText, { color: Colors.error }]}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    profileHeader: { alignItems: 'center', marginBottom: Spacing.xl },
    avatarWrapper: { position: 'relative' },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: Colors.primary,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.background,
    },
    editForm: { backgroundColor: Colors.surface, padding: Spacing.xl, borderRadius: Spacing.borderRadius.lg, borderWidth: 1, borderColor: Colors.border },
    section: { backgroundColor: Colors.surface, borderRadius: Spacing.borderRadius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.surfaceElevated, justifyContent: 'center', alignItems: 'center', marginRight: Spacing.md },
    menuText: { flex: 1, color: Colors.text },
});
