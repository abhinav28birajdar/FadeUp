import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'text' | 'circular' | 'rectangular';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius,
  variant = 'rectangular',
}) => {
  const theme = useTheme();
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyles = () => {
    switch (variant) {
      case 'text':
        return {
          height: height,
          borderRadius: theme.borderRadius.sm,
        };
      case 'circular':
        return {
          width: height,
          height: height,
          borderRadius: height / 2,
        };
      case 'rectangular':
        return {
          height: height,
          borderRadius: borderRadius || theme.borderRadius.md,
        };
      default:
        return {
          height: height,
          borderRadius: theme.borderRadius.md,
        };
    }
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          backgroundColor: theme.isDark ? theme.colors.gray[700] : theme.colors.gray[200],
          opacity,
        },
        getVariantStyles(),
      ]}
    />
  );
};

export const SkeletonGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <View style={styles.group}>{children}</View>;
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  group: {
    gap: 12,
  },
});
