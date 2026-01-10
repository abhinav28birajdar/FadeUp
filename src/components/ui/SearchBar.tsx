/**
 * SearchBar Component
 * Search input with filters and recent searches
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';
import { useTheme } from '../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  onFilterPress?: () => void;
  showFilter?: boolean;
  activeFiltersCount?: number;
  autoFocus?: boolean;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onBlur,
  onSubmit,
  onFilterPress,
  showFilter = false,
  activeFiltersCount = 0,
  autoFocus = false,
  style,
}) => {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
    inputRef.current?.focus();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.input.background,
          borderColor: isFocused ? theme.colors.primary[500] : theme.colors.input.border,
        },
        style,
      ]}
    >
      <Ionicons
        name="search"
        size={20}
        color={theme.colors.text.muted}
        style={styles.searchIcon}
      />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.input.placeholder}
        style={[
          styles.input,
          {
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.base,
          },
        ]}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Ionicons
            name="close-circle"
            size={18}
            color={theme.colors.text.muted}
          />
        </TouchableOpacity>
      )}
      {showFilter && (
        <TouchableOpacity
          onPress={onFilterPress}
          style={[
            styles.filterButton,
            {
              backgroundColor:
                activeFiltersCount > 0
                  ? theme.colors.primary[500]
                  : theme.colors.gray[100],
            },
          ]}
        >
          <Ionicons
            name="options"
            size={18}
            color={activeFiltersCount > 0 ? '#FFFFFF' : theme.colors.text.secondary}
          />
          {activeFiltersCount > 0 && (
            <View
              style={[
                styles.filterBadge,
                { backgroundColor: theme.colors.error[500] },
              ]}
            >
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

/**
 * Search Screen Header with back button
 */
interface SearchHeaderProps extends SearchBarProps {
  onBack: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onBack,
  ...searchBarProps
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.colors.background }]}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
      </TouchableOpacity>
      <SearchBar {...searchBarProps} style={styles.headerSearchBar} />
    </View>
  );
};

/**
 * Recent Searches List
 */
interface RecentSearchesProps {
  searches: string[];
  onSearchSelect: (search: string) => void;
  onClearAll: () => void;
  onRemoveSearch: (search: string) => void;
  style?: ViewStyle;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSearchSelect,
  onClearAll,
  onRemoveSearch,
  style,
}) => {
  const theme = useTheme();

  if (searches.length === 0) return null;

  return (
    <View style={[styles.recentContainer, style]}>
      <View style={styles.recentHeader}>
        <Text
          style={[
            styles.recentTitle,
            { color: theme.colors.text.primary },
          ]}
        >
          Recent Searches
        </Text>
        <TouchableOpacity onPress={onClearAll}>
          <Text
            style={[
              styles.clearAllText,
              { color: theme.colors.primary[500] },
            ]}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>
      {searches.map((search, index) => (
        <TouchableOpacity
          key={`${search}-${index}`}
          style={styles.recentItem}
          onPress={() => onSearchSelect(search)}
        >
          <Ionicons
            name="time-outline"
            size={18}
            color={theme.colors.text.muted}
            style={styles.recentIcon}
          />
          <Text
            style={[
              styles.recentText,
              { color: theme.colors.text.secondary },
            ]}
            numberOfLines={1}
          >
            {search}
          </Text>
          <TouchableOpacity
            onPress={() => onRemoveSearch(search)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="close"
              size={18}
              color={theme.colors.text.muted}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
  filterButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerSearchBar: {
    flex: 1,
  },
  recentContainer: {
    paddingHorizontal: 16,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  recentIcon: {
    marginRight: 12,
  },
  recentText: {
    flex: 1,
    fontSize: 14,
  },
});

export default SearchBar;
