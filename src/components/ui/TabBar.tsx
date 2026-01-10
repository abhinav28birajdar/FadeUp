/**
 * TabBar Component
 * Segmented control / Tab selector
 */

import React from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  scrollable?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  scrollable = false,
  fullWidth = true,
  style,
}) => {
  const theme = useTheme();
  const [indicatorWidth] = React.useState(new Animated.Value(0));
  const [indicatorPosition] = React.useState(new Animated.Value(0));

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
    };

    switch (variant) {
      case 'pills':
        return {
          ...baseStyle,
          backgroundColor: theme.colors.gray[100],
          borderRadius: theme.borderRadius.lg,
          padding: 4,
        };
      case 'underline':
        return {
          ...baseStyle,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: theme.colors.gray[100],
          borderRadius: theme.borderRadius.lg,
          padding: 4,
        };
    }
  };

  const getTabStyle = (isActive: boolean): ViewStyle => {
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 6 },
      md: { paddingHorizontal: 16, paddingVertical: 8 },
      lg: { paddingHorizontal: 20, paddingVertical: 10 },
    };

    const baseStyle: ViewStyle = {
      ...sizeStyles[size],
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    if (fullWidth && !scrollable) {
      baseStyle.flex = 1;
    }

    switch (variant) {
      case 'pills':
        return {
          ...baseStyle,
          borderRadius: theme.borderRadius.md,
          backgroundColor: isActive ? theme.colors.card : 'transparent',
          ...(isActive && theme.shadows.sm),
        };
      case 'underline':
        return {
          ...baseStyle,
          borderBottomWidth: 2,
          borderBottomColor: isActive ? theme.colors.primary[500] : 'transparent',
          marginBottom: -1,
        };
      default:
        return {
          ...baseStyle,
          borderRadius: theme.borderRadius.md,
          backgroundColor: isActive ? theme.colors.primary[500] : 'transparent',
        };
    }
  };

  const getTextStyle = (isActive: boolean) => {
    const sizeStyles = {
      sm: { fontSize: 12 },
      md: { fontSize: 14 },
      lg: { fontSize: 16 },
    };

    const color = (() => {
      if (variant === 'default') {
        return isActive ? '#FFFFFF' : theme.colors.text.secondary;
      }
      return isActive ? theme.colors.primary[600] : theme.colors.text.secondary;
    })();

    return {
      ...sizeStyles[size],
      color,
      fontWeight: isActive ? ('600' as const) : ('400' as const),
    };
  };

  const renderTabs = () => (
    <>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabChange(tab.key)}
            style={getTabStyle(isActive)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            {tab.icon && <View style={{ marginRight: 6 }}>{tab.icon}</View>}
            <Text style={getTextStyle(isActive)}>{tab.label}</Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: theme.colors.error[500],
                    marginLeft: 6,
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {tab.badge > 99 ? '99+' : tab.badge}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[getContainerStyle(), style]}
      >
        {renderTabs()}
      </ScrollView>
    );
  }

  return <View style={[getContainerStyle(), style]}>{renderTabs()}</View>;
};

/**
 * Scrollable horizontal filter chips
 */
interface FilterChip {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

interface FilterChipsProps {
  chips: FilterChip[];
  activeChips: string[];
  onChipToggle: (chipKey: string) => void;
  multiSelect?: boolean;
  style?: ViewStyle;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  chips,
  activeChips,
  onChipToggle,
  multiSelect = false,
  style,
}) => {
  const theme = useTheme();

  const handlePress = (chipKey: string) => {
    onChipToggle(chipKey);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.chipsContainer, style]}
    >
      {chips.map((chip) => {
        const isActive = activeChips.includes(chip.key);
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => handlePress(chip.key)}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? theme.colors.primary[500]
                  : theme.colors.gray[100],
                borderColor: isActive
                  ? theme.colors.primary[500]
                  : theme.colors.gray[200],
              },
            ]}
          >
            {chip.icon && <View style={{ marginRight: 4 }}>{chip.icon}</View>}
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive ? '#FFFFFF' : theme.colors.text.secondary,
                },
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  chipsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TabBar;
