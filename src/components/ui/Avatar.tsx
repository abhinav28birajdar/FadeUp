import React from 'react';
import { Image, ImageStyle, StyleProp, View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { ThemedText } from './ThemedText';
import { User } from 'lucide-react-native';

interface AvatarProps {
    source?: string | { uri: string };
    size?: number;
    name?: string; // For initials if no image
    style?: StyleProp<ImageStyle>;
}

export function Avatar({ source, size = 48, name, style }: AvatarProps) {
    const borderRadius = size / 2;
    const fontSize = size * 0.4;

    if (source) {
        return (
            <Image
                source={typeof source === 'string' ? { uri: source } : source}
                style={[
                    { width: size, height: size, borderRadius },
                    style
                ]}
            />
        );
    }

    return (
        <View
            style={[
                styles.placeholder,
                { width: size, height: size, borderRadius },
                style
            ]}
        >
            {name ? (
                <ThemedText style={{ fontSize, color: Colors.primary, fontWeight: 'bold' }}>
                    {name.charAt(0).toUpperCase()}
                </ThemedText>
            ) : (
                <User size={size * 0.6} color={Colors.primary} />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    placeholder: {
        backgroundColor: Colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    }
});
