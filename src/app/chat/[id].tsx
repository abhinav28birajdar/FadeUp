import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';
import { ChatMessage, ChatRoom } from '../../types/firestore.types';
import { chatService } from '../../services/chat.service';
import { useAuthContext } from '../../context/AuthContext';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { ChatBubble } from '../../components/ui/ChatBubble';
import { Input } from '../../components/ui/Input';
import { Send, Image as ImageIcon } from 'lucide-react-native';
import { useImagePicker } from '../../hooks/useImagePicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams();
    const roomId = id as string;
    const { user } = useAuthContext();
    const { pickImage } = useImagePicker();
    const insets = useSafeAreaInsets();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [text, setText] = useState('');
    const [partnerName, setPartnerName] = useState('Chat');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        const unsub = chatService.subscribeToMessages(roomId, (data) => {
            setMessages(data);
        });

        chatService.markMessagesRead(roomId, user.uid);

        return () => unsub();
    }, [roomId, user]);

    // Simple focus listener mock
    useEffect(() => {
        if (!user) return;
        chatService.markMessagesRead(roomId, user.uid);
    }, [user, messages.length]);

    const handleSend = async () => {
        if (!user) return;

        if (selectedImage) {
            await chatService.sendImageMessage(roomId, user.uid, user.displayName, selectedImage);
            setSelectedImage(null);
            return;
        }

        if (text.trim()) {
            await chatService.sendMessage(roomId, user.uid, user.displayName, text.trim());
            setText('');
        }
    };

    const handlePickImage = async () => {
        const result = await pickImage();
        if (!result.canceled && result.assets && result.assets.length > 0) {
            setSelectedImage(result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            <ScreenHeader title={partnerName} />

            <KeyboardAvoidingView
                style={styles.keyboardView}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    contentContainerStyle={styles.list}
                    inverted
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <ChatBubble message={item} isOwn={item.senderId === user?.uid} />
                    )}
                />

                <View style={[styles.inputContainer, { paddingBottom: Math.max(insets.bottom, Spacing.md) }]}>
                    <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                        <ImageIcon size={24} color={selectedImage ? Colors.primary : Colors.textMuted} />
                    </TouchableOpacity>
                    <View style={styles.inputWrapper}>
                        <Input
                            placeholder="Type a message..."
                            value={text}
                            onChangeText={setText}
                            multiline
                            style={{ maxHeight: 100 }}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.sendBtn}
                        onPress={handleSend}
                        disabled={!text.trim() && !selectedImage}
                    >
                        <Send size={20} color={(text.trim() || selectedImage) ? Colors.primary : Colors.textMuted} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    keyboardView: { flex: 1 },
    list: { padding: Spacing.md, flexGrow: 1 },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: Colors.border
    },
    attachBtn: { padding: Spacing.sm },
    inputWrapper: { flex: 1, marginHorizontal: Spacing.sm, paddingBottom: 15 },
    sendBtn: {
        padding: Spacing.sm,
        backgroundColor: Colors.surfaceElevated,
        borderRadius: 20,
        width: 40, height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
});
