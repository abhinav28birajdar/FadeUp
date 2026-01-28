import { View, ViewProps } from 'react-native';
import { Colors } from '../../constants/colors';

export type ThemedViewProps = ViewProps & {
    color?: string;
};

export function ThemedView({ style, color = Colors.background, ...otherProps }: ThemedViewProps) {
    return <View style={[{ backgroundColor: color }, style]} {...otherProps} />;
}
