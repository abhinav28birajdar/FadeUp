import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { useToastStore } from '../../components/ui/Toast';

export default function SecurityScreen() {
    const { showToast } = useToastStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            // Must re-authenticate before changing password
            await authService.reAuthenticate(currentPassword);
            await authService.changePassword(newPassword);

            showToast({ message: 'Password changed successfully', type: 'success' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to change password. Ensure your current password is correct.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Security & Password" />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.xl }]}>
                    Update your password to keep your account secure.
                </Text>

                <Text style={styles.label}>Current Password</Text>
                <Input
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    secureTextEntry
                />

                <Text style={[styles.label, { marginTop: Spacing.md }]}>New Password</Text>
                <Input
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password"
                    secureTextEntry
                />

                <Text style={[styles.label, { marginTop: Spacing.md }]}>Confirm New Password</Text>
                <Input
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm new password"
                    secureTextEntry
                />

                <Button
                    label="Change Password"
                    onPress={handleChangePassword}
                    isLoading={isLoading}
                    style={{ marginTop: Spacing.xxl }}
                />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs },
});
