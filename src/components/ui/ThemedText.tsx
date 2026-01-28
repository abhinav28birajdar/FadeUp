import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';

export type ThemedTextProps = TextProps & {
    variant?: keyof typeof Typography.sizes;
    weight?: keyof typeof Typography.weights;
    color?: string;
    centered?: boolean;
};

export function ThemedText({
    style,
    variant = 'md',
    weight = 'regular',
    color = Colors.text,
    centered = false,
    ...rest
}: ThemedTextProps) {
    return (
        <Text
            style={[
                {
                    fontSize: Typography.sizes[variant],
                    lineHeight: Typography.lineHeights[variant],
                    fontWeight: Typography.weights[weight] as any,
                    color: color,
                    textAlign: centered ? 'center' : 'left',
                },
                style,
            ]}
            {...rest}
        />
    );
}
