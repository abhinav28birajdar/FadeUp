import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#CB9C5E',
  message = 'Loading...'
}) => {
  return (
    <View className="flex-1 bg-dark-background justify-center items-center">
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="items-center"
      >
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text className="text-secondary-light mt-4 text-center">
            {message}
          </Text>
        )}
      </MotiView>
    </View>
  );
};

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <View className="flex-1 justify-center items-center p-6">
      <MotiView
        from={{ opacity: 0, translateY: 20 }}
        animate={{ opacity: 1, translateY: 0 }}
        className="items-center"
      >
        <View className="w-20 h-20 bg-gray-700/30 rounded-full items-center justify-center mb-6">
          <Ionicons name={icon as any} size={40} color="#A1A1AA" />
        </View>
        
        <Text className="text-primary-light text-xl font-bold mb-2 text-center">
          {title}
        </Text>
        
        <Text className="text-secondary-light text-center mb-6 leading-6">
          {description}
        </Text>
        
        {actionText && onAction && (
          <Pressable
            onPress={onAction}
            className="bg-brand-primary px-6 py-3 rounded-xl"
          >
            <Text className="text-dark-background font-semibold">
              {actionText}
            </Text>
          </Pressable>
        )}
      </MotiView>
    </View>
  );
};
