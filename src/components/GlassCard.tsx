// src/components/GlassCard.tsx
import React, { FC } from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../lib/utils'; // A utility to combine classNames, see below

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string; // Allow external tailwind classes to be passed
}

// Utility to conditionally join classNames (similar to clsx/classnames)
// src/lib/utils.ts
export function cn(...inputs: string[]) {
  return inputs.filter(Boolean).join(' ');
}


const GlassCard: FC<GlassCardProps> = ({ children, className, ...props }) => {
  return (
    <BlurView
      intensity={30} // Adjust intensity as needed for desired blur
      tint="light"   // 'light', 'dark', 'default'
      className={cn(
        "bg-white/30 rounded-xl shadow-lg p-4 m-2 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </BlurView>
  );
};

export default GlassCard;