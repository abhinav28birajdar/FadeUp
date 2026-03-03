import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { shopService } from '../../services/shop.service';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { useToastStore } from '../../components/ui/Toast';
import { getFirebaseErrorMessage } from '../../utils/errorHandler';
import { isValidEmail, isValidPassword } from '../../utils/validators';
import { UserRole } from '../../types/firestore.types';
import { Store, User } from 'lucide-react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const { showToast } = useToastStore();

    const [role, setRole] = useState<UserRole>('customer');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [shopName, setShopName] = useState('');
    const [city, setCity] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        if (!fullName || !email || !phone || !password || !confirmPassword) {
            showToast({ message: 'Please fill all fields', type: 'warning' });
            return;
        }

        if (role === 'barber' && (!shopName || !city)) {
            showToast({ message: 'Please enter shop details', type: 'warning' });
            return;
        }

        if (password !== confirmPassword) {
            showToast({ message: 'Passwords do not match', type: 'warning' });
            return;
        }

        if (!isValidEmail(email)) {
            showToast({ message: 'Invalid email format', type: 'warning' });
            return;
        }

        const { valid, message } = isValidPassword(password);
        if (!valid) {
            showToast({ message, type: 'warning' });
            return;
        }

        try {
            setIsLoading(true);
            const userCred = await authService.register(email.trim(), password);

            // We will save user role as shop_owner if barber is selected in registration context
            const actualRole = role === 'barber' ? 'shop_owner' : 'customer';

            const promises: Promise<any>[] = [
                authService.updateUserProfile({ displayName: fullName }),
                userService.createProfile(userCred.user.uid, {
                    email: email.trim(),
                    phone: phone.trim(),
                    displayName: fullName,
                    role: actualRole,
                    photoURL: null,
                })
            ];

            if (actualRole === 'shop_owner') {
                const tempShopId = userCred.user.uid; // Just using uid as direct mapping for single shop owners
                promises.push(
                    shopService.createShop(tempShopId, {
                        ownerId: tempShopId,
                        name: shopName,
                        city,
                        address: '',
                        description: '',
                        phone: phone.trim(),
                        category: [],
                        rating: 0,
                        reviewCount: 0,
                        isOpen: false,
                        isApproved: false,
                        photoURL: null,
                        coverPhotoURL: null,
                        openingHours: {},
                        location: { lat: 0, lng: 0 }
                    })
                );
            }

            const { sendEmailVerification } = await import('firebase/auth');
            promises.push(sendEmailVerification(userCred.user));

            await Promise.all(promises);
            await authService.logout();
            showToast({ message: 'Registration successful! Check your email to verify.', type: 'info' });
            router.replace('/(auth)/login');
        } catch (e: any) {
            showToast({ message: getFirebaseErrorMessage(e?.code ?? ''), type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Create Account" />

            <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <Text style={[Typography.body, styles.subtitle, { color: Colors.textSecondary }]}>
                        Join FadeUp and discover the right style.
                    </Text>

                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleCard, role === 'customer' && styles.roleCardActive]}
                            onPress={() => setRole('customer')}
                            activeOpacity={0.7}
                        >
                            <User size={24} color={role === 'customer' ? Colors.primary : Colors.textMuted} />
                            <Text style={[Typography.h4, { color: role === 'customer' ? Colors.primary : Colors.textMuted, marginTop: Spacing.xs }]}>
                                Customer
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.roleCard, role === 'barber' && styles.roleCardActive]}
                            onPress={() => setRole('barber')}
                            activeOpacity={0.7}
                        >
                            <Store size={24} color={role === 'barber' ? Colors.primary : Colors.textMuted} />
                            <Text style={[Typography.h4, { color: role === 'barber' ? Colors.primary : Colors.textMuted, marginTop: Spacing.xs }]}>
                                Shop Owner
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.form}>
                        <Input label="Full Name" placeholder="John Doe" value={fullName} onChangeText={setFullName} />
                        <Input label="Email" placeholder="john@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <Input label="Phone" placeholder="+1234567890" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                        {role === 'barber' && (
                            <>
                                <Input label="Shop Name" placeholder="FadeUp Barbers" value={shopName} onChangeText={setShopName} />
                                <Input label="City" placeholder="New York" value={city} onChangeText={setCity} />
                            </>
                        )}

                        <Input label="Password" placeholder="Minimum 6 characters" value={password} onChangeText={setPassword} secureTextEntry />
                        <Input label="Confirm Password" placeholder="Repeat password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
                    </View>

                    <Button
                        label="Create Account"
                        onPress={handleRegister}
                        isLoading={isLoading}
                        style={styles.registerBtn}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    scrollContent: { padding: Spacing.xl, flexGrow: 1 },
    subtitle: { marginBottom: Spacing.xl },
    roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xl, gap: Spacing.md },
    roleCard: {
        flex: 1,
        height: 100,
        borderRadius: Spacing.borderRadius.lg,
        backgroundColor: Colors.surface,
        borderWidth: 2,
        borderColor: Colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.surfaceElevated },
    form: { marginBottom: Spacing.xl },
    registerBtn: { marginTop: Spacing.md },
});
