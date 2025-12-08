import { useTheme } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Text,
    TextInput,
    TextInputProps,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  icon,
  rightIcon,
  onRightIconPress,
  fullWidth = true,
  containerStyle,
  style,
  value,
  onChangeText,
  ...props
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: theme.spacing[4],
    };

    const fullWidthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...fullWidthStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.input.background,
      borderWidth: 1,
      borderColor: error
        ? theme.colors.error[500]
        : isFocused
        ? theme.colors.primary[500]
        : theme.colors.input.border,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing[4],
      minHeight: 52,
    };

    return {
      ...baseStyle,
      ...theme.shadows.sm,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: theme.typography.fontSize.base,
      lineHeight: theme.typography.lineHeight.base,
      color: theme.colors.text.primary,
      paddingVertical: theme.spacing[3],
      paddingHorizontal: icon ? theme.spacing[2] : 0,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: '600',
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing[2],
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.error[600],
      marginTop: theme.spacing[1],
    };
  };

  const getHintStyle = (): TextStyle => {
    return {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text.muted,
      marginTop: theme.spacing[1],
    };
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && <Text style={getLabelStyle()}>{label}</Text>}
      
      <View style={getInputContainerStyle()}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.text.muted}
            style={{ marginRight: theme.spacing[2] }}
          />
        )}
        
        <TextInput
          style={[getInputStyle(), style]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.input.placeholder}
          selectionColor={theme.colors.primary[500]}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} disabled={!onRightIconPress}>
            <Ionicons
              name={rightIcon}
              size={20}
              color={theme.colors.text.muted}
              style={{ marginLeft: theme.spacing[2] }}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {error && <Text style={getErrorStyle()}>{error}</Text>}
      {hint && !error && <Text style={getHintStyle()}>{hint}</Text>}
    </View>
  );
};

export default Input;