import { Component, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { useThemedColors } from '@/lib/utils/theme';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-6">
          <Text className="text-lg font-bold text-red-600 text-center mb-4">
            Something went wrong
          </Text>
          <Text className="text-gray-600 text-center">Please restart the app and try again.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
