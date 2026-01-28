import React from 'react';
import { View, StyleSheet, SafeAreaView, ViewStyle, Platform, StatusBar as RNStatusBar } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/spacing';

interface ContainerProps {
    children: React.ReactNode;
    style?: ViewStyle;
    safeArea?: boolean;
    padding?: boolean;
    centered?: boolean;
}

export function Container({
    children,
    style,
    safeArea = true,
    padding = true,
    centered = false
}: ContainerProps) {
    const Wrapper = safeArea ? SafeAreaView : View;

    return (
        <Wrapper style={[styles.wrapper, style]}>
            <View
                style={[
                    styles.content,
                    padding && styles.padding,
                    centered && styles.centered,
                ]}
            >
                {children}
            </View>
        </Wrapper>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
    },
    padding: {
        paddingHorizontal: Spacing.screenPadding,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
