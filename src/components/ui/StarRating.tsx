import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Star } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface StarRatingProps {
    rating: number;
    size?: number;
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
}

export function StarRating({ rating, size = 16, interactive = false, onRatingChange }: StarRatingProps) {
    const renderStars = () => {
        return [1, 2, 3, 4, 5].map((index) => {
            const isFilled = index <= rating;
            const isHalf = !isFilled && index - 0.5 <= rating;

            const StarComponent = interactive ? TouchableOpacity : View;
            const fillColor = isFilled || isHalf ? Colors.primary : Colors.border;
            // Lucide icon has 'fill' attribute handling, we can pass fill to make it solid if desired
            // React Native SVG supports fill attribute

            return (
                <StarComponent
                    key={index}
                    onPress={() => interactive && onRatingChange && onRatingChange(index)}
                    activeOpacity={interactive ? 0.7 : 1}
                    style={styles.starContainer}
                >
                    <Star
                        size={size}
                        color={fillColor}
                        fill={isFilled ? fillColor : 'none'}
                    />
                </StarComponent>
            );
        });
    };

    return <View style={styles.container}>{renderStars()}</View>;
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starContainer: {
        marginRight: Spacing.xs,
    },
});
