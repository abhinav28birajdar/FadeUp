import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function CreateChatScreen() {
    const router = useRouter();
    return (
        <Container style={styles.container}>
            <View style={styles.header}>
                <ThemedText variant="lg" weight="bold">New Message</ThemedText>
            </View>
            <View style={styles.content}>
                <ThemedText align="center" color={Colors.textSecondary}>Search for users feature coming soon.</ThemedText>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
