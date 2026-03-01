import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { QueueEntry } from '../../types/firestore.types';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Card } from './Card';
import { formatWaitTime } from '../../utils/formatters';

interface QueueCardProps {
    entry: QueueEntry;
    onStart?: () => void;
    onComplete?: () => void;
    onCancel?: () => void;
    isProvider?: boolean;
}

export const QueueCard = React.memo(({ entry, onStart, onComplete, onCancel, isProvider = false }: QueueCardProps) => {
    return (
        <Card style={styles.container} elevated={entry.status === 'in_progress'}>
            <View style={styles.content}>
                <View style={styles.positionBadge}>
                    <Text style={[Typography.h3, { color: Colors.black }]}>#{entry.position}</Text>
                </View>

                <View style={styles.info}>
                    <Text style={[Typography.h4, { color: Colors.text }]} numberOfLines={1}>
                        {entry.customerName}
                    </Text>
                    <Text style={[Typography.bodySmall, { color: Colors.textSecondary }]} numberOfLines={1}>
                        {entry.serviceName}
                    </Text>
                    <Text style={[Typography.caption, { color: Colors.primary, marginTop: Spacing.xs }]}>
                        {entry.status === 'in_progress' ? 'IN PROGRESS' : `Wait: ${formatWaitTime(entry.estimatedWaitMinutes)}`}
                    </Text>
                </View>

                <Avatar url={entry.customerPhotoURL} name={entry.customerName} size="md" />
            </View>

            {isProvider && (
                <View style={styles.actions}>
                    {entry.status === 'waiting' && (
                        <>
                            <Button label="Skip" variant="ghost" size="sm" onPress={onCancel} style={{ flex: 1, marginRight: Spacing.sm }} />
                            <Button label="Start Service" variant="primary" size="sm" onPress={onStart} style={{ flex: 2 }} />
                        </>
                    )}
                    {entry.status === 'in_progress' && (
                        <Button label="Complete" variant="primary" size="sm" onPress={onComplete} style={{ flex: 1 }} />
                    )}
                </View>
            )}
        </Card>
    );
});

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    positionBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    info: {
        flex: 1,
        marginRight: Spacing.md,
    },
    actions: {
        flexDirection: 'row',
        marginTop: Spacing.md,
        borderTopWidth: 1,
        borderColor: Colors.border,
        paddingTop: Spacing.md,
    }
});
