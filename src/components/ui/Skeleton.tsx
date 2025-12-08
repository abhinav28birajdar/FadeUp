import { useTheme } from '@/src/theme';
import React, { memo } from 'react';
import { DimensionValue, View, ViewStyle } from 'react-native';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

const Skeleton: React.FC<SkeletonProps> = memo(({
  width = '100%',
  height = 20,
  borderRadius,
  style
}) => {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: theme.colors.secondary[200],
          borderRadius: borderRadius ?? theme.borderRadius.sm,
        },
        style,
      ]}
    />
  );
});

export const SkeletonCard: React.FC = memo(() => {
  const theme = useTheme();
  
  return (
    <View style={{ 
      padding: theme.spacing[4], 
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing[4],
    }}>
      <View style={{ flexDirection: 'row', marginBottom: theme.spacing[3] }}>
        <Skeleton width={60} height={60} borderRadius={theme.borderRadius.lg} />
        <View style={{ marginLeft: theme.spacing[3], flex: 1 }}>
          <Skeleton height={20} style={{ marginBottom: theme.spacing[2] }} />
          <Skeleton height={16} width="60%" />
        </View>
      </View>
      <Skeleton height={16} style={{ marginBottom: theme.spacing[2] }} />
      <Skeleton height={16} width="80%" />
    </View>
  );
});

export const SkeletonList: React.FC<{ count?: number }> = memo(({ count = 3 }) => {
  return (
    <View>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </View>
  );
});

export default Skeleton;