import React from 'react';
import { StyleSheet, View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Avatar } from '../../components/ui/Avatar';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';

const CHATS = [
    { id: '1', name: 'Fade Masters', message: 'Your appointment is confirmed!', time: '10:30 AM', unread: 2, avatar: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=100' },
    { id: '2', name: 'Alex Barber', message: 'Hey due, running 5 mins late.', time: 'Yesterday', unread: 0, avatar: 'https://i.pravatar.cc/150?u=alex' },
];

export default function ChatListScreen() {
    const router = useRouter();

    const renderItem = ({ item }: { item: typeof CHATS[0] }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => router.push(`/chat/${item.id}`)}
        >
            <Avatar source={item.avatar} size={50} />
            <View style={styles.chatContent}>
                <View style={styles.topRow}>
                    <ThemedText variant="md" weight="bold">{item.name}</ThemedText>
                    <ThemedText variant="xs" color={Colors.textTertiary}>{item.time}</ThemedText>
                </View>
                <View style={styles.bottomRow}>
                    <ThemedText variant="sm" color={item.unread ? Colors.text : Colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
                        {item.message}
                    </ThemedText>
                    {item.unread > 0 && (
                        <View style={styles.badge}>
                            <ThemedText variant="xs" color={Colors.black} weight="bold">{item.unread}</ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <Container>
            <View style={styles.header}>
                <ThemedText variant="xxl" weight="bold">Messages</ThemedText>
            </View>
            <FlatList
                data={CHATS}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
    },
    list: {
        paddingBottom: Spacing.xl,
    },
    chatItem: {
        flexDirection: 'row',
        padding: Spacing.md,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.surface, // subtle separator
    },
    chatContent: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        height: 20,
        minWidth: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
        marginLeft: 8,
    }
});
