import React from 'react';
import {
    ActivityIndicator,
    Text,
    TextStyle,
    TouchableOpacity,
    TouchableOpacityProps,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  children,
  ...props
}) => {
  const theme = useTheme();
  const isDisabled = disabled || loading;

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: variant === 'outline' ? 1.5 : 0,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing[3],
        paddingVertical: theme.spacing[2],
        minHeight: 36,
      },
      md: {
        paddingHorizontal: theme.spacing[4],
        paddingVertical: theme.spacing[3],
        minHeight: 44,
      },
      lg: {
        paddingHorizontal: theme.spacing[6],
        paddingVertical: theme.spacing[4],
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<ButtonVariant, ViewStyle> = {
      primary: {
        backgroundColor: isDisabled ? theme.colors.gray[300] : theme.colors.primary[600],
        borderColor: 'transparent',
      },
      secondary: {
        backgroundColor: isDisabled ? theme.colors.gray[300] : theme.colors.secondary[600],
        borderColor: 'transparent',
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: isDisabled ? theme.colors.gray[300] : theme.colors.primary[600],
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: isDisabled ? theme.colors.gray[300] : theme.colors.error[600],
        borderColor: 'transparent',
      },
    };

    const fullWidthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...fullWidthStyle,
      opacity: isDisabled ? 0.6 : 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      sm: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.sm,
      },
      md: {
        fontSize: theme.typography.fontSize.base,
        lineHeight: theme.typography.lineHeight.base,
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
        lineHeight: theme.typography.lineHeight.lg,
      },
    };

    const variantTextColors: Record<ButtonVariant, string> = {
      primary: theme.colors.text.inverse,
      secondary: theme.colors.text.inverse,
      outline: isDisabled ? theme.colors.gray[400] : theme.colors.primary[600],
      ghost: isDisabled ? theme.colors.gray[400] : theme.colors.primary[600],
      danger: theme.colors.text.inverse,
    };

    return {
      ...sizeStyles[size],
      color: variantTextColors[variant],
      fontWeight: '600',
      textAlign: 'center',
      fontFamily: theme.typography.fontFamily.semibold,
    };
  };

  const getLoaderColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return theme.colors.primary[600];
    }
    return theme.colors.text.inverse;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={getLoaderColor()}
          style={{ marginRight: theme.spacing[2] }}
        />
      )}
      {!loading && <Text style={getTextStyle()}>{children}</Text>}
      {loading && <Text style={getTextStyle()}>{children}</Text>}
    </TouchableOpacity>
  );
};

export default Button;
      ...disabledStyle,
      ...fullWidthStyle,
      ...theme.shadows.sm,
    };
  };

  const getTextStyle = (): TextStyle => {
    const sizeStyles = {
      sm: {
        fontSize: theme.typography.fontSize.sm,
        lineHeight: theme.typography.lineHeight.sm,
      },
      md: {
        fontSize: theme.typography.fontSize.base,
        lineHeight: theme.typography.lineHeight.base,
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
        lineHeight: theme.typography.lineHeight.lg,
      },
    };

    const variantTextColors = {
      primary: theme.colors.text.inverse,
      secondary: theme.colors.text.inverse,
      outline: theme.colors.text.primary,
      ghost: theme.colors.primary[600],
      danger: theme.colors.text.inverse,
      destructive: theme.colors.text.inverse,
    };

    return {
      ...sizeStyles[size],
      color: variantTextColors[variant],
      fontWeight: '600',
      textAlign: 'center',
    };
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.colors.primary[600] : theme.colors.text.inverse}
          style={{ marginRight: theme.spacing[2] }}
        />
      )}
      <Text style={getTextStyle()}>{children}</Text>
    </TouchableOpacity>
  );
};

export default Button;