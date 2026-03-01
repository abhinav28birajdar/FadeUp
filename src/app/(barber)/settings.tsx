import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth.service';
import { LogOut, ChevronRight, Wrench, Clock, MapPin } from 'lucide-react-native';

export default function SettingsScreen() {
    const [isAvailable, setIsAvailable] = useState(true);

    return (
        <View style={styles.container}>
            <ScreenHeader title="Settings" showBack={false} />

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.section}>
                    <View style={styles.settingRow}>
                        <Text style={[Typography.body, { color: Colors.text }]}>Accepting New Clients</Text>
                        <Switch
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ true: Colors.primary, false: Colors.border }}
                            thumbColor={Colors.white}
                        />
                    </View>
                </View>

                <Text style={[Typography.label, styles.sectionTitle]}>SHOP MANAGEMENT</Text>
                <View style={styles.section}>
                    <TouchableOpacity style={styles.menuItem}>
                        <Wrench size={20} color={Colors.textMuted} />
                        <Text style={[Typography.body, styles.menuText]}>Services & Pricing</Text>
                        <ChevronRight size={20} color={Colors.border} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <Clock size={20} color={Colors.textMuted} />
                        <Text style={[Typography.body, styles.menuText]}>Working Hours</Text>
                        <ChevronRight size={20} color={Colors.border} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem}>
                        <MapPin size={20} color={Colors.textMuted} />
                        <Text style={[Typography.body, styles.menuText]}>Shop Details</Text>
                        <ChevronRight size={20} color={Colors.border} />
                    </TouchableOpacity>
                </View>

                <View style={{ marginTop: Spacing.xxl }}>
                    <Button
                        variant="ghost"
                        label="Log Out"
                        onPress={() => authService.logout()}
                        style={{ backgroundColor: Colors.surfaceElevated }}
                        labelStyle={{ color: Colors.error }}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    content: { padding: Spacing.xl },
    sectionTitle: { color: Colors.textMuted, marginBottom: Spacing.md, marginLeft: Spacing.sm },
    section: { backgroundColor: Colors.surface, borderRadius: Spacing.borderRadius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', marginBottom: Spacing.xl },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.border },
    menuText: { flex: 1, color: Colors.text, marginLeft: Spacing.md },
});
