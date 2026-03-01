import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { ChatMessage } from '../../types/firestore.types';
import { formatTime } from '../../utils/dateHelpers';

interface ChatBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
}

export const ChatBubble = React.memo(({ message, isOwn }: ChatBubbleProps) => {
    return (
        <View style={[styles.container, isOwn ? styles.sentContainer : styles.receivedContainer]}>
            <View style={[styles.bubble, isOwn ? styles.sentBubble : styles.receivedBubble]}>
                {message.imageURL ? (
                    <Image source={{ uri: message.imageURL }} style={styles.image} resizeMode="cover" />
                ) : null}

                {message.text ? (
                    <Text style={[Typography.body, { color: isOwn ? Colors.black : Colors.text, marginTop: message.imageURL ? Spacing.sm : 0 }]}>
                        {message.text}
                    </Text>
                ) : null}
            </View>

            <Text style={[Typography.caption, styles.timestamp, { color: Colors.textMuted }]}>
                {formatTime(message.createdAt)}
            </Text>
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
        maxWidth: '80%',
    },
    sentContainer: {
        alignSelf: 'flex-end',
    },
    receivedContainer: {
        alignSelf: 'flex-start',
    },
    bubble: {
        padding: Spacing.md,
        borderRadius: Spacing.borderRadius.lg,
    },
    sentBubble: {
        backgroundColor: Colors.primary,
        borderBottomRightRadius: 4,
    },
    receivedBubble: {
        backgroundColor: Colors.surfaceElevated,
        borderBottomLeftRadius: 4,
    },
    image: {
        width: 200,
        height: 150,
        borderRadius: Spacing.borderRadius.sm,
    },
    timestamp: {
        marginTop: 4,
        alignSelf: 'flex-end',
    },
});
