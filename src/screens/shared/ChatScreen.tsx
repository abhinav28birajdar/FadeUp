/**
 * Chat/Messages Screen
 * Messaging between customers and barbers
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

interface ChatParticipant {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
}

const mockParticipant: ChatParticipant = {
  id: '1',
  name: "Mike's Barber Shop",
  avatar: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200',
  isOnline: true,
};

const currentUserId = 'current-user';

const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    text: 'Hi! Thanks for booking with us. Your appointment is confirmed for tomorrow at 2 PM.',
    timestamp: '10:30 AM',
    isRead: true,
  },
  {
    id: '2',
    senderId: currentUserId,
    text: "Great! I was wondering if I could get a fade haircut instead of the classic cut I booked?",
    timestamp: '10:32 AM',
    isRead: true,
  },
  {
    id: '3',
    senderId: '1',
    text: "Of course! I've updated your booking. The fade will be $5 extra, is that okay?",
    timestamp: '10:35 AM',
    isRead: true,
  },
  {
    id: '4',
    senderId: currentUserId,
    text: "That's fine! Thank you so much.",
    timestamp: '10:36 AM',
    isRead: true,
  },
  {
    id: '5',
    senderId: '1',
    text: "Perfect! See you tomorrow. Don't forget to arrive 5 minutes early.",
    timestamp: '10:38 AM',
    isRead: true,
  },
  {
    id: '6',
    senderId: currentUserId,
    text: "Will do! By the way, do you have parking available?",
    timestamp: '2:15 PM',
    isRead: true,
  },
  {
    id: '7',
    senderId: '1',
    text: "Yes, we have free parking right behind the shop. Just look for the FadeUp sign!",
    timestamp: '2:20 PM',
    isRead: true,
  },
];

export const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState(mockMessages);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText('');

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.senderId === currentUserId;
    const showAvatar =
      !isOwnMessage &&
      (index === 0 || messages[index - 1].senderId === currentUserId);

    return (
      <View
        style={[
          styles.messageRow,
          isOwnMessage ? styles.ownMessageRow : styles.otherMessageRow,
        ]}
      >
        {!isOwnMessage && (
          <View style={styles.avatarSpace}>
            {showAvatar && (
              <Image
                source={{ uri: mockParticipant.avatar }}
                style={styles.messageAvatar}
              />
            )}
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isOwnMessage
                ? theme.colors.primary[500]
                : theme.colors.surface,
            },
            isOwnMessage ? styles.ownBubble : styles.otherBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isOwnMessage ? '#FFFFFF' : theme.colors.text.primary },
            ]}
          >
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.timestamp,
                {
                  color: isOwnMessage
                    ? 'rgba(255,255,255,0.7)'
                    : theme.colors.text.muted,
                },
              ]}
            >
              {item.timestamp}
            </Text>
            {isOwnMessage && (
              <Ionicons
                name={item.isRead ? 'checkmark-done' : 'checkmark'}
                size={14}
                color="rgba(255,255,255,0.7)"
                style={styles.readIcon}
              />
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={theme.colors.text.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerInfo}
          onPress={() => router.push(`/shop/${mockParticipant.id}`)}
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: mockParticipant.avatar }}
              style={styles.headerAvatar}
            />
            {mockParticipant.isOnline && (
              <View
                style={[
                  styles.onlineIndicator,
                  { borderColor: theme.colors.surface },
                ]}
              />
            )}
          </View>
          <View>
            <Text
              style={[styles.headerName, { color: theme.colors.text.primary }]}
            >
              {mockParticipant.name}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                {
                  color: mockParticipant.isOnline
                    ? theme.colors.success[500]
                    : theme.colors.text.muted,
                },
              ]}
            >
              {mockParticipant.isOnline
                ? 'Online'
                : `Last seen ${mockParticipant.lastSeen}`}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons
              name="call-outline"
              size={22}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons
              name="ellipsis-vertical"
              size={22}
              color={theme.colors.text.primary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* Input */}
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.surface,
            paddingBottom: insets.bottom + 8,
          },
        ]}
      >
        <TouchableOpacity style={styles.attachButton}>
          <Ionicons
            name="add-circle-outline"
            size={28}
            color={theme.colors.text.secondary}
          />
        </TouchableOpacity>
        <View
          style={[
            styles.inputWrapper,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <TextInput
            style={[styles.input, { color: theme.colors.text.primary }]}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.text.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity style={styles.emojiButton}>
            <Ionicons
              name="happy-outline"
              size={24}
              color={theme.colors.text.secondary}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim()
                ? theme.colors.primary[500]
                : theme.colors.neutral[200],
            },
          ]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim() ? '#FFFFFF' : theme.colors.text.muted}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerAction: {
    padding: 8,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ownMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  avatarSpace: {
    width: 32,
    marginRight: 8,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  attachButton: {
    padding: 4,
    marginBottom: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 8,
    minHeight: 44,
    maxHeight: 120,
  },
  input: {
    flex: 1,
    fontSize: 15,
    maxHeight: 100,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emojiButton: {
    padding: 4,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});

export default ChatScreen;
