/**
 * Badge Component
 * Status indicators and count badges
 */

import React from 'react';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  count?: number;
  maxCount?: number;
  dot?: boolean;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  count,
  maxCount = 99,
  dot = false,
  style,
}) => {
  const theme = useTheme();

  const getContainerStyle = (): ViewStyle => {
    const sizeStyles: Record<BadgeSize, ViewStyle> = {
      sm: {
        paddingHorizontal: dot ? 0 : 6,
        paddingVertical: dot ? 0 : 2,
        minWidth: dot ? 8 : 16,
        height: dot ? 8 : 16,
        borderRadius: dot ? 4 : 8,
      },
      md: {
        paddingHorizontal: dot ? 0 : 8,
        paddingVertical: dot ? 0 : 3,
        minWidth: dot ? 10 : 20,
        height: dot ? 10 : 20,
        borderRadius: dot ? 5 : 10,
      },
      lg: {
        paddingHorizontal: dot ? 0 : 10,
        paddingVertical: dot ? 0 : 4,
        minWidth: dot ? 12 : 24,
        height: dot ? 12 : 24,
        borderRadius: dot ? 6 : 12,
      },
    };

    const variantStyles: Record<BadgeVariant, ViewStyle> = {
      default: {
        backgroundColor: theme.colors.gray[200],
      },
      primary: {
        backgroundColor: theme.colors.primary[500],
      },
      success: {
        backgroundColor: theme.colors.success[500],
      },
      warning: {
        backgroundColor: theme.colors.warning[500],
      },
      error: {
        backgroundColor: theme.colors.error[500],
      },
      info: {
        backgroundColor: theme.colors.primary[400],
      },
    };

    return {
      alignItems: 'center',
      justifyContent: 'center',
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles: Record<BadgeSize, TextStyle> = {
      sm: { fontSize: 10, lineHeight: 12 },
      md: { fontSize: 12, lineHeight: 14 },
      lg: { fontSize: 14, lineHeight: 16 },
    };

    return {
      ...sizeStyles[size],
      fontWeight: '600',
      color: variant === 'default' ? theme.colors.text.primary : '#FFFFFF',
      textAlign: 'center',
    };
  };

  const displayCount = count !== undefined 
    ? (count > maxCount ? `${maxCount}+` : count.toString())
    : null;

  if (dot) {
    return <View style={[getContainerStyle(), style]} />;
  }

  return (
    <View style={[getContainerStyle(), style]}>
      {displayCount !== null ? (
        <Text style={getTextStyle()}>{displayCount}</Text>
      ) : children ? (
        typeof children === 'string' ? (
          <Text style={getTextStyle()}>{children}</Text>
        ) : (
          children
        )
      ) : null}
    </View>
  );
};

/**
 * Status Badge - For displaying status labels
 */
interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

const statusVariantMap: Record<string, BadgeVariant> = {
  // Booking statuses
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'error',
  no_show: 'error',
  // Queue statuses
  waiting: 'warning',
  serving: 'primary',
  active: 'success',
  done: 'success',
  // Shop statuses
  open: 'success',
  closed: 'error',
  // General
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const statusLabelMap: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
  waiting: 'Waiting',
  serving: 'Serving',
  active: 'Active',
  done: 'Done',
  open: 'Open',
  closed: 'Closed',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  size = 'sm',
  style,
}) => {
  const resolvedVariant = variant || statusVariantMap[status.toLowerCase()] || 'default';
  const label = statusLabelMap[status.toLowerCase()] || status;

  return (
    <Badge variant={resolvedVariant} size={size} style={style}>
      {label}
    </Badge>
  );
};

export default Badge;
