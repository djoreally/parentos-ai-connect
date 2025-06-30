import React, { Component, ErrorInfo, ReactNode } from 'react';
import posthog from 'posthog-js';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Store error details in state for debugging
    this.setState({
      error,
      errorInfo
    });

    // In production, capture the error in PostHog
    if (import.meta.env.PROD) {
      posthog.capture('react_error', {
        $current_url: window.location.href,
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
        error_boundary: 'main',
      });
    }

    // Also log to console in development for debugging
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Caught Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }
  
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorFallback 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;