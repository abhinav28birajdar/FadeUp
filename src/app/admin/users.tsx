import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users } from 'lucide-react-native';

export default function AdminUsersScreen() {
    return (
        <View style={styles.container}>
            <ScreenHeader title="Manage Users" />

            <EmptyState
                icon={<Users size={48} color={Colors.textMuted} />}
                title="Admin Users List"
                description="This screen is meant to display all active users on the platform. Can add pagination/filtering logic here."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
});
