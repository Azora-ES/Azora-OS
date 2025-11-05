/*
AZORA PROPRIETARY LICENSE
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved.
See LICENSE file for details.

WORLD-CLASS ERROR BOUNDARY FOR EDUCATION PLATFORM
Graceful error handling with recovery options and logging
*/

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorCount: number;
}

/**
 * World-class Error Boundary component for Sapiens Education Platform
 * 
 * Features:
 * - Graceful error recovery with retry mechanism
 * - Detailed error logging for debugging
 * - User-friendly error messages
 * - Automatic error reporting (optional)
 * - Reset functionality
 * - Prevention of infinite error loops
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 Error Boundary caught an error:', error);
      console.error('📚 Component Stack:', errorInfo.componentStack);
    }

    // Update state with error details
    this.setState((prevState) => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // TODO: Send error to logging service (e.g., Sentry)
    // this.logErrorToService(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary if resetKeys change
    if (this.state.hasError && prevProps.resetKeys !== this.props.resetKeys) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/sapiens';
  };

  render() {
    if (this.state.hasError) {
      // Prevent infinite error loops
      if (this.state.errorCount > 3) {
        return (
          <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-black flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-red-900/20 border border-red-500/30 rounded-2xl p-8 text-center">
              <Bug className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-300 mb-4">
                Critical Error Detected
              </h2>
              <p className="text-red-200 mb-6">
                We've detected repeated errors. Please refresh the page or contact support.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={this.handleReload}
                  className="flex-1 bg-red-600 hover:bg-red-500 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Go Home
                </button>
              </div>
            </div>
          </div>
        );
      }

      // Custom fallback UI if provided
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default beautiful error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-blue-950 to-indigo-950 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-lg">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full"></div>
                <AlertTriangle className="relative w-20 h-20 text-yellow-400 animate-pulse" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-4">
              Oops! Something Went Wrong
            </h2>
            
            <p className="text-lg text-purple-200 text-center mb-6">
              We encountered an unexpected error while loading this section. 
              Don't worry, your progress is safe!
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-black/50 rounded-xl p-4 mb-6 max-h-48 overflow-y-auto">
                <p className="text-xs text-red-300 font-mono mb-2">
                  <strong>Error:</strong> {this.state.error.message}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-gray-400 font-mono whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack.slice(0, 300)}...
                  </pre>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={this.resetErrorBoundary}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleReload}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 transition-all hover:scale-105"
              >
                <Home className="w-5 h-5" />
                <span>Go Home</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="mt-6 p-4 bg-blue-900/30 rounded-lg border border-blue-500/20">
              <p className="text-sm text-blue-200 text-center">
                💡 <strong>Need Help?</strong> If this error persists, please contact support at{' '}
                <a href="mailto:support@azora-os.ai" className="text-blue-300 underline hover:text-blue-200">
                  support@azora-os.ai
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-based error boundary for functional components
 * Use this in client components that need error handling
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}
