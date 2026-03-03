import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { OpeningHours, Shop } from '../../types/firestore.types';
import { shopService } from '../../services/shop.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../components/ui/Toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function HoursScreen() {
    const { user } = useAuthContext();
    const { showToast } = useToastStore();
    const [shop, setShop] = useState<Shop | null>(null);
    const [hours, setHours] = useState<OpeningHours>({});

    useEffect(() => {
        if (!user) return;
        loadShop();
    }, [user]);

    const loadShop = async () => {
        try {
            const shops = await shopService.getApprovedShops();
            const myShop = shops.find(s => s.ownerId === user?.uid);
            if (myShop) {
                setShop(myShop);
                setHours(myShop.openingHours || {});
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = (day: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...(prev[day] || { open: '09:00', close: '18:00', isClosed: false }),
                isClosed: !prev[day]?.isClosed
            }
        }));
    };

    const handleSave = async () => {
        if (!shop) return;
        try {
            await shopService.updateOpeningHours(shop.id, hours);
            showToast({ message: 'Working hours updated', type: 'success' });
        } catch (error) {
            showToast({ message: 'Failed to update hours', type: 'error' });
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Working Hours" />

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={[Typography.body, { color: Colors.textSecondary, marginBottom: Spacing.xl }]}>
                    Set your shop's weekly schedule. Clients can only book during these hours.
                </Text>

                {DAYS.map((day) => {
                    const h = hours[day] || { open: '09:00', close: '18:00', isClosed: false };
                    return (
                        <View key={day} style={styles.dayRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={[Typography.h4, { color: Colors.text }]}>{day}</Text>
                                <Text style={[Typography.bodySmall, { color: h.isClosed ? Colors.error : Colors.textSecondary }]}>
                                    {h.isClosed ? 'Closed' : `${h.open} - ${h.close}`}
                                </Text>
                            </View>
                            <Switch
                                value={!h.isClosed}
                                onValueChange={() => handleToggle(day)}
                                trackColor={{ true: Colors.primary, false: Colors.border }}
                                thumbColor={Colors.white}
                            />
                        </View>
                    );
                })}
            </ScrollView>

            <View style={styles.footer}>
                <Button label="Save Hours" onPress={handleSave} fullWidth />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    dayRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    footer: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.border },
});
