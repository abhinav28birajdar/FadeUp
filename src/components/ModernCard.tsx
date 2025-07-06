import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';

interface ModernCardProps {
  children: React.ReactNode;
  delay?: number;
  pressed?: boolean;
  style?: ViewStyle;
}

export default function ModernCard({
  children,
  delay = 0,
  pressed = false,
  style,
}: ModernCardProps) {
  return (
    <MotiView
      style={[styles.card, style]}
      from={{ opacity: 0, translateY: 20 }}
      animate={{ 
        opacity: 1, 
        translateY: 0,
        scale: pressed ? 0.98 : 1,
      }}
      transition={{
        type: 'timing',
        duration: 400,
        delay,
        scale: {
          type: 'timing',
          duration: 100,
        }
      }}
    >
      {children}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
});