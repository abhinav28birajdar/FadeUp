import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/colors';
import { Typography } from '../../constants/typography';
import { Spacing } from '../../constants/spacing';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react-native';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        if (__DEV__) {
            console.error('Uncaught error:', error, errorInfo);
        } else {
            // Typically log to Crashlytics or Firestore here
        }
    }

    private handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    public render() {
        if (this.state.hasError) {
            return (
                <View style={styles.container}>
                    <AlertTriangle size={48} color={Colors.error} />
                    <Text style={[Typography.h2, styles.title, { color: Colors.text }]}>Oops!</Text>
                    <Text style={[Typography.body, styles.message, { color: Colors.textSecondary }]}>
                        Something went wrong. An error report has been logged.
                    </Text>
                    <Button
                        label="Try Again"
                        onPress={this.handleRetry}
                        variant="outline"
                    />
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        padding: Spacing.xl,
    },
    title: {
        marginTop: Spacing.md,
        marginBottom: Spacing.sm,
    },
    message: {
        textAlign: 'center',
        marginBottom: Spacing.xl,
    },
});
