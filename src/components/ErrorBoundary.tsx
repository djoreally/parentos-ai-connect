import React, { Component, ErrorInfo, ReactNode } from 'react';
import posthog from 'posthog-js';
import ErrorFallback from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, we'll capture the error in PostHog
    if (import.meta.env.PROD) {
      posthog.capture('react_error', {
        $current_url: window.location.href,
        error_message: error.message,
        error_stack: error.stack,
        component_stack: errorInfo.componentStack,
      });
    }
  }
  
  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
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
          resetError={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;