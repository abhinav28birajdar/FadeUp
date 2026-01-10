/**
 * ListItem Component
 * Versatile list item with various configurations
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  description?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  leftComponent?: React.ReactNode;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightText?: string;
  rightComponent?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  description,
  leftIcon,
  leftIconColor,
  leftComponent,
  rightIcon,
  rightText,
  rightComponent,
  showChevron = false,
  onPress,
  disabled = false,
  destructive = false,
  style,
}) => {
  const theme = useTheme();

  const titleColor = destructive
    ? theme.colors.error[600]
    : disabled
    ? theme.colors.text.muted
    : theme.colors.text.primary;

  const content = (
    <View style={[styles.container, style]}>
      {/* Left side */}
      {(leftIcon || leftComponent) && (
        <View style={styles.leftContainer}>
          {leftComponent || (
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor: leftIconColor
                    ? `${leftIconColor}15`
                    : theme.colors.gray[100],
                },
              ]}
            >
              <Ionicons
                name={leftIcon!}
                size={20}
                color={leftIconColor || theme.colors.text.secondary}
              />
            </View>
          )}
        </View>
      )}

      {/* Center content */}
      <View style={styles.contentContainer}>
        <Text
          style={[styles.title, { color: titleColor, fontSize: 16 }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.text.secondary, fontSize: 14 },
            ]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
        {description && (
          <Text
            style={[
              styles.description,
              { color: theme.colors.text.muted, fontSize: 13 },
            ]}
            numberOfLines={2}
          >
            {description}
          </Text>
        )}
      </View>

      {/* Right side */}
      <View style={styles.rightContainer}>
        {rightComponent}
        {rightText && !rightComponent && (
          <Text
            style={[
              styles.rightText,
              { color: theme.colors.text.muted, fontSize: 14 },
            ]}
          >
            {rightText}
          </Text>
        )}
        {rightIcon && !rightComponent && (
          <Ionicons
            name={rightIcon}
            size={20}
            color={theme.colors.text.muted}
          />
        )}
        {showChevron && !rightComponent && !rightIcon && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.text.muted}
          />
        )}
      </View>
    </View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

/**
 * ListItem with Switch
 */
interface SwitchListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const SwitchListItem: React.FC<SwitchListItemProps> = ({
  title,
  subtitle,
  leftIcon,
  leftIconColor,
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  return (
    <ListItem
      title={title}
      subtitle={subtitle}
      leftIcon={leftIcon}
      leftIconColor={leftIconColor}
      disabled={disabled}
      style={style}
      rightComponent={
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: theme.colors.gray[300],
            true: theme.colors.primary[400],
          }}
          thumbColor={value ? theme.colors.primary[600] : theme.colors.gray[50]}
        />
      }
    />
  );
};

/**
 * Section Header for grouped list items
 */
interface ListSectionHeaderProps {
  title: string;
  rightAction?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const ListSectionHeader: React.FC<ListSectionHeaderProps> = ({
  title,
  rightAction,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.sectionHeader, style]}>
      <Text
        style={[
          styles.sectionTitle,
          { color: theme.colors.text.secondary, fontSize: 13 },
        ]}
      >
        {title.toUpperCase()}
      </Text>
      {rightAction && (
        <TouchableOpacity onPress={rightAction.onPress}>
          <Text
            style={[
              styles.sectionAction,
              { color: theme.colors.primary[500], fontSize: 13 },
            ]}
          >
            {rightAction.label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Divider for list items
 */
interface ListDividerProps {
  inset?: boolean;
  style?: ViewStyle;
}

export const ListDivider: React.FC<ListDividerProps> = ({ inset = false, style }) => {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: theme.colors.border,
          marginLeft: inset ? 56 : 0,
        },
        style,
      ]}
    />
  );
};

/**
 * Empty State for lists
 */
interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'folder-open-outline',
  title,
  description,
  action,
  style,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.emptyContainer, style]}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: theme.colors.gray[100] },
        ]}
      >
        <Ionicons name={icon} size={48} color={theme.colors.text.muted} />
      </View>
      <Text
        style={[
          styles.emptyTitle,
          { color: theme.colors.text.primary, fontSize: 18 },
        ]}
      >
        {title}
      </Text>
      {description && (
        <Text
          style={[
            styles.emptyDescription,
            { color: theme.colors.text.secondary, fontSize: 14 },
          ]}
        >
          {description}
        </Text>
      )}
      {action && (
        <TouchableOpacity
          onPress={action.onPress}
          style={[
            styles.emptyAction,
            { backgroundColor: theme.colors.primary[500] },
          ]}
        >
          <Text style={styles.emptyActionText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  leftContainer: {
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '500',
  },
  subtitle: {
    marginTop: 2,
  },
  description: {
    marginTop: 4,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  rightText: {
    marginRight: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  sectionAction: {
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyAction: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ListItem;
