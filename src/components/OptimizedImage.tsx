import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/src/theme';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, ImageSourcePropType, ImageStyle, View } from 'react-native';

interface OptimizedImageProps {
  source: ImageSourcePropType;
  style?: ImageStyle;
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  accessibilityLabel?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = React.memo(({
  source,
  style,
  placeholder,
  fallback,
  onLoad,
  onError,
  resizeMode = 'cover',
  accessibilityLabel
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = useCallback(() => {
    setLoading(false);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((err: any) => {
    setLoading(false);
    setError(true);
    onError?.(err);
  }, [onError]);

  const defaultPlaceholder = (
    <View style={[
      style,
      {
        backgroundColor: theme.colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
      }
    ]}>
      <ActivityIndicator 
        size="small" 
        color={theme.colors.primary[500]} 
      />
    </View>
  );

  const defaultFallback = (
    <View style={[
      style,
      {
        backgroundColor: theme.colors.neutral[100],
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 100,
      }
    ]}>
      <ThemedText variant="caption" color="muted">
        Image not available
      </ThemedText>
    </View>
  );

  if (error) {
    return fallback || defaultFallback;
  }

  return (
    <View style={{ position: 'relative' }}>
      <Image
        source={source}
        style={style}
        resizeMode={resizeMode}
        onLoad={handleLoad}
        onError={handleError}
        accessibilityLabel={accessibilityLabel}
      />
      {loading && (
        <View style={[
          style,
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }
        ]}>
          {placeholder || defaultPlaceholder}
        </View>
      )}
    </View>
  );
});

export default OptimizedImage;