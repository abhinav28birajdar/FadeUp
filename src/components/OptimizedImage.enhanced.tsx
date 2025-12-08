import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage, ImageContentFit, ImageSource } from 'expo-image';
import React, { memo, useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../theme';

interface OptimizedImageProps {
  source: ImageSource;
  style?: ViewStyle;
  contentFit?: ImageContentFit;
  placeholder?: string;
  cachePolicy?: 'memory' | 'disk' | 'memory-disk';
  transition?: number;
  priority?: 'low' | 'normal' | 'high';
  onLoad?: () => void;
  onError?: (error: any) => void;
}

export const OptimizedImage = memo<OptimizedImageProps>(
  ({
    source,
    style,
    contentFit = 'cover',
    placeholder,
    cachePolicy = 'memory-disk',
    transition = 300,
    priority = 'normal',
    onLoad,
    onError,
  }) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const handleLoad = useCallback(() => {
      setLoading(false);
      setError(false);
      onLoad?.();
    }, [onLoad]);

    const handleError = useCallback(
      (err: any) => {
        setLoading(false);
        setError(true);
        onError?.(err);
      },
      [onError]
    );

    if (error) {
      return (
        <View style={[styles.errorContainer, style, { backgroundColor: theme.colors.neutral[100] }]}>
          <Ionicons name="image-outline" size={32} color={theme.colors.text.muted} />
        </View>
      );
    }

    return (
      <View style={[styles.container, style]}>
        <ExpoImage
          source={source}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          placeholder={placeholder}
          cachePolicy={cachePolicy}
          transition={transition}
          priority={priority}
          onLoad={handleLoad}
          onError={handleError}
        />
        {loading && (
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            style={[
              StyleSheet.absoluteFill,
              styles.loadingContainer,
              { backgroundColor: theme.colors.neutral[100] },
            ]}
          >
            <ActivityIndicator size="small" color={theme.colors.primary[500]} />
          </Animated.View>
        )}
      </View>
    );
  }
);

OptimizedImage.displayName = 'OptimizedImage';

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
