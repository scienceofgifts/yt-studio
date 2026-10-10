import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-[#101722] border border-red-500/30 text-[#F2EEE6] space-y-4 max-w-2xl mx-auto my-8 shadow-xl">
          <div className="flex items-center gap-3 text-red-400">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <h3 className="text-base font-bold">
              {this.props.fallbackTitle || 'Component Rendering Error'}
            </h3>
          </div>
          <p className="text-xs text-[#A1AEC0] leading-relaxed">
            An unexpected error occurred while rendering this section. The rest of the application remains fully functional.
          </p>
          {this.state.error?.message && (
            <div className="p-3 rounded-lg bg-[#0B1018] border border-[#1E2B3E] font-mono text-[11px] text-red-300 break-all">
              {this.state.error.message}
            </div>
          )}
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E8AE62] hover:bg-[#d89e52] text-[#0B1018] text-xs font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
