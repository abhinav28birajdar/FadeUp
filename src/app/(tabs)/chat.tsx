import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ChatRoom } from '../../types/firestore.types';
import { chatService } from '../../services/chat.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Avatar } from '../../components/ui/Avatar';
import { formatTime } from '../../utils/dateHelpers';
import { MessageSquare } from 'lucide-react-native';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ChatScreen() {
    const router = useRouter();
    const { user } = useAuthContext();
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const unsub = chatService.subscribeToChatRooms(user.uid, (data) => {
            setRooms(data);
            setIsLoading(false);
        });
        return () => unsub();
    }, [user]);

    const renderItem = ({ item }: { item: ChatRoom }) => {
        if (!user) return null;
        const partnerId = item.participantIds.find(id => id !== user.uid) || item.participantIds[0];
        const partnerName = item.participantNames[partnerId] || 'Unknown';
        const partnerPhoto = item.participantPhotos[partnerId];
        const unreadCount = item.unreadCount[user.uid] || 0;

        return (
            <TouchableOpacity
                style={styles.roomItem}
                onPress={() => router.push(`/chat/${item.id}`)}
                activeOpacity={0.7}
            >
                <Avatar name={partnerName} url={partnerPhoto} size="md" />
                <View style={styles.roomInfo}>
                    <View style={styles.roomHeader}>
                        <Text style={[Typography.h4, { color: Colors.text }]} numberOfLines={1}>{partnerName}</Text>
                        {item.lastMessageAt && (
                            <Text style={[Typography.caption, { color: Colors.textMuted }]}>{formatTime(item.lastMessageAt)}</Text>
                        )}
                    </View>
                    <View style={styles.roomFooter}>
                        <Text
                            style={[Typography.bodySmall, { color: unreadCount > 0 ? Colors.text : Colors.textSecondary, flex: 1 }]}
                            numberOfLines={1}
                        >
                            {item.lastMessage || 'Sent an image'}
                        </Text>
                        {unreadCount > 0 && (
                            <View style={styles.unreadBadge}>
                                <Text style={[Typography.caption, { color: Colors.background, fontWeight: 'bold' }]}>{unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title="Messages" showBack={false} />

            <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                renderItem={renderItem}
                ListEmptyComponent={() => (
                    !isLoading ? (
                        <EmptyState
                            icon={<MessageSquare size={48} color={Colors.textMuted} />}
                            title="No conversations yet"
                            description="When you message a shop, it will appear here."
                        />
                    ) : null
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    list: {
        padding: Spacing.xl,
        flexGrow: 1,
    },
    roomItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    roomInfo: {
        flex: 1,
        marginLeft: Spacing.md,
    },
    roomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    roomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    unreadBadge: {
        backgroundColor: Colors.primary,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        marginLeft: Spacing.sm,
    },
});
