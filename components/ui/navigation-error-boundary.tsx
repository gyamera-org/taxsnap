import React, { Component, ReactNode } from 'react';
import { Avatar } from './avatar';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  size?: number;
  onPress?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class NavigationErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    console.warn('NavigationErrorBoundary caught error:', error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Log the error for debugging
    console.warn('NavigationErrorBoundary error details:', {
      error: error.message,
      errorInfo,
      stack: error.stack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Check if the error is related to navigation context
      const isNavigationError = 
        this.state.error?.message?.includes('navigation context') ||
        this.state.error?.message?.includes('NavigationContainer') ||
        this.state.error?.message?.includes('router');

      if (isNavigationError) {
        // Render fallback UI for navigation errors
        return this.props.fallback || (
          <Avatar 
            size={this.props.size || 48} 
            onPress={this.props.onPress} 
          />
        );
      }
      
      // For other errors, re-throw
      throw this.state.error;
    }

    return this.props.children;
  }
}