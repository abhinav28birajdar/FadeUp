/**
 * Rating Component
 * Star rating display and interactive rating selector
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

interface RatingDisplayProps {
  rating: number;
  maxRating?: number;
  size?: number;
  showValue?: boolean;
  showCount?: boolean;
  count?: number;
  style?: ViewStyle;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  maxRating = 5,
  size = 16,
  showValue = true,
  showCount = false,
  count = 0,
  style,
}) => {
  const theme = useTheme();

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < maxRating; i++) {
      let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';
      let iconColor = theme.colors.gray[300];

      if (i < fullStars) {
        iconName = 'star';
        iconColor = '#FBBF24'; // Gold/amber color for stars
      } else if (i === fullStars && hasHalfStar) {
        iconName = 'star-half';
        iconColor = '#FBBF24';
      }

      stars.push(
        <Ionicons
          key={i}
          name={iconName}
          size={size}
          color={iconColor}
          style={{ marginRight: 2 }}
        />
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      {showValue && (
        <Text
          style={[
            styles.ratingText,
            {
              fontSize: size * 0.875,
              color: theme.colors.text.primary,
              marginLeft: theme.spacing[1],
            },
          ]}
        >
          {rating.toFixed(1)}
        </Text>
      )}
      {showCount && count > 0 && (
        <Text
          style={[
            styles.countText,
            {
              fontSize: size * 0.75,
              color: theme.colors.text.muted,
              marginLeft: theme.spacing[1],
            },
          ]}
        >
          ({count})
        </Text>
      )}
    </View>
  );
};

/**
 * Interactive Rating Selector
 */
interface RatingSelectorProps {
  value: number;
  onChange: (rating: number) => void;
  maxRating?: number;
  size?: number;
  disabled?: boolean;
  style?: ViewStyle;
}

export const RatingSelector: React.FC<RatingSelectorProps> = ({
  value,
  onChange,
  maxRating = 5,
  size = 32,
  disabled = false,
  style,
}) => {
  const theme = useTheme();

  const handlePress = (index: number) => {
    if (!disabled) {
      onChange(index + 1);
    }
  };

  return (
    <View style={[styles.selectorContainer, style]}>
      {Array.from({ length: maxRating }).map((_, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => handlePress(index)}
          disabled={disabled}
          style={styles.starButton}
          accessibilityLabel={`Rate ${index + 1} star${index === 0 ? '' : 's'}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={index < value ? 'star' : 'star-outline'}
            size={size}
            color={index < value ? '#FBBF24' : theme.colors.gray[300]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Rating Breakdown Chart
 */
interface RatingBreakdownProps {
  ratings: { stars: number; count: number }[];
  totalReviews: number;
  style?: ViewStyle;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  ratings,
  totalReviews,
  style,
}) => {
  const theme = useTheme();

  const sortedRatings = [...ratings].sort((a, b) => b.stars - a.stars);

  return (
    <View style={style}>
      {sortedRatings.map(({ stars, count }) => {
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return (
          <View key={stars} style={styles.breakdownRow}>
            <Text
              style={[
                styles.starsLabel,
                { color: theme.colors.text.secondary, fontSize: 14 },
              ]}
            >
              {stars}
            </Text>
            <Ionicons name="star" size={12} color="#FBBF24" style={{ marginLeft: 2 }} />
            <View
              style={[
                styles.progressContainer,
                { backgroundColor: theme.colors.gray[200], marginHorizontal: 8 },
              ]}
            >
              <View
                style={[
                  styles.progressBar,
                  { width: `${percentage}%`, backgroundColor: '#FBBF24' },
                ]}
              />
            </View>
            <Text
              style={[
                styles.countLabel,
                { color: theme.colors.text.muted, fontSize: 12 },
              ]}
            >
              {count}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '600',
  },
  countText: {
    fontWeight: '400',
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    padding: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsLabel: {
    width: 16,
    textAlign: 'right',
  },
  progressContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  countLabel: {
    width: 32,
    textAlign: 'right',
  },
});

export default RatingDisplay;
