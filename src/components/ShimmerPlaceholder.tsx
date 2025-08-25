import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';

interface ShimmerPlaceholderProps {
  width: DimensionValue;
  height: DimensionValue;
  className?: string;
  isLoading: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
  width,
  height,
  className = '',
  isLoading,
  children,
  style
}) => {
  if (!isLoading) {
    return children ? <>{children}</> : null;
  }

  return (
    <View
      className={`overflow-hidden bg-dark-border ${className}`}
      style={[{ width, height, borderRadius: 8 }, style]}
    >
      <MotiView
        from={{ translateX: typeof width === 'number' ? -width : -100 }}
        animate={{ translateX: typeof width === 'number' ? width : 100 }}
        transition={{
          duration: 1500,
          loop: true,
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            transform: [{ skewX: '-20deg' }],
          }}
        />
      </MotiView>
    </View>
  );
};
