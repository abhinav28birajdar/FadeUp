import { MotiView } from 'moti';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  pressed?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  className = '',
  delay = 0,
  pressed = false,
  style,
}) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ 
        opacity: 1, 
        translateY: 0,
        scale: pressed ? 0.98 : 1,
      }}
      transition={{ 
        opacity: { type: 'timing', duration: 400, delay },
        translateY: { type: 'timing', duration: 400, delay },
        scale: { type: 'timing', duration: 150 },
      }}
      style={[
        {
          backgroundColor: '#27272A',
          borderRadius: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 1,
          borderColor: '#52525B',
          padding: 24,
        },
        style,
      ]}
      className={`bg-dark-card rounded-2xl shadow-xl border border-dark-border p-6 ${className}`}
    >
      {children}
    </MotiView>
  );
};
