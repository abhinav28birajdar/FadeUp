import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

interface AvatarProps {
    url?: string | null;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    style?: StyleProp<ViewStyle>;
}

export function Avatar({ url, name, size = 'md', style }: AvatarProps) {
    const getDims = () => {
        switch (size) {
            case 'sm': return 32;
            case 'md': return 48;
            case 'lg': return 80;
        }
    };

    const getFontSize = () => {
        switch (size) {
            case 'sm': return 12;
            case 'md': return 18;
            case 'lg': return 32;
        }
    };

    const dim = getDims();
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

    if (url) {
        return (
            <Image
                source={{ uri: url }}
                style={[{ width: dim, height: dim, borderRadius: dim / 2, backgroundColor: Colors.surfaceElevated }, style as ImageStyle]}
            />
        );
    }

    return (
        <View style={[
            styles.container,
            { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: Colors.surfaceElevated },
            style
        ]}>
            <Text style={[Typography.h3, { fontSize: getFontSize(), color: Colors.primary }]}>
                {initials}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
});
