import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-dark-background justify-center items-center p-6">
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="items-center"
          >
            <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-6">
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
            
            <Text className="text-primary-light text-xl font-bold mb-2">
              Something went wrong
            </Text>
            
            <Text className="text-secondary-light text-center mb-6 leading-6">
              We encountered an unexpected error. Please try again.
            </Text>
            
            {__DEV__ && this.state.error && (
              <Text className="text-red-400 text-sm text-center mb-6 font-mono">
                {this.state.error.message}
              </Text>
            )}
            
            <Pressable
              onPress={this.handleReset}
              className="bg-brand-primary px-6 py-3 rounded-xl"
            >
              <Text className="text-dark-background font-semibold">
                Try Again
              </Text>
            </Pressable>
          </MotiView>
        </View>
      );
    }

    return this.props.children;
  }
}
