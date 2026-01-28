import React, { useState } from 'react';
import { StyleSheet, View, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container } from '../../components/ui/Container';
import { ThemedText } from '../../components/ui/ThemedText';
import { Colors } from '../../constants/colors';
import { Spacing, BorderRadius } from '../../constants/spacing';
import { Send, MoveLeft, MoreVertical } from 'lucide-react-native';

const MESSAGES = [
    { id: '1', text: 'Hi! Is my appointment confirmed?', time: '10:00 AM', sender: 'me' },
    { id: '2', text: 'Yes, looking forward to seeing you!', time: '10:05 AM', sender: 'them' },
];

export default function ChatRoomScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState(MESSAGES);

    const handleSend = () => {
        if (!message) return;
        setMessages([...messages, { id: Date.now().toString(), text: message, time: 'Now', sender: 'me' }]);
        setMessage('');
    };

    const renderItem = ({ item }: { item: typeof MESSAGES[0] }) => {
        const isMe = item.sender === 'me';
        return (
            <View style={[styles.bubbleWrapper, isMe ? styles.myBubbleWrapper : styles.theirBubbleWrapper]}>
                <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
                    <ThemedText color={isMe ? Colors.black : Colors.text}>{item.text}</ThemedText>
                </View>
                <ThemedText variant="xs" color={Colors.textTertiary} style={styles.time}>{item.time}</ThemedText>
            </View>
        );
    };

    return (
        <Container padding={false}>
            {/* Custom Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <MoveLeft size={24} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.headerInfo}>
                    <ThemedText variant="lg" weight="bold">Fade Masters</ThemedText>
                    <ThemedText variant="xs" color={Colors.success}>Online</ThemedText>
                </View>
                <TouchableOpacity>
                    <MoreVertical size={24} color={Colors.text} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={messages}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Type a message..."
                        placeholderTextColor={Colors.textTertiary}
                        value={message}
                        onChangeText={setMessage}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
                        <Send size={20} color={Colors.black} />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Container>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    backBtn: {
        marginRight: Spacing.md,
    },
    headerInfo: {
        flex: 1,
    },
    list: {
        padding: Spacing.md,
    },
    bubbleWrapper: {
        marginBottom: Spacing.md,
        maxWidth: '80%',
    },
    myBubbleWrapper: {
        alignSelf: 'flex-end',
        alignItems: 'flex-end',
    },
    theirBubbleWrapper: {
        alignSelf: 'flex-start',
        alignItems: 'flex-start',
    },
    bubble: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    myBubble: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 0,
    },
    theirBubble: {
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 0,
    },
    time: {
        marginTop: 4,
        marginHorizontal: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: Spacing.md,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 10,
        color: Colors.text,
        marginRight: Spacing.md,
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
