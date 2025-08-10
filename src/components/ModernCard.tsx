import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  pressed?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  shimmer?: boolean;
  elevation?: 'low' | 'medium' | 'high';
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  delay = 0,
  pressed = false,
  style,
  onPress,
  shimmer = false,
  elevation = 'medium',
}) => {
  const [isPressing, setIsPressing] = useState(false);
  const isActive = pressed || isPressing;
  
  // Define elevation styles
  const elevationStyles = {
    low: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 3,
    },
    medium: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 6,
    },
    high: {
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    }
  };

  const Card = (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ 
        opacity: 1, 
        translateY: 0,
        scale: isActive ? 0.98 : 1,
      }}
      transition={{ 
        delay
      }}
      style={[
        {
          backgroundColor: '#27272A',
          borderRadius: 16,
          shadowColor: '#000',
          ...elevationStyles[elevation],
          borderWidth: 1,
          borderColor: isActive ? '#8B5CF6' : '#52525B',
          overflow: 'hidden',
          padding: 24,
        },
        style,
      ]}
      className={`bg-dark-card rounded-2xl shadow-xl border border-dark-border p-6 ${className}`}
    >
      {shimmer && (
        <MotiView
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            overflow: 'hidden',
          }}
        >
          <MotiView
            from={{ translateX: -300 }}
            animate={{ translateX: 300 }}
            transition={{
              loop: true,
              delay: 1000
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
              colors={['transparent', 'rgba(255,255,255,0.05)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ skewX: '45deg' }],
              }}
            />
          </MotiView>
        </MotiView>
      )}
      {children}
    </MotiView>
  );
  
  if (onPress) {
    return (
      <Pressable
        onPressIn={() => setIsPressing(true)}
        onPressOut={() => setIsPressing(false)}
        onPress={onPress}
      >
        {Card}
      </Pressable>
    );
  }
  
  return Card;
};
