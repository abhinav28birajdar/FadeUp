import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

export default function UserActionsModal() {
    const router = useRouter();

    return (
        <Container style={styles.container}>
            <View style={styles.content}>
                <ThemedText variant="lg" weight="bold" style={styles.title}>Actions</ThemedText>

                <Button
                    label="Block User"
                    variant="danger"
                    onPress={() => router.back()}
                    style={styles.btn}
                />
                <Button
                    label="Report"
                    variant="outline"
                    onPress={() => router.back()}
                    style={styles.btn}
                />
                <Button
                    label="Cancel"
                    variant="ghost"
                    onPress={() => router.back()}
                />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: Colors.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: Spacing.xl,
    },
    title: {
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    btn: {
        marginBottom: Spacing.md,
    }
});
