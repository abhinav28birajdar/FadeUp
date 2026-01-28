import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Button } from '../../components/ui/Button';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { MessageSquare, MoveLeft } from 'lucide-react-native';

export default function UserProfileScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    return (
        <Container>
            <View style={styles.header}>
                <Button
                    label=""
                    variant="ghost"
                    leftIcon={<MoveLeft size={24} color={Colors.text} />}
                    onPress={() => router.back()}
                    fullWidth={false}
                />
            </View>

            <View style={styles.content}>
                <Image
                    source={{ uri: 'https://i.pravatar.cc/300' }}
                    style={styles.avatar}
                />
                <ThemedText variant="xl" weight="bold" style={styles.name}>User {id}</ThemedText>
                <ThemedText variant="sm" color={Colors.textSecondary}>Customer</ThemedText>

                <View style={styles.stats}>
                    <View style={styles.stat}>
                        <ThemedText variant="lg" weight="bold">12</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Reviews</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <ThemedText variant="lg" weight="bold">4.8</ThemedText>
                        <ThemedText variant="xs" color={Colors.textSecondary}>Rating</ThemedText>
                    </View>
                </View>

                <Button
                    label="Message"
                    leftIcon={<MessageSquare size={20} color={Colors.black} />}
                    onPress={() => router.push(`/chat/${id}`)}
                    style={styles.msgBtn}
                />
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        marginTop: Spacing.xl,
    },
    avatar: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: Spacing.md,
    },
    name: {
        marginBottom: 4,
    },
    stats: {
        flexDirection: 'row',
        marginTop: Spacing.xl,
        marginBottom: Spacing.xl,
        backgroundColor: Colors.surface,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        width: '100%',
        justifyContent: 'space-around',
    },
    stat: {
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    msgBtn: {
        width: '100%',
    }
});
