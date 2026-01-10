/**
 * Avatar Component
 * Displays user profile images with fallback initials
 */

import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: AvatarSize;
  style?: ViewStyle;
  showOnlineStatus?: boolean;
  isOnline?: boolean;
}

const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
  '2xl': 120,
};

const fontSizeMap: Record<AvatarSize, number> = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 20,
  xl: 28,
  '2xl': 40,
};

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  style,
  showOnlineStatus = false,
  isOnline = false,
}) => {
  const theme = useTheme();
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getBackgroundColor = (name: string): string => {
    const colors = [
      theme.colors.primary[500],
      theme.colors.secondary[500],
      '#10B981', // emerald
      '#8B5CF6', // violet
      '#F59E0B', // amber
      '#EC4899', // pink
      '#06B6D4', // cyan
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: dimension / 2,
    overflow: 'hidden',
    backgroundColor: name ? getBackgroundColor(name) : theme.colors.gray[300],
    alignItems: 'center',
    justifyContent: 'center',
  };

  const statusIndicatorSize = dimension * 0.25;
  const statusStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: statusIndicatorSize,
    height: statusIndicatorSize,
    borderRadius: statusIndicatorSize / 2,
    backgroundColor: isOnline ? theme.colors.success[500] : theme.colors.gray[400],
    borderWidth: 2,
    borderColor: theme.colors.background,
  };

  return (
    <View style={[{ position: 'relative' }, style]}>
      <View style={containerStyle}>
        {source ? (
          <Image
            source={{ uri: source }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : name ? (
          <Text
            style={{
              fontSize,
              fontWeight: '600',
              color: '#FFFFFF',
            }}
          >
            {getInitials(name)}
          </Text>
        ) : null}
      </View>
      {showOnlineStatus && <View style={statusStyle} />}
    </View>
  );
};

export default Avatar;
